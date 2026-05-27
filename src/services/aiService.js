import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Service to generate inventory insights using Gemini AI.
 * If VITE_GEMINI_API_KEY is not defined or the call fails, 
 * it falls back to a highly dynamic, context-aware rule-based generator
 * in premium Colombian Spanish.
 * 
 * @param {Array} products - List of current inventory products
 * @returns {Promise<string>} Beautifully formatted insight recommendation text
 */
export const generateInventoryInsights = async (products = []) => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    if (apiKey && apiKey.trim() !== '' && apiKey !== 'YOUR_GEMINI_API_KEY') {
        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

            const productsSummary = products.map(p =>
                `- ${p.name} (SKU: ${p.sku}, Categoría: ${p.category}, Stock: ${p.stock}, Mínimo: ${p.minStock}, Precio: $${p.price})`
            ).join('\n');

            const systemPrompt = `Eres el asesor de Inteligencia Artificial experto de ClosetPro AI, una plataforma premium de control de inventarios para tiendas de moda en Colombia.
Tu tarea es analizar el inventario actual y redactar un informe estratégico premium, conciso y motivador de 3 a 5 puntos clave.
Habla en español colombiano formal pero moderno, utilizando términos como "stock", "ventas", "inventario", "reabastecimiento".
No uses viñetas genéricas de markdown con asteriscos si puedes usar emojis de SaaS modernos. Escribe en un formato limpio.

Aquí está el inventario actual:
${productsSummary || 'No hay productos en el inventario actualmente.'}

Redacta recomendaciones concretas sobre:
1. Alertas de stock crítico (productos con stock inferior o igual al mínimo).
2. Oportunidades de comercialización o rotación.
3. Análisis de valorización total o categorías estrella.
Mantén las respuestas concisas para que quepan de manera elegante en una tarjeta de dashboard.`;

            const result = await model.generateContent(systemPrompt);
            const response = await result.response;
            const text = response.text();

            if (text && text.trim().length > 0) {
                return text;
            }
        } catch (error) {
            console.warn('Gemini API call failed, falling back to local smart analyzer:', error);
        }
    }

    // --- DYNAMIC SMART FALLBACK GENERATOR (COLOMBIAN SPANISH) ---
    if (!products || products.length === 0) {
        return `✨ ¡Bienvenido a ClosetPro AI! 

Para empezar a recibir recomendaciones inteligentes de inventario, agrega productos en la sección de Inventario. 

Nuestra IA analizará de forma automática:
• Artículos de alta y baja rotación.
• Pronósticos de agotamiento de stock.
• Estrategias de precios basadas en rentabilidad.`;
    }

    // Calculations for smart response
    const totalStock = products.reduce((acc, p) => acc + (p.stock || 0), 0);
    const totalValue = products.reduce((acc, p) => acc + ((p.price || 0) * (p.stock || 0)), 0);
    const criticalProducts = products.filter(p => p.stock <= p.minStock);

    // Group by category to find high value
    const categoryStats = {};
    products.forEach(p => {
        const cat = p.category || 'Sin Categoría';
        if (!categoryStats[cat]) {
            categoryStats[cat] = { count: 0, value: 0 };
        }
        categoryStats[cat].count++;
        categoryStats[cat].value += (p.price || 0) * (p.stock || 0);
    });

    let topCategory = 'N/A';
    let topCategoryValue = 0;
    Object.keys(categoryStats).forEach(cat => {
        if (categoryStats[cat].value > topCategoryValue) {
            topCategory = cat;
            topCategoryValue = categoryStats[cat].value;
        }
    });

    const formatCOP = (num) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(num);
    };

    // Generate dynamic, context-aware bullet points
    const points = [];

    // Point 1: Low Stock Alert
    if (criticalProducts.length > 0) {
        const names = criticalProducts.slice(0, 2).map(p => p.name).join(' y ');
        const restCount = criticalProducts.length - 2;
        const suffix = restCount > 0 ? ` y ${restCount} más` : '';
        points.push(`🚨 **Alerta de Stock Crítico**: Detectamos ${criticalProducts.length} producto(s) por debajo del límite mínimo, incluyendo **${names}${suffix}**. Te recomendamos programar un reabastecimiento urgente de al menos 15 unidades por artículo para evitar perder ventas.`);
    } else {
        points.push(`✅ **Niveles Saludables**: ¡Excelente! Todos tus productos cuentan con niveles de stock óptimos por encima del límite de seguridad. Mantienes un flujo de inventario estable.`);
    }

    // Point 2: Category insights
    if (topCategory !== 'N/A') {
        points.push(`📊 **Dominio de Categoría**: La categoría **${topCategory}** representa la mayor valorización en bodega con un total de **${formatCOP(topCategoryValue)}**. Considera priorizar promociones cruzadas con esta línea para acelerar la liquidez.`);
    }

    // Point 3: Pricing and turnover
    const highValueItem = [...products].sort((a, b) => b.price - a.price)[0];
    if (highValueItem && highValueItem.stock > 0) {
        points.push(`💎 **Foco de Alta Gama**: Tu producto de mayor valor disponible es **${highValueItem.name}** con un precio de **${formatCOP(highValueItem.price)}**. Te sugerimos posicionarlo en los banners principales de venta o vitrinas digitales para maximizar tu ticket promedio.`);
    }

    // Point 4: Overall health suggestion
    if (totalStock > 100) {
        points.push(`📦 **Optimización Financiera**: Cuentas con un inventario de ${totalStock} prendas valoradas en **${formatCOP(totalValue)}**. Sugerimos monitorear los artículos con más de 45 días sin rotación para liquidarlos y liberar capital de trabajo.`);
    } else {
        points.push(`🚀 **Plan de Crecimiento**: Tu stock total es de ${totalStock} unidades. A medida que expandas tu catálogo, la IA identificará patrones estacionales de compra para anticipar tus pedidos semanales de forma predictiva.`);
    }

    return `✨ **Análisis Inteligente de Inventario**
He procesado la información de tu inventario actual en tiempo real y obtuve los siguientes hallazgos estratégicos:

${points.join('\n\n')}

*Actualizado automáticamente con base en tus productos registrados.*`;
};
