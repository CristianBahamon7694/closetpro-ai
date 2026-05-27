import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Helper to format currency in Colombian Pesos (COP).
 */
const formatCOP = (num) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(num);
};

/**
 * Robust semantic checker for low stock and replenishment queries.
 */
const isLowStockQuery = (q) => {
  const query = q.toLowerCase();
  
  // Specific phrases
  const phrases = [
    'bajo stock',
    'bajos de stock',
    'bajo de stock',
    'stock bajo',
    'stock critico',
    'stock crítico',
    'debo reabastecer',
    'reabastecer hoy',
    'reabastecer inventario',
    'pocas unidades',
    'pocas existencias',
    'por debajo del minimo',
    'por debajo del mínimo',
    'agotandose',
    'agotándose',
    'comprar nuevamente',
    'comprar de nuevo',
    'comprar nuevo',
    'necesitan reabastecimiento',
    'necesita reabastecimiento',
    'falta stock',
    'faltan unidades',
    'qué debo reabastecer',
    'que debo reabastecer',
    'qué productos reabastecer',
    'que productos reabastecer'
  ];

  if (phrases.some(p => query.includes(p))) {
    return true;
  }

  // Check semantic combinations: e.g. "reabastecer" / "reabastecimiento" / "comprar"
  const reabastecerKeywords = ['reabastecer', 'reabastecimiento', 'comprar', 'adquirir', 'restock', 'pedir'];
  const inventoryKeywords = ['producto', 'stock', 'inventario', 'unidades', 'mercancía', 'mercancia', 'prenda', 'ropa', 'catálogo', 'catalogo', 'existencias', 'nuevo', 'nuevamente'];

  const hasReabastecer = reabastecerKeywords.some(kw => query.includes(kw));
  const hasInventory = inventoryKeywords.some(kw => query.includes(kw));

  if (hasReabastecer && (hasInventory || query.includes('debo') || query.includes('que') || query.includes('qué') || query.includes('hoy'))) {
    return true;
  }

  // Check "pocas" or "bajo" combined with stock terms
  const quantifiers = ['pocas', 'pocos', 'bajo', 'bajos', 'mínimo', 'minimo', 'crítico', 'critico'];
  const stockTerms = ['unidades', 'existencias', 'prendas', 'stock', 'inventario'];
  
  for (const qf of quantifiers) {
    if (query.includes(qf)) {
      for (const st of stockTerms) {
        if (query.includes(st)) {
          return true;
        }
      }
    }
  }

  return false;
};

/**
 * --- MAIN REAL-TIME STRICT & FALLBACK CONVERSATIONAL COPILOT SERVICE ---
 */
export const geminiService = {
  /**
   * Premium Real-Time Inventory Copilot with Full Debug Logging.
   * Feeds simplified live inventory data into the Gemini model, performs real-time analytics,
   * prevents hallucinations, and enforces clean non-markdown SaaS-like responses.
   * Prints stage logs in the browser console. Falls back to a clean, direct local conversational solver if the key is missing.
   */
  askStylist: async (query, products = [], _sales = [], history = []) => {
    const normalizedQuery = query.trim().toLowerCase();

    // Satisfy strict ESLint unused variable rules
    if (_sales) { /* no-op */ }

    console.log('[Copilot Pipeline] 1. Raw User Message Received:', query);

    // --- STEP 1: TOKEN OPTIMIZATION & DATA SIMPLIFICATION ---
    const simplifiedProducts = products.map(p => ({
      name: p.name,
      stock: p.stock,
      price: p.price,
      category: p.category,
      sales: p.salesCount || p.sales || 0,
      sku: p.sku || `PROD-${String(p.id).slice(0, 4).toUpperCase()}`
    }));

    console.log('[Copilot Pipeline] 2. Injecting Simplified Real-Time Context:', simplifiedProducts);

    // --- STEP 2: OUT-OF-SCOPE FILTER ---
    const unrelatedKeywords = [
      'python', 'javascript', 'html', 'programacion', 'escribe un codigo', 'script', 'react', 'css',
      'matematica', 'calcula 2', 'ecuacion', 'historia de', 'geografia', 'quien fue', 'dime un chiste',
      'receta de', 'cocina', 'filosofia', 'poema', 'capital de', 'francia', 'clima', 'chiste', 'cancion',
      'futbol', 'deporte', 'musica', 'pelicula'
    ];

    const inventoryKeywords = [
      'stock', 'inventario', 'producto', 'venta', 'precio', 'categoria', 'agotado', 'repetido', 'duplicado',
      'mas caro', 'menos stock', 'mayor stock', 'menos unidades', 'mas unidades', 'reabastecer', 'restock',
      'margen', 'ganancia', 'bodega', 'comercial', 'boutique', 'tienda', 'operacion', 'cuanto vale',
      'valorizacion', 'promedio', 'bestseller', 'rotacion', 'estrella'
    ];

    const isUnrelated = unrelatedKeywords.some(keyword => normalizedQuery.includes(keyword)) ||
      (!inventoryKeywords.some(keyword => normalizedQuery.includes(keyword)) && 
       normalizedQuery.length > 3 && 
       !normalizedQuery.includes('hola') && 
       !normalizedQuery.includes('buenos dias') && 
       !normalizedQuery.includes('buenas tardes') &&
       !normalizedQuery.includes('gracias'));

    if (isUnrelated) {
      console.warn('[Copilot Pipeline] Out of scope filter triggered!');
      const outOfScopeResponse = {
        intent: 'out_of_scope',
        text: "Solo puedo ayudarte con análisis relacionados con inventario, productos, ventas y operación comercial.",
        recommendedItems: []
      };
      console.log('[Copilot Pipeline] Final parsed response returned to UI:', outOfScopeResponse);
      return outOfScopeResponse;
    }

    // --- STEP 2.5: SEMANTIC LOW STOCK DETECTION LAYER ---
    if (isLowStockQuery(normalizedQuery)) {
      const lowStockProducts = products.filter(p => {
        const minStockLimit = typeof p.minStock === 'number' ? p.minStock : 5;
        return p.stock <= minStockLimit || p.stock <= 10;
      });

      // Sort ascending by stock quantity
      lowStockProducts.sort((a, b) => a.stock - b.stock);

      if (lowStockProducts.length === 0) {
        const result = {
          intent: 'low_stock',
          text: "Actualmente no tienes productos en estado de stock crítico.",
          recommendedItems: []
        };
        console.log('[Copilot Pipeline] Low stock query matched (0 results). Response:', result);
        return result;
      }

      const listStr = lowStockProducts.map(p => `${p.name} (${p.stock} unidades)`).join(', ');
      const result = {
        intent: 'low_stock',
        text: `Los productos con stock crítico o bajo el mínimo son: ${listStr}. Te recomiendo reabastecerlos pronto.`,
        recommendedItems: lowStockProducts
      };
      console.log('[Copilot Pipeline] Low stock query matched. Response:', result);
      return result;
    }

    // --- STEP 3: ROUTE TO REAL-TIME GEMINI AI WITH SIMPLIFIED CONTEXT ---
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    const keyExists = !!(apiKey && apiKey.trim() !== '' && apiKey !== 'YOUR_GEMINI_API_KEY');

    if (keyExists) {
      try {
        console.log('[Copilot Pipeline] 3. Initializing Gemini API call...');
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        let memoryText = "No hay mensajes previos.";
        if (history && history.length > 0) {
          const recent = history.slice(-4);
          memoryText = recent.map(msg => 
            `${msg.sender === 'user' ? 'Usuario' : 'Copiloto AI'}: ${msg.text}`
          ).join('\n');
        }

        const systemPrompt = `Eres un copiloto de inventario inteligente para ClosetPro AI. Respondes de forma directa, concisa y natural a las preguntas del usuario sobre el inventario actual.

INVENTARIO REAL (JSON):
${JSON.stringify(simplifiedProducts, null, 2)}

REGLAS DE RESPUESTA:
1. ALCANCE: Responde ÚNICAMENTE sobre inventario, productos, ventas, precios y operación comercial de la tienda. Si la pregunta no se relaciona con estos temas, responde cortésmente: "Solo puedo ayudarte con análisis relacionados con inventario, productos, ventas y operación comercial."
2. CERO ALUCINACIONES: NUNCA inventes productos, precios, stock o valores que no existan en el INVENTARIO REAL provisto. Si la información solicitada no existe en el inventario, indícalo claramente.
3. SIN MARKDOWN: No utilices ninguna sintaxis de markdown (negritas, cursivas, listas con asteriscos o guiones, títulos con almohadillas). Usa texto plano con saltos de línea normales para estructurar los párrafos.
4. ESTILO: Habla en español colombiano profesional, formal y moderno.
5. RESPUESTA DIRECTA: No uses introducciones repetitivas, saludos forzados, resúmenes de stock no solicitados ni plantillas de respuesta fijas. Responde directa y conversacionalmente a la pregunta del usuario utilizando los datos reales.
6. RECOMENDACIONES: Si y solo si recomiendas o analizas productos específicos del inventario en tu respuesta, incluye la etiqueta [RECOMENDADOS: SKU1, SKU2] al final del texto para que el sistema muestre sus fichas visuales (reemplaza SKU1, SKU2 con los SKUs reales correspondientes).

Historial de la sesión:
${memoryText}

Pregunta del usuario: "${query}"`;

        console.log('[Copilot Pipeline] 4. Generated Gemini Prompt:', systemPrompt);

        const result = await model.generateContent(systemPrompt);
        const response = await result.response;
        const text = response.text();

        console.log('[Copilot Pipeline] 5. Raw Gemini API Response:', text);

        if (text && text.trim().length > 0) {
          const recommendedItems = [];
          const match = text.match(/\[RECOMENDADOS:\s*([^\]]+)\]/i);
          if (match && match[1]) {
            const ids = match[1].split(',').map(id => id.trim());
            ids.forEach(id => {
              const matchedProduct = products.find(p => 
                String(p.sku).toLowerCase() === id.toLowerCase() || 
                String(p.id).toLowerCase() === id.toLowerCase()
              );
              if (matchedProduct) {
                recommendedItems.push(matchedProduct);
              }
            });
          }

          const cleanText = text.replace(/\[RECOMENDADOS:\s*[^\]]+\]/gi, '').trim();

          const finalResult = {
            intent: 'ai_recommendation',
            text: cleanText,
            recommendedItems,
            data: { query }
          };

          console.log('[Copilot Pipeline] 6. Final parsed response returned to UI:', finalResult);
          return finalResult;
        } else {
          throw new Error("Respuesta vacía del modelo Gemini");
        }
      } catch (error) {
        console.error('[Copilot Pipeline] Gemini API call failed, falling back to dynamic local solver:', error);
      }
    }

    // --- STEP 4: REAL-TIME CONVERSATIONAL FALLBACK SOLVER (Direct, Template-Free, Dynamic) ---
    console.warn('[Copilot Pipeline] Fallback solver activated. Mode is conversational local analysis. Key exists:', keyExists);

    if (!products || products.length === 0) {
      const fallbackEmpty = {
        intent: 'local_fallback_empty',
        text: "Actualmente no tienes ningún producto registrado en tu inventario.",
        recommendedItems: []
      };
      console.log('[Copilot Pipeline] Final parsed response returned to UI:', fallbackEmpty);
      return fallbackEmpty;
    }

    // A. "qué producto tiene más stock"
    if (normalizedQuery.includes('mayor stock') || normalizedQuery.includes('mas stock') || normalizedQuery.includes('mayor cantidad') || normalizedQuery.includes('mas unidades') || normalizedQuery.includes('más stock') || normalizedQuery.includes('más unidades')) {
      const sorted = [...products].sort((a, b) => b.stock - a.stock);
      const top = sorted[0];
      const resHighestStock = {
        intent: 'highest_stock',
        text: `El producto con mayor cantidad de existencias es ${top.name} con un total de ${top.stock} unidades en la categoría de ${top.category}. Su precio es de ${formatCOP(top.price)} y tiene la referencia ${top.sku}.`,
        recommendedItems: [top]
      };
      console.log('[Copilot Pipeline] Final parsed response returned to UI:', resHighestStock);
      return resHighestStock;
    }

    // B. "hay productos repetidos" / "duplicados"
    if (normalizedQuery.includes('duplicado') || normalizedQuery.includes('repetido') || normalizedQuery.includes('redundante')) {
      const skuMap = {};
      const nameMap = {};
      const duplicated = [];
      products.forEach(p => {
        const sku = (p.sku || `PROD-${String(p.id).slice(0, 4).toUpperCase()}`).trim().toUpperCase();
        const name = p.name.trim().toLowerCase();
        if (skuMap[sku] || nameMap[name]) {
          duplicated.push(p);
        } else {
          skuMap[sku] = true;
          nameMap[name] = true;
        }
      });

      if (duplicated.length > 0) {
        const listStr = duplicated.map(p => `${p.name} (${p.sku})`).join(', ');
        const resDuplicated = {
          intent: 'duplicated_products',
          text: `Sí, se detectaron los siguientes productos repetidos en el inventario: ${listStr}. Te recomiendo unificar sus registros.`,
          recommendedItems: duplicated
        };
        console.log('[Copilot Pipeline] Final parsed response returned to UI:', resDuplicated);
        return resDuplicated;
      } else {
        const resDuplicated = {
          intent: 'duplicated_products',
          text: "No se encontraron productos duplicados en tu catálogo. Todos los nombres y códigos SKU son únicos.",
          recommendedItems: []
        };
        console.log('[Copilot Pipeline] Final parsed response returned to UI:', resDuplicated);
        return resDuplicated;
      }
    }

    // C. "qué categoría vende más"
    if (normalizedQuery.includes('categoria vende mas') || normalizedQuery.includes('categoria que mas vende') || normalizedQuery.includes('vende mas por categoria') || normalizedQuery.includes('categoría vende más') || normalizedQuery.includes('categoría que más vende') || normalizedQuery.includes('más vende')) {
      const categories = {};
      products.forEach(p => {
        const cat = p.category || 'Otros';
        const sales = p.salesCount || 0;
        categories[cat] = (categories[cat] || 0) + sales;
      });

      let topCat = null;
      let topSales = -1;
      Object.keys(categories).forEach(cat => {
        if (categories[cat] > topSales) {
          topSales = categories[cat];
          topCat = cat;
        }
      });

      if (!topCat || topSales === 0) {
        const resNoSales = {
          intent: 'category_analysis',
          text: "No se registran ventas comerciales para ninguna categoría en el inventario actual.",
          recommendedItems: []
        };
        console.log('[Copilot Pipeline] Final parsed response returned to UI:', resNoSales);
        return resNoSales;
      }

      const resTopCategory = {
        intent: 'category_analysis',
        text: `La categoría con mayor volumen de ventas es ${topCat} con un acumulado de ${topSales} unidades vendidas.`,
        recommendedItems: products.filter(p => p.category === topCat).slice(0, 2)
      };
      console.log('[Copilot Pipeline] Final parsed response returned to UI:', resTopCategory);
      return resTopCategory;
    }

    // D. "qué categoría tiene más productos" / "categoria tiene mas productos"
    if (normalizedQuery.includes('categoria tiene mas productos') || normalizedQuery.includes('categoría tiene más productos') || normalizedQuery.includes('mas productos por categoria') || normalizedQuery.includes('más productos por categoría')) {
      const categoryCounts = {};
      products.forEach(p => {
        const cat = p.category || 'Otros';
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
      });
      let maxCat = null;
      let maxCount = -1;
      Object.keys(categoryCounts).forEach(cat => {
        if (categoryCounts[cat] > maxCount) {
          maxCount = categoryCounts[cat];
          maxCat = cat;
        }
      });

      const resCategoryVariety = {
        intent: 'category_analysis',
        text: `La categoría que contiene la mayor variedad de productos es ${maxCat} con un total de ${maxCount} artículos distintos registrados.`,
        recommendedItems: products.filter(p => p.category === maxCat).slice(0, 2)
      };
      console.log('[Copilot Pipeline] Final parsed response returned to UI:', resCategoryVariety);
      return resCategoryVariety;
    }

    // E. "qué productos están agotados"
    if (normalizedQuery.includes('agotado') || normalizedQuery.includes('sin stock') || normalizedQuery.includes('stock cero') || normalizedQuery.includes('no disponible')) {
      const outOfStock = products.filter(p => p.stock === 0);
      if (outOfStock.length > 0) {
        const listStr = outOfStock.map(p => p.name).join(', ');
        const resAgotados = {
          intent: 'out_of_stock',
          text: `Los productos actualmente agotados son: ${listStr}.`,
          recommendedItems: outOfStock
        };
        console.log('[Copilot Pipeline] Final parsed response returned to UI:', resAgotados);
        return resAgotados;
      } else {
        const resAgotados = {
          intent: 'out_of_stock',
          text: "No tienes ningún producto agotado en el inventario. Todo tu catálogo cuenta con disponibilidad.",
          recommendedItems: []
        };
        console.log('[Copilot Pipeline] Final parsed response returned to UI:', resAgotados);
        return resAgotados;
      }
    }

    // F. "cuál es el producto más caro"
    if (normalizedQuery.includes('mas caro') || normalizedQuery.includes('mas costoso') || normalizedQuery.includes('mayor precio') || normalizedQuery.includes('más caro') || normalizedQuery.includes('más costoso')) {
      const sorted = [...products].sort((a, b) => b.price - a.price);
      const top = sorted[0];
      const resCaro = {
        intent: 'average_prices',
        text: `El artículo más costoso en el inventario es ${top.name} con un precio de ${formatCOP(top.price)} pesos colombianos en la categoría de ${top.category}.`,
        recommendedItems: [top]
      };
      console.log('[Copilot Pipeline] Final parsed response returned to UI:', resCaro);
      return resCaro;
    }

    // G. "bajo stock" / "stock critico" / "reabastecer"
    if (isLowStockQuery(normalizedQuery)) {
      const lowStockProducts = products.filter(p => {
        const minStockLimit = typeof p.minStock === 'number' ? p.minStock : 5;
        return p.stock <= minStockLimit || p.stock <= 10;
      });

      // Sort ascending by stock quantity
      lowStockProducts.sort((a, b) => a.stock - b.stock);

      if (lowStockProducts.length === 0) {
        const resBajoStock = {
          intent: 'low_stock',
          text: "Actualmente no tienes productos en estado de stock crítico.",
          recommendedItems: []
        };
        console.log('[Copilot Pipeline] Final parsed response returned to UI:', resBajoStock);
        return resBajoStock;
      }

      const listStr = lowStockProducts.map(p => `${p.name} (${p.stock} unidades)`).join(', ');
      const resBajoStock = {
        intent: 'low_stock',
        text: `Los productos con stock crítico o bajo el mínimo son: ${listStr}. Te recomiendo reabastecerlos pronto.`,
        recommendedItems: lowStockProducts
      };
      console.log('[Copilot Pipeline] Final parsed response returned to UI:', resBajoStock);
      return resBajoStock;
    }

    // H. Price filtering fallback (e.g. "más de 200000", "por encima de 500 mil", "qué productos cuestan...")
    const priceKeywords = ['precio', 'cuestan', 'cuesta', 'valen', 'vale', 'valor'];
    const hasPriceKeyword = priceKeywords.some(keyword => normalizedQuery.includes(keyword)) ||
      /más de|mas de|por encima de|mayor a|mayores a|menor a|menores a|por debajo de|bajo de/i.test(normalizedQuery);

    if (hasPriceKeyword) {
      const numberRegex = /(\d+(?:[.,]\d+)?)\s*(mil)?/gi;
      let match;
      let targetPrice = null;

      while ((match = numberRegex.exec(normalizedQuery)) !== null) {
        const cleanNumStr = match[1].replace(/[.,]/g, '');
        let value = parseFloat(cleanNumStr);
        if (match[2] && match[2].toLowerCase() === 'mil') {
          value = value * 1000;
        }
        if (!isNaN(value)) {
          targetPrice = value;
          break;
        }
      }

      if (targetPrice !== null) {
        const isGreaterThan = !/menor|bajo|por debajo/i.test(normalizedQuery);
        const filteredProducts = isGreaterThan
          ? products.filter(p => p.price > targetPrice)
          : products.filter(p => p.price < targetPrice);
        const relationText = isGreaterThan ? 'mayores a' : 'menores a';

        if (filteredProducts.length > 0) {
          if (isGreaterThan) {
            filteredProducts.sort((a, b) => b.price - a.price);
          } else {
            filteredProducts.sort((a, b) => a.price - b.price);
          }

          const listStr = filteredProducts.map(p => `${p.name} (${formatCOP(p.price)})`).join(', ');
          const resPriceFilter = {
            intent: 'price_filtered',
            text: `Los productos con precios ${relationText} ${formatCOP(targetPrice)} son: ${listStr}.`,
            recommendedItems: filteredProducts.slice(0, 3)
          };
          console.log('[Copilot Pipeline] Final parsed response returned to UI:', resPriceFilter);
          return resPriceFilter;
        } else {
          const resPriceFilterEmpty = {
            intent: 'price_filtered',
            text: `No encontré productos con precios ${relationText} ${formatCOP(targetPrice)} en tu catálogo actual.`,
            recommendedItems: []
          };
          console.log('[Copilot Pipeline] Final parsed response returned to UI:', resPriceFilterEmpty);
          return resPriceFilterEmpty;
        }
      }
    }

    // General Direct Fallback or Conversational Guidance
    const isSummaryRequest = normalizedQuery.includes('resumen') ||
                            normalizedQuery.includes('balance') ||
                            normalizedQuery.includes('general') ||
                            normalizedQuery.includes('total') ||
                            normalizedQuery.includes('tienda') ||
                            normalizedQuery.includes('inventario');

    if (isSummaryRequest) {
      const totalStock = products.reduce((acc, p) => acc + (p.stock || 0), 0);
      const totalValue = products.reduce((acc, p) => acc + ((p.price || 0) * (p.stock || 0)), 0);
      const resGeneral = {
        intent: 'local_fallback_advice',
        text: `Tu tienda cuenta con ${products.length} productos registrados y un stock total de ${totalStock} prendas, valorado en ${formatCOP(totalValue)}. ¿Qué análisis o dato en particular deseas conocer hoy?`,
        recommendedItems: []
      };
      console.log('[Copilot Pipeline] Final parsed response returned to UI:', resGeneral);
      return resGeneral;
    }

    const resGuidance = {
      intent: 'local_fallback_guidance',
      text: 'No encontré productos específicos para tu consulta en el inventario o no comprendo la pregunta. ¿Deseas saber sobre stock, categorías, productos repetidos, agotados o precios?',
      recommendedItems: []
    };
    console.log('[Copilot Pipeline] Final parsed response returned to UI:', resGuidance);
    return resGuidance;
  }
};