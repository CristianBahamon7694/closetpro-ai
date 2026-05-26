import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';
import { Shirt, Mail, Lock, User, ArrowRight, Sparkles, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  const handleSubmit = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setError('');
    setSuccess('');

    if (!fullName || !email || !password) {
      setError('Por favor, completa todos los campos.');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setLoading(true);
    try {
      await register(email.trim(), password, fullName.trim());
      
      setRedirecting(true);
      await supabase.auth.signOut();
      
      navigate('/login', {
        state: { 
          successMessage: 'Cuenta creada correctamente. Ahora puedes iniciar sesión.' 
        }
      });
    } catch (err) {
      console.error('[Register Error]', err);
      if (err?.message && (err.message.includes('confirmación') || err.message.includes('confirm_email') || err.message.includes('Registro exitoso'))) {
        setRedirecting(true);
        await supabase.auth.signOut();
        navigate('/login', {
          state: { 
            successMessage: err.message || '¡Registro exitoso! Por favor, verifica tu correo electrónico.' 
          }
        });
      } else {
        setError(err.message || 'Error al crear la cuenta. Por favor verifica tus datos.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (redirecting) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center font-sans relative overflow-hidden">
        {/* Background glow effects */}
        <div className="bg-glow-sphere w-[500px] h-[500px] bg-indigo-500/10 absolute animate-pulse-slow -z-10"></div>
        <div className="flex flex-col items-center justify-center text-center max-w-sm px-6">
          <div className="relative w-16 h-16 mb-6">
            <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-500/20 rounded-full"></div>
            <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h3 className="text-white font-semibold text-lg mb-2 font-display">Redirigiendo al inicio de sesión...</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Cuenta creada correctamente. Preparando tu entorno seguro.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row relative overflow-hidden font-sans">
      {/* Background glow effects */}
      <div className="bg-glow-sphere w-[600px] h-[600px] bg-indigo-500/10 top-[-200px] left-[-200px] absolute animate-pulse-slow -z-10"></div>
      <div className="bg-glow-sphere w-[500px] h-[500px] bg-purple-500/10 bottom-[-200px] right-[-200px] absolute animate-pulse-slow -z-10" style={{ animationDelay: '4s' }}></div>

      {/* Return Home Button */}
      <div className="absolute top-6 left-6 z-50">
        <Link 
          to="/" 
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/[0.03] border border-white/5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-200 shadow-sm backdrop-blur-md"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Volver al inicio
        </Link>
      </div>

      {/* --- LEFT HAND SIDE: FORM --- */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 md:p-20 z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Logo header */}
          <div className="flex items-center gap-2 mb-8">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-gradient-to-tr from-indigo-500 to-purple-500 p-2 rounded-xl text-white">
                <Shirt className="h-6 w-6" />
              </div>
              <span className="font-display font-bold text-xl tracking-tight text-white">
                ClosetPro <span className="text-indigo-400">AI</span>
              </span>
            </Link>
          </div>

          {/* Intro text */}
          <h2 className="font-display font-bold text-3xl text-white mb-2">Crea tu cuenta</h2>
          <p className="text-slate-400 text-sm mb-8">
            Comienza a gestionar tu tienda de ropa con inteligencia artificial hoy mismo.
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl font-medium flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 animate-pulse"></span>
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl font-medium flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>{success}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Nombre Completo
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Juan Pérez"
                  className="glass-input w-full pl-10 pr-4 py-3 rounded-xl text-sm"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nombre@tienda.com"
                  className="glass-input w-full pl-10 pr-4 py-3 rounded-xl text-sm"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="•••••••• (Mínimo 6 caracteres)"
                  className="glass-input w-full pl-10 pr-4 py-3 rounded-xl text-sm"
                  disabled={loading}
                />
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileTap={loading ? {} : { scale: 0.98 }}
              animate={loading ? { scale: 0.98, opacity: 0.85 } : { scale: 1, opacity: 1 }}
              transition={{ duration: 0.15, ease: "easeInOut" }}
              className="glow-btn w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-1.5 transition-all mt-6 disabled:cursor-not-allowed cursor-pointer"
            >
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div
                    key="loader"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.15 }}
                    className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin"
                  />
                ) : (
                  <motion.span
                    key="content"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.12 }}
                    className="flex items-center gap-1.5"
                  >
                    Crear Cuenta <ArrowRight className="h-4 w-4" />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </form>

          {/* Footer Nav */}
          <p className="text-center text-sm text-slate-400 mt-8">
            ¿Ya tienes una cuenta?{' '}
            <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
              Iniciar Sesión
            </Link>
          </p>
        </motion.div>
      </div>

      {/* --- RIGHT HAND SIDE: PREMIUM GRAPHIC BANNER --- */}
      <div className="hidden md:flex flex-1 bg-slate-900/50 border-l border-white/5 items-center justify-center p-12 relative overflow-hidden z-10">
        {/* Decorative elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 -z-10"></div>
        
        <div className="max-w-md text-left space-y-8">
          <div className="inline-flex p-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-2xl">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-display font-bold text-2xl text-white mb-3">
              Estructura tu inventario en minutos.
            </h3>
            <p className="text-slate-400 text-sm">
              ClosetPro AI combina catalogación visual, control de costes y modelos de inteligencia artificial avanzados para potenciar la rentabilidad de tu tienda de ropa.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 text-sm text-slate-300">
              <div className="w-6 h-6 rounded-full bg-indigo-500/15 border border-indigo-500/35 flex items-center justify-center text-indigo-300 text-xs font-semibold shrink-0">1</div>
              <span>Registra códigos SKU y fotos de prendas</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-300">
              <div className="w-6 h-6 rounded-full bg-indigo-500/15 border border-indigo-500/35 flex items-center justify-center text-indigo-300 text-xs font-semibold shrink-0">2</div>
              <span>Define niveles mínimos de stock de seguridad</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-300">
              <div className="w-6 h-6 rounded-full bg-indigo-500/15 border border-indigo-500/35 flex items-center justify-center text-indigo-300 text-xs font-semibold shrink-0">3</div>
              <span>Consulta decisiones de compra al Asistente IA</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default RegisterPage;
