import { useState, useRef, useEffect } from 'react';
import { useInventory } from '../context/InventoryContext';
import { geminiService } from '../services/geminiService';
import { Sparkles, Send, Sparkle, ShoppingCart, Check } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import { motion, AnimatePresence } from 'framer-motion';

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
    
    // Check for title blocks (e.g. 🚨 Alerta de stock)
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
      
      // Parse metric key-value
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

const ThinkingIndicator = () => {
  const messages = [
    "Analizando inventario...",
    "Revisando métricas comerciales...",
    "Procesando productos...",
    "Calculando stock y ventas...",
    "Generando análisis inteligente..."
  ];
  const [currentMsg, setCurrentMsg] = useState(messages[0]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMsg((prev) => {
        const candidates = messages.filter((m) => m !== prev);
        return candidates[Math.floor(Math.random() * candidates.length)];
      });
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="flex justify-start w-full"
    >
      <div className="relative overflow-hidden bg-slate-900/50 backdrop-blur-md border border-white/5 p-5 rounded-2xl rounded-bl-none shadow-2xl flex flex-col gap-3 max-w-[90%] sm:max-w-[80%]">
        {/* Futuristic background glow halos */}
        <div className="absolute -top-12 -left-12 w-28 h-28 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none animate-pulse" />
        <div className="absolute -bottom-12 -right-12 w-28 h-28 bg-purple-500/10 rounded-full blur-2xl pointer-events-none animate-pulse" />
        
        <div className="flex items-center gap-4">
          <div className="relative flex items-center justify-center shrink-0">
            {/* Pulsing ambient glow */}
            <span className="absolute w-6 h-6 bg-indigo-500/20 rounded-full blur-md animate-ping" />
            
            {/* Animated bouncing dots */}
            <div className="flex items-center gap-1 bg-slate-950/60 px-3 py-2 rounded-full border border-white/5 relative z-10">
              <motion.span 
                animate={{ y: [0, -6, 0] }}
                transition={{ repeat: Infinity, duration: 0.6, ease: "easeInOut", delay: 0 }}
                className="w-1.5 h-1.5 bg-indigo-400 rounded-full" 
              />
              <motion.span 
                animate={{ y: [0, -6, 0] }}
                transition={{ repeat: Infinity, duration: 0.6, ease: "easeInOut", delay: 0.15 }}
                className="w-1.5 h-1.5 bg-purple-400 rounded-full" 
              />
              <motion.span 
                animate={{ y: [0, -6, 0] }}
                transition={{ repeat: Infinity, duration: 0.6, ease: "easeInOut", delay: 0.3 }}
                className="w-1.5 h-1.5 bg-pink-400 rounded-full" 
              />
            </div>
          </div>
          
          {/* Animated Rotating Text */}
          <div className="flex flex-col">
            <span className="text-[9px] font-bold uppercase tracking-widest text-indigo-400/80">Copiloto Pensando</span>
            <div className="h-4 overflow-hidden relative min-w-[200px]">
              <AnimatePresence mode="wait">
                <motion.span
                  key={currentMsg}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.2 }}
                  className="absolute text-xs text-slate-300 font-medium font-sans truncate left-0 top-0 w-full"
                >
                  {currentMsg}
                </motion.span>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const generateMessageId = (prefix = 'msg') => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

export const AIAssistantPage = () => {
  const { products, sales, updateProduct } = useInventory();
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'ai',
      text: "¡Hola! Soy tu Asistente de Inventario ClosetPro AI. Analizo las métricas de tu boutique para ayudarte a tomar decisiones sobre abastecimiento de productos en stock crítico, liquidación de inventario estancado y evaluación de márgenes. ¿Qué reporte comercial deseas consultar hoy?",
      recommendedItems: []
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [loggedRestocks, setLoggedRestocks] = useState({}); // Track logged purchases/adjustments

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading, isThinking]);

  const handleSend = async (textToSend, internalPrompt) => {
    const queryVisible = textToSend || input;
    const queryAI = internalPrompt || queryVisible;
    if (!queryVisible.trim()) return;

    // Add user message
    const userMessage = {
      id: generateMessageId('user'),
      sender: 'user',
      text: queryVisible,
      recommendedItems: []
    };

    setMessages(prev => [...prev, userMessage]);
    if (!textToSend) setInput('');
    setLoading(true);
    setIsThinking(true);

    try {
      // Call mock Gemini Service and delay concurrently
      const geminiPromise = geminiService.askStylist(queryAI, products, sales, messages);
      const delayPromise = new Promise((resolve) => setTimeout(resolve, 3000));

      const [result] = await Promise.all([geminiPromise, delayPromise]);

      // Add AI response
      const aiResponse = {
        id: generateMessageId('ai'),
        sender: 'ai',
        text: result.text,
        recommendedItems: result.recommendedItems
      };

      setMessages(prev => [...prev, aiResponse]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, {
        id: 'msg-err-' + Date.now(),
        sender: 'ai',
        text: "Hubo un error de conexión con el modelo IA. Por favor, revisa la configuración del servicio.",
        recommendedItems: []
      }]);
    } finally {
      setIsThinking(false);
      setLoading(false);
    }
  };

  const handleRestockFromAI = async (msgId, itemIds) => {
    try {
      // Restock 20 units for each recommended product
      for (const id of itemIds) {
        const match = products.find(p => p.id === id);
        if (match) {
          const newStock = match.stock + 20;
          await updateProduct(id, { 
            stock: newStock,
            lastRestock: new Date().toISOString().split('T')[0]
          });
        }
      }
      setLoggedRestocks(prev => ({ ...prev, [msgId]: true }));
      alert('¡Abastecimiento registrado con éxito! El inventario de los productos sugeridos ha aumentado +20 unidades.');
    } catch (err) {
      console.error(err);
      alert('Error al registrar el abastecimiento.');
    }
  };

  const quickActions = [
    {
      label: "¿Qué productos debo reabastecer hoy?",
      prompt: "qué productos tienen stock bajo"
    },
    {
      label: "¿Qué producto tiene más stock?",
      prompt: "qué producto tiene más stock"
    },
    {
      label: "¿Qué productos están agotados?",
      prompt: "qué productos están agotados"
    }
  ];

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col md:flex-row gap-6 relative overflow-hidden">
      
      {/* LEFT COLUMN: CONVERSATION UTILITIES */}
      <div className="w-full md:w-80 flex flex-col gap-6 shrink-0">
        
        {/* Helper Box */}
        <GlassCard className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-indigo-400">
            <Sparkles className="h-5 w-5 fill-indigo-400/20 animate-float" />
            <h3 className="font-display font-semibold text-base text-white">Asesor comercial IA</h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Este módulo analiza el volumen de ventas, rotación de stock y márgenes brutos para sugerir compras eficientes.
          </p>
          <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl text-[10px] text-slate-500">
            Tu tienda cuenta actualmente con <strong className="text-white">{products.length} productos</strong>.
          </div>
        </GlassCard>

        {/* Suggestions Pills Box */}
        <GlassCard className="flex-1 overflow-y-auto">
          <h4 className="font-display font-semibold text-sm text-white mb-4 flex items-center gap-1.5">
            <Sparkle className="h-4 w-4 text-indigo-400" /> Consultas de Muestra
          </h4>
          <div className="space-y-2.5">
            {quickActions.map((action, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(action.label, action.prompt)}
                disabled={loading}
                className="w-full text-left text-xs p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-indigo-500/30 hover:bg-indigo-500/5 text-slate-300 hover:text-white transition-all duration-200 focus:outline-none"
              >
                {action.label}
              </button>
            ))}
          </div>
        </GlassCard>

      </div>

      {/* CENTER COLUMN: MAIN CHAT PANEL */}
      <GlassCard className="flex-grow flex flex-col justify-between h-full p-4 sm:p-6 overflow-hidden">
        
        {/* Chat Logs Window */}
        <div className="flex-grow overflow-y-auto pr-2 space-y-4 mb-4">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[90%] sm:max-w-[80%] p-5 rounded-2xl ${
                    msg.sender === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-none text-sm'
                      : 'bg-white/[0.02] border border-white/5 text-slate-200 rounded-bl-none shadow-xl'
                  }`}
                >
                  {msg.sender === 'user' ? (
                    <p className="leading-relaxed whitespace-pre-line">{msg.text}</p>
                  ) : (
                    <div className="space-y-4">
                      {parseAIResponseToUI(msg.text).map((block, bIdx) => {
                        switch (block.type) {
                          case 'title': {
                            const isCritical = block.title.toLowerCase().includes('crítico') || 
                                               block.title.toLowerCase().includes('alerta') ||
                                               block.emoji === '🚨' || block.emoji === '⚠️';
                            const isSuccess = block.emoji === '✅';
                            
                            return (
                              <motion.div
                                key={bIdx}
                                initial={{ opacity: 0, x: -5 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: bIdx * 0.04 }}
                                className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl border font-display ${
                                  isCritical 
                                    ? 'bg-rose-500/10 border-rose-500/20 text-rose-300 font-semibold'
                                    : isSuccess
                                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300 font-semibold'
                                      : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-300 font-semibold'
                                }`}
                              >
                                <span className="text-base shrink-0">{block.emoji}</span>
                                <h4 className="text-xs font-bold uppercase tracking-wider leading-none">
                                  {block.title}
                                </h4>
                              </motion.div>
                            );
                          }
                            
                          case 'subtitle':
                            return (
                              <motion.h5
                                key={bIdx}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: bIdx * 0.04 }}
                                className="text-xs font-bold text-slate-200 uppercase tracking-widest mt-4 pt-1 mb-2 border-l-2 border-indigo-500 pl-2"
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
                                transition={{ delay: bIdx * 0.04 }}
                                className="text-xs text-slate-300 leading-relaxed font-normal"
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
                                transition={{ delay: bIdx * 0.04 }}
                                className="flex items-start gap-2.5 text-xs text-slate-300 pl-1 py-0.5"
                              >
                                <span className="text-indigo-400 mt-1 shrink-0 text-xs">•</span>
                                <span className="leading-relaxed">{block.content}</span>
                              </motion.div>
                            );
                            
                          case 'metrics_group':
                            return (
                              <motion.div
                                key={bIdx}
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: bIdx * 0.04 }}
                                className="bg-slate-950/40 border border-white/5 rounded-xl p-3.5 space-y-2.5 my-3 shadow-inner"
                              >
                                {block.items.map((m, mIdx) => (
                                  <div key={mIdx} className="flex justify-between items-center text-xs py-1 border-b border-white/[0.03] last:border-b-0 last:pb-0">
                                    <span className="text-slate-400 font-medium">{m.label}</span>
                                    <span className="font-bold text-indigo-300 bg-indigo-500/10 px-2.5 py-0.5 rounded-lg border border-indigo-500/25 text-[10px] font-mono tracking-wide">
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
                      
                      {msg.recommendedItems && msg.recommendedItems.length > 0 && (
                        <div className="mt-5 pt-4 border-t border-white/5 space-y-4">
                          <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest block">
                            Productos Analizados
                          </span>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {msg.recommendedItems.map((item) => (
                              <div 
                                key={item.id}
                                className="relative flex flex-col justify-between p-4 rounded-xl bg-white/[0.01] border border-white/5 hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-300 group overflow-hidden"
                              >
                                {/* Ambient hover glow */}
                                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-600/5 rounded-full blur-xl group-hover:bg-indigo-600/10 transition-all duration-300 pointer-events-none" />
                                
                                <div>
                                  <div className="flex items-center justify-between gap-2 mb-3">
                                    <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 font-bold text-[9px] uppercase tracking-wide">
                                      {item.category}
                                    </span>
                                    <span className="text-[9px] text-slate-500 font-mono">
                                      {item.sku || `PROD-${String(item.id).slice(0, 4).toUpperCase()}`}
                                    </span>
                                  </div>
                                  
                                  <h4 className="font-semibold text-xs text-white group-hover:text-indigo-300 transition-colors truncate">
                                    {item.name}
                                  </h4>
                                  
                                  <div className="mt-3.5 space-y-2">
                                    <div className="flex justify-between items-center text-[11px]">
                                      <span className="text-slate-400 font-medium">Existencias:</span>
                                      <span className={`font-bold ${item.stock <= 5 ? 'text-rose-400 animate-pulse' : 'text-slate-200'}`}>
                                        {item.stock} unidades
                                      </span>
                                    </div>
                                    <div className="flex justify-between items-center text-[11px]">
                                      <span className="text-slate-400 font-medium">Precio Unitario:</span>
                                      <span className="font-semibold text-slate-300">
                                        {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(item.price)}
                                      </span>
                                    </div>
                                    <div className="flex justify-between items-center text-[11px] pt-2 border-t border-white/5 mt-2">
                                      <span className="text-slate-400 font-medium">Valor Bodega:</span>
                                      <span className="font-extrabold text-indigo-400 font-mono">
                                        {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(item.price * item.stock)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Log purchase order logger */}
                          <div className="pt-2">
                            {loggedRestocks[msg.id] ? (
                              <span className="text-xs text-green-400 font-semibold flex items-center gap-1">
                                <Check className="h-4 w-4" /> Abastecimiento Registrado en Stock
                              </span>
                            ) : (
                              <button
                                onClick={() => handleRestockFromAI(msg.id, msg.recommendedItems.map(i => i.id))}
                                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-500/20 hover:bg-indigo-500/35 border border-indigo-500/30 text-indigo-300 flex items-center gap-1 transition-all focus:outline-none"
                              >
                                <ShoppingCart className="h-3.5 w-3.5" /> Registrar Abastecimiento (+20 u.)
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Thinking State indicator */}
          {isThinking && <ThinkingIndicator />}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }} 
          className="relative"
        >
          <input
            type="text"
            placeholder="Pregunta a tu asistente: '¿Qué productos debo reabastecer?'..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            className="w-full pl-4 pr-12 py-3.5 text-sm glass-input rounded-xl focus:border-indigo-500/40"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="absolute right-2 top-2 p-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors disabled:opacity-50 disabled:hover:bg-indigo-600 focus:outline-none"
          >
            <Send className="h-4.5 w-4.5" />
          </button>
        </form>

      </GlassCard>

    </div>
  );
};

export default AIAssistantPage;
