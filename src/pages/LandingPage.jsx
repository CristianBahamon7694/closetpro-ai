import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  AlertTriangle, 
  TrendingUp, 
  Shirt, 
  Layers, 
  LayoutDashboard,
  Check, 
  Plus, 
  Minus,
  ArrowRight,
  Sparkle
} from 'lucide-react';
import { motion } from 'framer-motion';

export const LandingPage = () => {
  const [activeFaq, setActiveFaq] = useState(null);

  const features = [
    {
      title: "Asistente de Inventario IA",
      desc: "Consulta decisiones de compra en tiempo real a nuestro copiloto con lenguaje natural. Analiza rotación y tendencias de moda al instante.",
      icon: Sparkles,
      color: "from-indigo-500 to-purple-500"
    },
    {
      title: "Alertas Inteligentes de Stock",
      desc: "Evita quedarte sin tallas o referencias clave. Alertas automatizadas cuando una prenda de vestir baja del nivel mínimo configurado.",
      icon: AlertTriangle,
      color: "from-rose-500 to-amber-500"
    },
    {
      title: "Analítica de Ventas de Moda",
      desc: "Mide la rotación de tus colecciones, margen neto por prenda y el retorno de inversión de cada línea de ropa que adquieres.",
      icon: TrendingUp,
      color: "from-emerald-500 to-teal-500"
    },
    {
      title: "Gestión Completa de Productos",
      desc: "Registra códigos SKU únicos, costes de adquisición, precios al por menor, categorías y control físico de almacén.",
      icon: Shirt,
      color: "from-blue-500 to-indigo-500"
    },
    {
      title: "Inventario de Ropa Multicategoría",
      desc: "Clasificación premium optimizada para boutiques: Jeans, Hoodies, Chaquetas, Calzado, Camisetas y Accesorios.",
      icon: Layers,
      color: "from-pink-500 to-rose-500"
    },
    {
      title: "Dashboard en Tiempo Real",
      desc: "Una consola operativa moderna y unificada con valor total de bodega, stock físico consolidado e insights comerciales.",
      icon: LayoutDashboard,
      color: "from-indigo-500 to-cyan-500"
    }
  ];

  const pricingPlans = [
    {
      name: "Starter",
      price: "$0",
      desc: "Funciones esenciales para catalogar el inventario de tu tienda.",
      features: [
        "Hasta 30 productos registrados",
        "Control de stock básico",
        "3 sugerencias de reabastecimiento IA al día",
        "Métricas generales del panel"
      ],
      cta: "Comenzar Gratis",
      popular: false
    },
    {
      name: "Pro",
      price: "$9",
      desc: "Ideal para boutiques en crecimiento que buscan optimizar sus ventas.",
      features: [
        "Productos e inventario ilimitados",
        "Consultas IA ilimitadas con el asistente",
        "Gráficos avanzados de rotación y márgenes",
        "Alertas automáticas de stock mínimo",
        "Soporte prioritario por correo electrónico"
      ],
      cta: "Obtener Plan Pro",
      popular: true
    },
    {
      name: "Enterprise",
      price: "$29",
      desc: "Para boutiques consolidadas y marcas con múltiples sucursales.",
      features: [
        "Múltiples sucursales y bodegas",
        "Soporte exclusivo 24/7",
        "Integración con sistemas POS físicos",
        "Acceso completo a la API ClosetPro",
        "Capacitación de personal dedicada"
      ],
      cta: "Contactar Ventas",
      popular: false
    }
  ];

  const faqs = [
    {
      q: "¿Cómo funciona el Asistente AI para recomendar compras?",
      a: "El asistente de ClosetPro analiza el historial de ventas cargado y contrasta el stock actual de tus prendas con sus límites mínimos. Identifica automáticamente qué artículos corren el riesgo de agotarse y sugiere compras precisas, así como descuentos para artículos lentos."
    },
    {
      q: "¿Es posible integrar ClosetPro AI con mi sistema de ventas actual?",
      a: "La plataforma está diseñada con una arquitectura flexible. En futuras actualizaciones, podrás conectar ClosetPro AI con plataformas de comercio electrónico como Shopify o sistemas POS locales mediante nuestras claves de integración."
    },
    {
      q: "¿Mis datos comerciales están seguros?",
      a: "Por supuesto. La confidencialidad es nuestra prioridad. Ciframos toda la información de tus productos y registros financieros, y nunca compartimos tus datos de ventas con terceros."
    },
    {
      q: "¿Puedo probar las funciones Pro de manera gratuita?",
      a: "¡Sí! Al registrarte hoy, obtienes una prueba gratuita de 14 días con acceso total a las características del Plan Pro, sin necesidad de introducir tarjetas de crédito."
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { staggerChildren: 0.1 } 
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
  };

  return (
    <>
      {/* --- HERO SECTION --- */}
      <section className="relative pt-12 pb-24 md:pt-20 md:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* LEFT SIDE: BRAND CONTENT */}
            <div className="lg:col-span-5 text-left space-y-6">
              
              {/* Trust Badge */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/10 text-xs font-semibold text-indigo-300 backdrop-blur-sm"
              >
                <Sparkle className="h-3 w-3 text-indigo-400 animate-spin-slow" /> +150 productos gestionados en tiempo real
              </motion.div>

              <motion.h1 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl tracking-tight text-white leading-[1.15]"
              >
                Gestiona tu inventario de ropa con <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 font-extrabold">
                  inteligencia artificial
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-base sm:text-lg text-slate-400 leading-relaxed font-normal"
              >
                Controla stock, ventas, productos y alertas inteligentes desde una sola plataforma moderna para boutiques y tiendas de moda.
              </motion.p>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-4 pt-2"
              >
                <Link 
                  to="/register" 
                  className="glow-btn inline-flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-7 py-3.5 rounded-xl text-sm transition-all duration-200 shadow-xl shadow-indigo-600/20"
                >
                  Comenzar Gratis <ArrowRight className="h-4.5 w-4.5" />
                </Link>
              </motion.div>

            </div>

            {/* RIGHT SIDE: PREMIUM DARK SAAS OPERATING SYSTEM MOCKUP */}
            <div className="lg:col-span-7 relative">
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative mx-auto max-w-2xl rounded-2xl border border-white/10 bg-slate-900/60 p-3 sm:p-4 shadow-2xl shadow-indigo-950/40 backdrop-blur-xl"
              >
                {/* Visual Glow Underlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-purple-500/10 rounded-2xl filter blur-xl opacity-40 -z-10"></div>
                
                {/* Browser Header Bar */}
                <div className="flex items-center justify-between pb-3 px-2 border-b border-white/5">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-700"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-700"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-700"></span>
                    <span className="text-[10px] text-slate-500 ml-2 font-mono">app.closetpro.ai/dashboard</span>
                  </div>
                  <span className="text-[9px] px-2 py-0.5 rounded bg-white/5 text-slate-400 font-mono">Real-Time</span>
                </div>

                {/* Dashboard Inner Layout */}
                <div className="bg-slate-950 rounded-xl p-3 sm:p-4 text-left space-y-4 mt-3 shadow-sm border border-white/5">
                  
                  {/* Top Stats Overview Row */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/[0.02] border border-white/5 p-3 rounded-xl shadow-sm">
                      <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Valor total bodega</span>
                      <span className="text-base sm:text-lg font-bold text-white mt-0.5 block font-mono">$148,500,000</span>
                    </div>
                    <div className="bg-white/[0.02] border border-white/5 p-3 rounded-xl shadow-sm">
                      <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Prendas en Stock</span>
                      <span className="text-base sm:text-lg font-bold text-indigo-400 mt-0.5 block font-mono">1,420 uds.</span>
                    </div>
                  </div>

                  {/* Low Stock Warning Card */}
                  <div className="bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-1.5 bg-rose-500/20 text-rose-400 rounded-lg shrink-0">
                        <AlertTriangle className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-white truncate">Stock Crítico: Jean Skinny Retro</h4>
                        <p className="text-[10px] text-rose-400 mt-0.5">Quedan solo 3 unidades en stock de seguridad.</p>
                      </div>
                    </div>
                    <span className="text-[9px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold shrink-0">Comprar</span>
                  </div>

                  {/* visual Clothing Cards & AI Widget Area */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    {/* Left: Product Card */}
                    <div className="bg-white/[0.01] border border-white/5 p-3 rounded-xl space-y-2.5">
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Prendas Destacadas</span>
                      
                      <div className="bg-white/[0.03] p-2.5 rounded-lg border border-white/5 flex gap-2.5 items-center shadow-sm">
                        <div className="w-10 h-10 rounded-md bg-slate-900 border border-white/5 shrink-0 flex items-center justify-center text-lg">
                          🧥
                        </div>
                        <div className="min-w-0 flex-1">
                          <h5 className="text-[11px] font-bold text-white truncate">Chaqueta Bomber Negra</h5>
                          <div className="flex justify-between items-center text-[9px] text-slate-400 mt-0.5">
                            <span>Stock: 14 u.</span>
                            <span className="text-white font-semibold font-mono">$280.000</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white/[0.03] p-2.5 rounded-lg border border-white/5 flex gap-2.5 items-center shadow-sm">
                        <div className="w-10 h-10 rounded-md bg-slate-900 border border-white/5 shrink-0 flex items-center justify-center text-lg">
                          👕
                        </div>
                        <div className="min-w-0 flex-1">
                          <h5 className="text-[11px] font-bold text-white truncate">Hoodie Vintage Retro</h5>
                          <div className="flex justify-between items-center text-[9px] text-slate-400 mt-0.5">
                            <span>Stock: 42 u.</span>
                            <span className="text-white font-semibold font-mono">$180.000</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right: AI Assistant Floating Widget */}
                    <div className="bg-indigo-500/5 border border-indigo-500/10 p-3.5 rounded-xl flex flex-col justify-between relative group overflow-hidden shadow-sm">
                      <div className="absolute top-[-20%] right-[-20%] w-16 h-16 bg-indigo-500/10 rounded-full blur-lg pointer-events-none" />
                      
                      <div className="space-y-2 relative z-10">
                        <div className="flex items-center gap-1.5 text-indigo-400">
                          <Sparkles className="h-3.5 w-3.5" />
                          <span className="text-[10px] font-bold uppercase tracking-wider">ClosetPro AI</span>
                        </div>
                        <p className="text-[10.5px] text-slate-300 leading-relaxed font-sans font-medium">
                          "Chaqueta Bomber Negra" tiene excelente margen (65%) y alta velocidad de venta. Sugiero aumentar el precio +5% o reabastecer 15 unidades hoy.
                        </p>
                      </div>

                      <div className="flex gap-1.5 pt-3 mt-2 border-t border-white/5 relative z-10">
                        <span className="text-[9px] px-2 py-1 rounded bg-indigo-600 text-white font-semibold cursor-pointer hover:bg-indigo-500 transition-all">Reabastecer</span>
                        <span className="text-[9px] px-2 py-1 rounded bg-white/5 text-slate-300 font-semibold cursor-pointer hover:bg-white/10 transition-all font-sans">Descartar</span>
                      </div>
                    </div>

                  </div>

                </div>
              </motion.div>
            </div>

          </div>
        </div>
      </section>

      {/* --- FEATURES GRID --- */}
      <section id="features" className="py-24 border-t border-white/5 bg-slate-950 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-3">
            <h2 className="font-display font-extrabold text-3xl sm:text-5xl text-white tracking-tight">
              Todo lo que necesitas para dominar tus ventas de moda
            </h2>
            <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto font-normal">
              Optimiza tus niveles de stock de ropa, evita quiebres de existencias y maximiza tu rentabilidad comercial diaria.
            </p>
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  className="bg-slate-900/50 border border-white/5 transition-all duration-300 rounded-2xl p-6 flex flex-col justify-between group hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-950/20 hover:border-white/10 shadow-sm"
                >
                  <div>
                    <div className={`p-3 rounded-xl bg-gradient-to-tr ${feat.color} text-white shadow-sm shrink-0 h-11 w-11 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-300`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-display font-semibold text-lg text-white mb-2">{feat.title}</h3>
                    <p className="text-slate-400 leading-relaxed text-xs font-normal">{feat.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

        </div>
      </section>

      {/* --- PRICING PLANS --- */}
      <section id="pricing" className="py-24 border-t border-white/5 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-3">
            <h2 className="font-display font-extrabold text-3xl sm:text-5xl text-white tracking-tight">
              Precios simples y transparentes
            </h2>
            <p className="text-slate-400 text-base sm:text-lg">
              Comienza a optimizar tu boutique hoy. Cambia de plan cuando tu negocio crezca.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto">
            {pricingPlans.map((plan, idx) => (
              <div 
                key={idx}
                className={`bg-slate-900/50 border border-white/5 rounded-3xl p-8 flex flex-col justify-between relative transition-all duration-300 hover:shadow-lg hover:border-white/10 shadow-sm ${
                  plan.popular ? 'border-indigo-500/40 bg-indigo-950/10 shadow-lg shadow-indigo-950/30' : ''
                }`}
              >
                {plan.popular && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-semibold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-lg">
                    Recomendado
                  </span>
                )}
                <div>
                  <h3 className="font-display font-bold text-xl text-white mb-1">{plan.name}</h3>
                  <p className="text-slate-400 text-xs mb-6 leading-relaxed font-normal">{plan.desc}</p>
                  <div className="flex items-baseline gap-1 mb-8">
                    <span className="text-4xl sm:text-5xl font-display font-bold text-white font-mono">{plan.price}</span>
                    <span className="text-slate-500 text-xs">/ mes</span>
                  </div>
                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-3 text-xs text-slate-300 font-normal">
                        <Check className="h-4.5 w-4.5 text-indigo-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <Link
                  to="/register"
                  className={`w-full text-center py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    plan.popular
                      ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25'
                      : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* --- FAQ SECTION --- */}
      <section id="faq" className="py-24 border-t border-white/5 bg-slate-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          
          <div className="text-center mb-16">
            <h2 className="font-display font-extrabold text-3xl sm:text-5xl text-white tracking-tight">
              Preguntas Frecuentes
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div 
                  key={idx}
                  className="bg-slate-900/50 border border-white/5 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-sm hover:border-white/10 shadow-sm"
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="w-full text-left p-6 flex justify-between items-center text-slate-100 hover:text-white focus:outline-none cursor-pointer"
                  >
                    <span className="font-semibold text-sm sm:text-base">{faq.q}</span>
                    <span className="p-1 rounded-lg border border-white/5 bg-white/5 text-slate-400 ml-4 shrink-0 transition-transform">
                      {isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-6 text-xs sm:text-sm text-slate-400 border-t border-white/5 pt-4 leading-relaxed font-normal">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* --- FINAL CTA --- */}
      <section className="py-20 border-t border-white/5 bg-slate-950 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-indigo-600/10 w-[500px] h-[500px] rounded-full filter blur-[120px] pointer-events-none"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10 space-y-6">
          <h2 className="font-display font-extrabold text-3xl sm:text-5xl text-white tracking-tight">
            ¿Listo para llevar tu boutique al siguiente nivel?
          </h2>
          <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto leading-relaxed font-normal">
            Únete a cientos de boutiques de moda que ya gestionan sus stocks de ropa de forma inteligente y automatizada con ClosetPro AI.
          </p>
          <Link 
            to="/register" 
            className="glow-btn inline-flex items-center gap-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold px-8 py-4.5 rounded-xl text-base transition-all shadow-xl shadow-indigo-600/20"
          >
            Registrar mi Tienda Gratis <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

    </>
  );
};

export default LandingPage;
