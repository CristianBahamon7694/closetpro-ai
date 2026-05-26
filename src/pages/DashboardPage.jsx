import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useInventory } from '../context/InventoryContext';
import { formatCOP, formatCompactCOP } from '../utils/format';
import { generateInventoryInsights } from '../services/aiService';
import {
  FolderHeart,
  Sparkles,
  DollarSign,
  AlertTriangle,
  Plus,
  TrendingUp,
  Sparkle,
  ArrowRight,
  TrendingDown,
  ShoppingBag,
  X,
  Search,
  CheckCircle,
  BrainCircuit
} from 'lucide-react';
import GlassCard from '../components/GlassCard';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts';

const parseAIResponseToUI = (text) => {
  const lines = text.split('\n');
  const blocks = [];
  let tempMetrics = [];
  
  const flushMetrics = () => {
    if (tempMetrics.length > 0) {
      blocks.push({
        type: 'metrics_group',
        items: tempMetrics
      });
      tempMetrics = [];
    }
  };
  
  for (let line of lines) {
    let trimmed = line.trim();
    if (!trimmed) {
      flushMetrics();
      continue;
    }
    
    const titleMatch = trimmed.match(/^(✨|🚨|📊|💰|🏷️|🔥|⚠️|✅)\s*\*\*?([^*]+)\*\*?/);
    const simpleTitleMatch = trimmed.match(/^([^*]+):\s*$/);
    
    if (titleMatch) {
      flushMetrics();
      blocks.push({
        type: 'title',
        emoji: titleMatch[1],
        title: titleMatch[2].replace(/[#*]/g, '').trim()
      });
    } else if (simpleTitleMatch) {
      flushMetrics();
      blocks.push({
        type: 'subtitle',
        title: simpleTitleMatch[1].replace(/[#*]/g, '').trim()
      });
    } else if (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.match(/^\d+\./)) {
      let cleanText = trimmed.replace(/^[•\-\d.]+\s*/, '').trim();
      
      const kvMatch = cleanText.match(/^\*\*?([^*:]+)\*\*?:\s*(.+)$/);
      if (kvMatch) {
        tempMetrics.push({
          label: kvMatch[1].trim(),
          value: kvMatch[2].replace(/[#*]/g, '').trim()
        });
      } else {
        flushMetrics();
        blocks.push({
          type: 'bullet',
          content: cleanText.replace(/[#*]/g, '').trim()
        });
      }
    } else {
      flushMetrics();
      
      const inlineBoldMatch = trimmed.match(/^\*\*?([^*]+)\*\*?$/);
      if (inlineBoldMatch) {
        blocks.push({
          type: 'subtitle',
          title: inlineBoldMatch[1].trim()
        });
      } else {
        blocks.push({
          type: 'paragraph',
          content: trimmed.replace(/[#*]/g, '').trim()
        });
      }
    }
  }
  flushMetrics();
  
  return blocks;
};

export const DashboardPage = () => {
  const { products, sales, loading, recordSale } = useInventory();
  const navigate = useNavigate();

  // Quick Sale Modal & Toast States
  const [quickSaleOpen, setQuickSaleOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Tarjeta');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [aiInsights, setAiInsights] = useState('');
  const [loadingAI, setLoadingAI] = useState(false);

  const handleGenerateInsights = async () => {
    setLoadingAI(true);

    const response = await generateInventoryInsights(products);

    setAiInsights(response);

    setLoadingAI(false);
  };

  // 1. LOADING STATE FOR PREMIUM EXPERIENCE
  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center glass-panel rounded-2xl border border-white/5">
        <div className="relative w-16 h-16">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-500/20 rounded-full"></div>
          <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  // 2. CALCULATE OVERVIEW METRICS CONNECTED TO REAL SUPABASE
  const totalProducts = products.length;

  // Total retail valuation (price * stock)
  const totalValue = products.reduce((acc, curr) => acc + ((curr.price || 0) * (curr.stock || 0)), 0);

  // Total items currently in stock
  const totalStock = products.reduce((acc, curr) => acc + (curr.stock || 0), 0);

  // Low stock products count (stock <= minStock)
  const lowStockCount = products.filter(p => p.stock <= p.minStock).length;

  // 3. PREPARE RECHARTS DATA
  // Dynamic Real Sales Trend Data aggregation (exclusive to real user sales)
  const getSalesTrendData = () => {
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const monthlyTotals = {};

    // Aggregate real sales totals by calendar month
    sales.forEach(sale => {
      if (!sale.date) return;
      const dateObj = new Date(sale.date);
      const monthName = months[dateObj.getMonth()];
      monthlyTotals[monthName] = (monthlyTotals[monthName] || 0) + (sale.total || 0);
    });

    // Populate chronological last 5 months
    const today = new Date();
    const last5Months = [];
    for (let i = 4; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthName = months[d.getMonth()];
      last5Months.push({
        name: monthName,
        Ventas: monthlyTotals[monthName] || 0
      });
    }

    return last5Months;
  };

  const salesTrendData = getSalesTrendData();

  // Category Distribution data from real user products only
  const categories = ['Tops', 'Bottoms', 'Outerwear', 'Footwear', 'Accessories'];
  const colors = ['#6366f1', '#a855f7', '#ec4899', '#f43f5e', '#e11d48'];

  const categoryData = categories.map(cat => {
    const count = products.filter(p => p.category.toLowerCase() === cat.toLowerCase()).length;
    return { name: cat, count };
  }).filter(c => c.count > 0);

  // Dynamic AI suggestion generator reacting to live data thresholds
  const getAIRecommendation = () => {
    const criticalProduct = products.find(p => p.stock <= p.minStock);
    if (criticalProduct) {
      return `Detectamos niveles críticos en <strong>${criticalProduct.name}</strong> (solo ${criticalProduct.stock} unidades en stock). Dado su nivel de stock actual, sugerimos realizar un reabastecimiento de <strong>15 unidades</strong> para evitar quiebres de inventario.`;
    }

    if (products.length > 0) {
      return "¡Excelente trabajo! Todo tu inventario se encuentra saludable y con niveles óptimos de stock. Sigue registrando tus ventas diarias para mantener tus métricas actualizadas.";
    }

    return "¡Bienvenido a ClosetPro AI! Agrega tu primer producto en la pestaña <strong>Inventario</strong> para que nuestra IA pueda comenzar a analizar tu catálogo y sugerir reabastecimientos inteligentes.";
  };

  const aiRecommendationText = getAIRecommendation();

  const handleQuickSaleOpen = () => {
    setQuickSaleOpen(true);
    setSelectedProductId('');
    setQuantity('1');
    setSearchQuery('');
    setDropdownOpen(false);
    setPaymentMethod('Tarjeta');
  };

  const handleSelectProduct = (product) => {
    setSelectedProductId(product.id);
    setQuantity(product.stock > 0 ? '1' : '0');
    setDropdownOpen(false);
  };

  const handleQuantityChange = (val) => {
    // Only allow digits or empty string
    if (val === '' || /^\d+$/.test(val)) {
      setQuantity(val);
    }
  };

  const selectedProduct = products.find(p => p.id === selectedProductId);
  const currentStock = selectedProduct ? selectedProduct.stock : 0;
  const productPrice = selectedProduct ? selectedProduct.price : 0;

  const parsedQuantity = parseInt(quantity, 10) || 0;
  const estimatedTotal = productPrice * parsedQuantity;

  const isOutOfStock = selectedProductId && currentStock === 0;

  // Custom validations
  const isQuantityEmpty = quantity === '';
  const isQuantityZeroOrLess = selectedProductId && !isQuantityEmpty && (parsedQuantity <= 0);
  const isQuantityExceeded = selectedProductId && !isQuantityEmpty && (parsedQuantity > currentStock);
  const isQuantityInvalid = isQuantityEmpty || isQuantityZeroOrLess || isQuantityExceeded;
  const isSubmitDisabled = !selectedProductId || isOutOfStock || isQuantityInvalid;

  const handleRecordQuickSale = async (e) => {
    e.preventDefault();
    if (isSubmitDisabled) return;

    try {
      await recordSale([{ productId: selectedProductId, quantity: parsedQuantity }], paymentMethod);
      setQuickSaleOpen(false);
      setToastMessage(`¡Venta de ${selectedProduct.name} (x${parsedQuantity}) registrada con éxito!`);
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
      }, 4000);
    } catch (err) {
      console.error(err);
      alert('Error al registrar la venta.');
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Stagger entry animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 95,
        damping: 15
      }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8 relative"
    >

      {/* Welcome Title */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-display font-bold text-3xl text-white">Resumen del Inventario</h2>
          <p className="text-slate-400 text-sm">Aquí tienes un vistazo rápido al rendimiento comercial de tu tienda.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleQuickSaleOpen}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold border border-white/10 bg-slate-900 hover:bg-slate-800 hover:border-white/20 text-white flex items-center gap-1.5 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            <ShoppingBag className="h-4 w-4" /> Registrar Venta Rápida
          </button>

          <Link
            to="/inventory"
            className="glow-btn px-4 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white flex items-center gap-1.5 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            <Plus className="h-4 w-4" /> Añadir Producto
          </Link>
        </div>
      </motion.div>

      {/* METRIC CARD GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

        {/* Metric 1 */}
        <motion.div variants={itemVariants}>
          <GlassCard className="flex flex-col justify-between border-l-4 border-l-indigo-500 p-5 overflow-hidden min-w-0 h-full hover:-translate-y-1.5 hover:shadow-lg hover:shadow-indigo-500/10 hover:border-indigo-500/20 transition-all duration-300">
            <div className="flex items-start justify-between gap-2 w-full">
              <div className="min-w-0 flex-1">
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider block">Total de Productos</span>
                <span className="text-2xl lg:text-3xl xl:text-4xl font-bold text-white mt-1.5 block leading-tight break-words text-wrap truncate min-w-0">
                  {totalProducts}
                </span>
              </div>
              <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-2xl shrink-0">
                <FolderHeart className="h-6 w-6" />
              </div>
            </div>
            <span className="text-[10px] text-slate-500 mt-3 block">Variedad de artículos en catálogo</span>
          </GlassCard>
        </motion.div>

        {/* Metric 2 */}
        <motion.div variants={itemVariants}>
          <GlassCard className="flex flex-col justify-between border-l-4 border-l-purple-500 p-5 overflow-hidden min-w-0 h-full hover:-translate-y-1.5 hover:shadow-lg hover:shadow-purple-500/10 hover:border-purple-500/20 transition-all duration-300">
            <div className="flex items-start justify-between gap-2 w-full">
              <div className="min-w-0 flex-1">
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider block">Valor de Inventario</span>
                <span className="text-2xl lg:text-3xl xl:text-4xl font-bold text-white mt-1.5 block leading-tight break-words text-wrap truncate min-w-0" title={formatCOP(totalValue)}>
                  {formatCompactCOP(totalValue)}
                </span>
              </div>
              <div className="p-3 bg-purple-500/10 text-purple-400 rounded-2xl shrink-0">
                <DollarSign className="h-6 w-6" />
              </div>
            </div>
            <span className="text-[10px] text-slate-500 mt-3 block">Precio de venta estimado del stock</span>
          </GlassCard>
        </motion.div>

        {/* Metric 3 */}
        <motion.div variants={itemVariants}>
          <GlassCard className="flex flex-col justify-between border-l-4 border-l-pink-500 p-5 overflow-hidden min-w-0 h-full hover:-translate-y-1.5 hover:shadow-lg hover:shadow-pink-500/10 hover:border-pink-500/20 transition-all duration-300">
            <div className="flex items-start justify-between gap-2 w-full">
              <div className="min-w-0 flex-1">
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider block">Prendas en Stock</span>
                <span className="text-2xl lg:text-3xl xl:text-4xl font-bold text-white mt-1.5 block leading-tight break-words text-wrap truncate min-w-0">
                  {totalStock}
                </span>
              </div>
              <div className="p-3 bg-pink-500/10 text-pink-400 rounded-2xl shrink-0">
                <ShoppingBag className="h-6 w-6" />
              </div>
            </div>
            <span className="text-[10px] text-slate-500 mt-3 block">Suma física total en tienda</span>
          </GlassCard>
        </motion.div>

        {/* Metric 4 */}
        <motion.div variants={itemVariants}>
          <GlassCard className="flex flex-col justify-between border-l-4 border-l-rose-500 p-5 overflow-hidden min-w-0 h-full hover:-translate-y-1.5 hover:shadow-lg hover:shadow-rose-500/10 hover:border-rose-500/20 transition-all duration-300">
            <div className="flex items-start justify-between gap-2 w-full">
              <div className="min-w-0 flex-1">
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider block">Stock Crítico</span>
                <span className="text-2xl lg:text-3xl xl:text-4xl font-bold text-white mt-1.5 block leading-tight break-words text-wrap truncate min-w-0">
                  {lowStockCount}
                </span>
              </div>
              <div className="p-3 bg-rose-500/10 text-rose-400 rounded-2xl shrink-0">
                <AlertTriangle className="h-6 w-6" />
              </div>
            </div>
            <span className="text-[10px] text-rose-400 font-semibold mt-3 block">Productos bajo el límite mínimo</span>
          </GlassCard>
        </motion.div>

      </div>

      {/* CHARTS CONTAINER */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Main Sales Trend Chart */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <GlassCard className="hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-300 h-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display font-semibold text-lg text-white">Historial de Ventas</h3>
              <span className="text-xs text-slate-400 bg-white/5 border border-white/5 px-2.5 py-1 rounded-lg">Últimos 5 Meses (COP)</span>
            </div>
            <div className="h-64 sm:h-80 flex items-center justify-center">
              {sales.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={salesTrendData}>
                    <defs>
                      <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                    <XAxis dataKey="name" stroke="#6b7280" style={{ fontSize: 12 }} />
                    <YAxis stroke="#6b7280" style={{ fontSize: 12 }} />
                    <Tooltip
                      formatter={(value) => [formatCOP(value), 'Ventas']}
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '12px',
                        color: '#f3f4f6'
                      }}
                    />
                    <Area type="monotone" dataKey="Ventas" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSales)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-8">
                  <TrendingUp className="h-8 w-8 text-slate-700 mx-auto mb-2.5" />
                  <p className="text-slate-400 font-semibold text-sm">Las estadísticas aparecerán aquí</p>
                  <p className="text-slate-500 text-xs mt-1">Registra tu primera venta rápida para ver el historial de ventas.</p>
                </div>
              )}
            </div>
          </GlassCard>
        </motion.div>

        {/* Category distribution visual */}
        <motion.div variants={itemVariants}>
          <GlassCard className="hover:shadow-lg hover:shadow-purple-500/5 transition-all duration-300 h-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display font-semibold text-lg text-white">Distribución de Categorías</h3>
            </div>
            <div className="h-64 sm:h-80 flex flex-col justify-between">
              <div className="flex-1 min-h-[200px] flex items-center justify-center">
                {categoryData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="count"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          borderColor: 'rgba(255, 255, 255, 0.1)',
                          borderRadius: '12px',
                          color: '#f3f4f6'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-8">
                    <FolderHeart className="h-8 w-8 text-slate-700 mx-auto mb-2.5" />
                    <p className="text-slate-400 font-semibold text-sm">No hay datos todavía</p>
                    <p className="text-slate-500 text-xs mt-1">Agrega productos para comenzar a ver la distribución.</p>
                  </div>
                )}
              </div>

              {/* Color key indicator labels */}
              {categoryData.length > 0 && (
                <div className="grid grid-cols-2 gap-2 text-xs pt-4 border-t border-white/5">
                  {categoryData.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: colors[idx % colors.length] }}></span>
                      <span className="text-slate-400 truncate">{item.name} ({item.count})</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </GlassCard>
        </motion.div>

      </div>

      {/* QUICK PANEL & RECENT ITEMS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Premium AI Insights Glassmorphism Card */}
        <motion.div variants={itemVariants}>
          <GlassCard className="flex flex-col justify-between h-full hover:shadow-lg hover:shadow-purple-500/10 hover:border-purple-500/20 transition-all duration-300 relative overflow-hidden group">
            {/* Ambient Purple Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/10 rounded-full blur-2xl group-hover:bg-purple-600/20 transition-all duration-500 pointer-events-none" />

            <div>
              <div className="flex items-center gap-2 text-purple-400 mb-4">
                <BrainCircuit className="h-5 w-5 animate-pulse text-purple-400" />
                <h3 className="font-display font-semibold text-lg text-white">Análisis de ClosetPro AI</h3>
              </div>

              <div className="min-h-[160px] flex flex-col justify-center">
                {loadingAI ? (
                  <div className="flex flex-col items-center justify-center py-6 text-center">
                    <div className="relative w-12 h-12 mb-4">
                      <div className="absolute top-0 left-0 w-full h-full border-4 border-purple-500/20 rounded-full"></div>
                      <div className="absolute top-0 left-0 w-full h-full border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <p className="text-xs text-purple-300 font-medium animate-pulse">Generando insights estratégicos...</p>
                  </div>
                ) : aiInsights ? (
                  <div className="space-y-3.5 max-h-[360px] overflow-y-auto pr-1 no-scrollbar">
                    {parseAIResponseToUI(aiInsights).map((block, bIdx) => {
                      switch (block.type) {
                        case 'title':
                          const isCritical = block.title.toLowerCase().includes('crítico') || 
                                             block.title.toLowerCase().includes('alerta') ||
                                             block.emoji === '🚨' || block.emoji === '⚠️';
                          const isSuccess = block.emoji === '✅';
                          
                          return (
                            <motion.div
                              key={bIdx}
                              initial={{ opacity: 0, x: -5 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: bIdx * 0.03 }}
                              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border font-display ${
                                isCritical 
                                  ? 'bg-rose-500/10 border-rose-500/20 text-rose-300'
                                  : isSuccess
                                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                                    : 'bg-purple-500/10 border-purple-500/20 text-purple-300'
                              }`}
                            >
                              <span className="text-xs shrink-0">{block.emoji}</span>
                              <h4 className="text-[10px] font-bold uppercase tracking-wider leading-none">
                                {block.title}
                              </h4>
                            </motion.div>
                          );
                          
                        case 'subtitle':
                          return (
                            <motion.h5
                              key={bIdx}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: bIdx * 0.03 }}
                              className="text-[10px] font-bold text-slate-200 uppercase tracking-widest mt-3 mb-1.5 border-l-2 border-purple-500 pl-2"
                            >
                              {block.title}
                            </motion.h5>
                          );
                          
                        case 'paragraph':
                          return (
                            <motion.p
                              key={bIdx}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: bIdx * 0.03 }}
                              className="text-[11px] text-slate-300 leading-relaxed font-normal"
                            >
                              {block.content}
                            </motion.p>
                          );
                          
                        case 'bullet':
                          return (
                            <motion.div
                              key={bIdx}
                              initial={{ opacity: 0, x: -5 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: bIdx * 0.03 }}
                              className="flex items-start gap-2 text-[11px] text-slate-300 pl-1 py-0.5"
                            >
                              <span className="text-purple-400 mt-1 shrink-0">•</span>
                              <span className="leading-relaxed">{block.content}</span>
                            </motion.div>
                          );
                          
                        case 'metrics_group':
                          return (
                            <motion.div
                              key={bIdx}
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: bIdx * 0.03 }}
                              className="bg-slate-950/40 border border-white/5 rounded-xl p-3 space-y-2 my-2.5 shadow-inner"
                            >
                              {block.items.map((m, mIdx) => (
                                <div key={mIdx} className="flex justify-between items-center text-[10px] py-0.5 border-b border-white/[0.03] last:border-b-0 last:pb-0">
                                  <span className="text-slate-400 font-medium">{m.label}</span>
                                  <span className="font-bold text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-500/25 font-mono">
                                    {m.value}
                                  </span>
                                </div>
                              ))}
                            </motion.div>
                          );
                          
                        default:
                          return null;
                      }
                    })}
                  </div>
                ) : (
                  <div className="text-center py-6 text-slate-500 text-xs leading-relaxed">
                    La IA analizará tu inventario y generará recomendaciones inteligentes.
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={handleGenerateInsights}
              disabled={loadingAI}
              className="w-full mt-6 py-3 bg-gradient-to-r from-purple-600/25 to-indigo-600/25 hover:from-purple-600/40 hover:to-indigo-600/40 border border-purple-500/30 hover:border-purple-500/50 text-purple-200 font-semibold rounded-xl text-sm flex items-center justify-center gap-1.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01] cursor-pointer"
            >
              <Sparkles className="h-4 w-4 text-purple-300" /> Generar Insights con IA
            </button>
          </GlassCard>
        </motion.div>

        {/* Quick Style Suggestions Panel */}
        <motion.div variants={itemVariants}>
          <GlassCard className="flex flex-col justify-between h-full hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-300">
            <div>
              <div className="flex items-center gap-2 text-indigo-400 mb-4">
                <Sparkle className="h-5 w-5 fill-indigo-400/20 animate-float" />
                <h3 className="font-display font-semibold text-lg text-white">Recomendación IA</h3>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed mb-6" dangerouslySetInnerHTML={{ __html: aiRecommendationText }} />
            </div>
            <Link
              to="/assistant"
              className="w-full py-3 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 font-semibold rounded-xl text-sm flex items-center justify-center gap-1.5 transition-all"
            >
              Consultar Asistente de Ventas <ArrowRight className="h-4 w-4" />
            </Link>
          </GlassCard>
        </motion.div>

        {/* Recent Closet Additions */}
        <motion.div variants={itemVariants} className="lg:col-span-1">
          <GlassCard className="hover:shadow-lg hover:shadow-slate-500/5 transition-all duration-300 h-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display font-semibold text-lg text-white">Últimos Productos Registrados</h3>
              <Link to="/inventory" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                Ver Catálogo Completo
              </Link>
            </div>

            <div className="space-y-4">
              {products.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between gap-4 p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors overflow-hidden"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-lg bg-slate-900 border border-white/10 shrink-0 flex items-center justify-center text-indigo-400">
                      <ShoppingBag className="h-5 w-5 opacity-70" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm text-white leading-tight break-words line-clamp-2">
                        {item.name}
                      </h3>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-400 mt-1">
                        <span>SKU: {item.sku}</span>
                        <span>•</span>
                        <span>{item.category}</span>
                        <span>•</span>
                        <span className="text-indigo-400">Stock: {item.stock} u.</span>
                      </div>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className="font-bold text-white text-sm">{formatCOP(item.price)}</span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">{item.salesCount || 0} vendidas</span>
                  </div>
                </div>
              ))}

              {products.length === 0 && (
                <div className="text-center py-8 text-slate-500 text-sm">
                  No hay productos en catálogo. Haz clic en "Añadir Producto" para comenzar.
                </div>
              )}
            </div>
          </GlassCard>
        </motion.div>

      </div>

      {/* QUICK SALE MODAL */}
      <AnimatePresence>
        {quickSaleOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setQuickSaleOpen(false)}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 cursor-pointer"
            />

            {/* Modal Container */}
            <div className="fixed inset-0 flex items-center justify-center p-4 z-50 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                className="bg-slate-900 border border-white/10 rounded-2xl p-6 shadow-2xl max-w-md w-full pointer-events-auto overflow-hidden relative"
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-5">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl">
                      <ShoppingBag className="h-5 w-5" />
                    </div>
                    <h3 className="font-display font-bold text-lg text-white">Registrar Venta Rápida</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setQuickSaleOpen(false)}
                    className="p-1.5 rounded-lg border border-white/5 hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Form */}
                <form onSubmit={handleRecordQuickSale} className="space-y-4">

                  {/* Custom Searchable Product Selector */}
                  <div className="space-y-2 relative">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Producto</label>

                    {/* Trigger Button */}
                    <button
                      type="button"
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-white/10 hover:border-white/20 text-left text-sm text-slate-200 transition-colors flex items-center justify-between"
                    >
                      {selectedProduct ? (
                        <div className="flex items-center justify-between w-full pr-2">
                          <span className="font-medium text-white">{selectedProduct.name}</span>
                          <span className="text-xs px-2 py-0.5 rounded-md bg-white/5 text-slate-400 uppercase tracking-wide">
                            {selectedProduct.category}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-500">Seleccionar un producto...</span>
                      )}
                      <span className="border-l border-white/10 pl-2 text-slate-500 text-xs">▼</span>
                    </button>

                    {/* Searchable Dropdown List */}
                    <AnimatePresence>
                      {dropdownOpen && (
                        <>
                          <div className="fixed inset-0 z-30" onClick={() => setDropdownOpen(false)}></div>
                          <motion.div
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            transition={{ duration: 0.15 }}
                            className="absolute left-0 right-0 mt-1 bg-slate-950 border border-white/10 rounded-xl shadow-2xl z-40 max-h-60 overflow-y-auto no-scrollbar"
                          >
                            <div className="p-2 border-b border-white/5 sticky top-0 bg-slate-950 z-10">
                              <div className="relative">
                                <Search className="absolute left-2.5 top-2 h-4 w-4 text-slate-500" />
                                <input
                                  type="text"
                                  placeholder="Buscar por nombre o categoría..."
                                  value={searchQuery}
                                  onChange={(e) => setSearchQuery(e.target.value)}
                                  onClick={(e) => e.stopPropagation()}
                                  className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-white/10 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
                                />
                              </div>
                            </div>

                            <div className="p-1 space-y-0.5">
                              {filteredProducts.map((p) => {
                                const isProductOutOfStock = p.stock === 0;
                                return (
                                  <button
                                    key={p.id}
                                    type="button"
                                    onClick={() => handleSelectProduct(p)}
                                    className={`w-full text-left px-3 py-2.5 rounded-lg text-xs flex items-center justify-between transition-colors ${selectedProductId === p.id
                                      ? 'bg-indigo-600/20 text-indigo-300'
                                      : 'hover:bg-white/5 text-slate-300'
                                      }`}
                                  >
                                    <div className="min-w-0 pr-2">
                                      <p className="font-semibold truncate text-white">{p.name}</p>
                                      <p className="text-[10px] text-slate-500 mt-0.5">{p.category}</p>
                                    </div>
                                    <div className="shrink-0 text-right">
                                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${isProductOutOfStock
                                        ? 'bg-rose-500/10 text-rose-400'
                                        : 'bg-indigo-500/10 text-indigo-400'
                                        }`}>
                                        {isProductOutOfStock ? 'Agotado' : `${p.stock} disp.`}
                                      </span>
                                    </div>
                                  </button>
                                );
                              })}
                              {filteredProducts.length === 0 && (
                                <p className="text-slate-500 text-xs py-4 text-center">No se encontraron productos.</p>
                              )}
                            </div>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Quantity and Available Stock displays */}
                  <div className="grid grid-cols-2 gap-4">

                    {/* Readonly Stock Indicator */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Stock Disponible</label>
                      <div className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-white/5 text-sm text-slate-300 font-medium flex items-center gap-1.5 h-[46px]">
                        <span className={`w-2 h-2 rounded-full ${!selectedProductId
                          ? 'bg-slate-600'
                          : currentStock === 0
                            ? 'bg-rose-500 animate-pulse'
                            : 'bg-emerald-500'
                          }`} />
                        <span>{selectedProductId ? `${currentStock} unidades` : '--'}</span>
                      </div>
                    </div>

                    {/* Premium Quantity Selector + / - and controlled Input */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Cantidad</label>
                      <div className="flex items-center bg-slate-950 border border-white/10 rounded-xl overflow-hidden h-[46px] focus-within:border-indigo-500/50 transition-colors">
                        <button
                          type="button"
                          disabled={!selectedProductId || currentStock === 0 || parsedQuantity <= 1}
                          onClick={() => setQuantity(String(Math.max(1, parsedQuantity - 1)))}
                          className="px-3 h-full hover:bg-white/5 text-slate-400 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center font-bold text-lg select-none border-r border-white/5"
                        >
                          -
                        </button>
                        <input
                          type="text"
                          disabled={!selectedProductId || currentStock === 0}
                          value={quantity}
                          onChange={(e) => handleQuantityChange(e.target.value)}
                          className="w-full text-center bg-transparent focus:outline-none text-sm text-white disabled:opacity-40 disabled:cursor-not-allowed h-full font-semibold"
                        />
                        <button
                          type="button"
                          disabled={!selectedProductId || currentStock === 0 || parsedQuantity >= currentStock}
                          onClick={() => setQuantity(String(Math.min(currentStock, parsedQuantity + 1)))}
                          className="px-3 h-full hover:bg-white/5 text-slate-400 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center font-bold text-lg select-none border-l border-white/5"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Dynamic Pricing Info Display */}
                  {selectedProduct && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3.5 bg-white/[0.02] border border-white/5 rounded-xl space-y-1.5"
                    >
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Precio Unitario:</span>
                        <span className="font-semibold text-white">{formatCOP(productPrice)}</span>
                      </div>
                      <div className="flex justify-between text-xs pt-1.5 border-t border-white/5">
                        <span className="text-slate-400">Total Estimado:</span>
                        <span className="font-bold text-indigo-400 text-sm">{formatCOP(estimatedTotal)}</span>
                      </div>
                    </motion.div>
                  )}

                  {/* Validation alerts */}
                  {isOutOfStock && (
                    <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-2 rounded-lg font-medium">
                      ⚠️ ¡Este producto está agotado! No se puede registrar la venta.
                    </p>
                  )}
                  {quantity === '' && (
                    <p className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-2 rounded-lg font-medium">
                      ⚠️ Por favor, ingresa una cantidad.
                    </p>
                  )}
                  {selectedProductId && quantity !== '' && parsedQuantity <= 0 && (
                    <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-2 rounded-lg font-medium">
                      ⚠️ La cantidad a vender debe ser mayor que 0.
                    </p>
                  )}
                  {selectedProductId && quantity !== '' && parsedQuantity > currentStock && (
                    <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-2 rounded-lg font-medium">
                      ⚠️ ¡La cantidad ingresada supera el stock disponible ({currentStock})!
                    </p>
                  )}

                  {/* Payment Method selector buttons */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Método de Pago</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['Efectivo', 'Tarjeta', 'Transferencia'].map((method) => (
                        <button
                          key={method}
                          type="button"
                          onClick={() => setPaymentMethod(method)}
                          className={`py-2 rounded-lg text-xs font-semibold border transition-all ${paymentMethod === method
                            ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/15'
                            : 'bg-slate-950 border-white/5 text-slate-400 hover:text-white hover:bg-white/5'
                            }`}
                        >
                          {method}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Action triggers */}
                  <div className="flex gap-3 pt-4 border-t border-white/5">
                    <button
                      type="button"
                      onClick={() => setQuickSaleOpen(false)}
                      className="flex-1 py-3 rounded-xl text-xs font-semibold border border-white/5 text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitDisabled}
                      className="flex-1 py-3 rounded-xl text-xs font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-600/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                      Registrar Venta
                    </button>
                  </div>

                </form>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* FLOATING SUCCESS TOAST NOTIFICATION */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ type: 'spring', damping: 20 }}
            className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-emerald-500/30 text-slate-200 px-4 py-3 rounded-xl shadow-2xl shadow-emerald-950/20 flex items-center gap-3 max-w-sm"
          >
            <div className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg shrink-0">
              <CheckCircle className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white">Venta Registrada</p>
              <p className="text-[11px] text-slate-400 mt-0.5 truncate">{toastMessage}</p>
            </div>
            <button
              onClick={() => setShowToast(false)}
              className="ml-auto p-0.5 hover:bg-white/5 rounded text-slate-500 hover:text-slate-300 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
};

export default DashboardPage;
