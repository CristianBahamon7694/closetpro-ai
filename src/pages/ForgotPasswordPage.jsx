import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { Shirt, Mail, ArrowRight, ArrowLeft, Sparkles, CheckCircle2, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const validateEmail = (val) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(val);
  };

  const handleSubmit = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setError('');
    setSuccess('');

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError('Por favor, ingresa tu correo electrónico.');
      return;
    }

    if (!validateEmail(trimmedEmail)) {
      setError('Por favor, ingresa un correo electrónico con formato válido.');
      return;
    }

    setLoading(true);

    try {
      // Dynamic redirection URL mapping automatically to localhost or production domain
      const redirectToUrl = `${window.location.origin}/reset-password`;
      console.log('[ForgotPassword] Attempting to reset password for email:', trimmedEmail, 'with redirect to:', redirectToUrl);

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
        redirectTo: redirectToUrl,
      });

      if (resetError) {
        throw resetError;
      }

      setSuccess('¡Te hemos enviado un enlace de recuperación a tu correo electrónico! Por favor, revisa tu bandeja de entrada y spam.');
      setEmail('');
    } catch (err) {
      console.error('[ForgotPassword Error]', err);
      // Translate typical Supabase errors to natural Colombian Spanish
      const msg = err.message || '';
      if (msg.includes('Rate limit exceeded') || msg.includes('too many requests')) {
        setError('Límite de solicitudes excedido. Por favor, espera unos minutos e inténtalo de nuevo.');
      } else if (msg.includes('Network') || msg.includes('fetch')) {
        setError('Error de conexión a internet. Por favor, verifica tu red.');
      } else {
        setError(msg || 'No pudimos procesar tu solicitud en este momento. Inténtalo de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row relative overflow-hidden">
      {/* Background glow effects */}
      <div className="bg-glow-sphere w-[500px] h-[500px] bg-indigo-500/10 top-[-200px] left-[-200px] animate-pulse-slow"></div>
      <div className="bg-glow-sphere w-[500px] h-[500px] bg-purple-500/10 bottom-[-200px] right-[-200px] animate-pulse-slow" style={{ animationDelay: '4s' }}></div>

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

          {/* Back button */}
          <Link to="/login" className="inline-flex items-center gap-2 text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors mb-6">
            <ArrowLeft className="h-3.5 w-3.5" /> Volver al inicio de sesión
          </Link>

          {/* Intro text */}
          <h2 className="font-display font-bold text-3xl text-white mb-2">Recuperar Contraseña</h2>
          <p className="text-slate-400 text-sm mb-8">
            Ingresa el correo electrónico asociado a tu cuenta de ClosetPro AI y te enviaremos un enlace seguro para restablecerla.
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl font-medium flex items-center gap-2"
                >
                  <AlertTriangle className="h-4 w-4 shrink-0 animate-pulse text-rose-400" />
                  <span>{error}</span>
                </motion.div>
              )}

              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl font-medium flex items-start gap-2"
                >
                  <CheckCircle2 className="h-4.5 w-4.5 shrink-0 text-emerald-400 mt-0.5" />
                  <span>{success}</span>
                </motion.div>
              )}
            </AnimatePresence>

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

            <button
              type="submit"
              disabled={loading}
              className="glow-btn w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-1.5 transition-all mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  Enviar Enlace de Recuperación <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>

      {/* --- RIGHT HAND SIDE: PREMIUM GRAPHIC BANNER --- */}
      <div className="hidden md:flex flex-1 bg-slate-900/50 border-l border-white/5 items-center justify-center p-12 relative overflow-hidden z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 -z-10"></div>
        <div className="max-w-md text-left space-y-8">
          <div className="inline-flex p-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-2xl">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-display font-bold text-2xl text-white mb-3">
              "Recupera el control total de tu inventario en cuestión de segundos."
            </h3>
            <p className="text-slate-400 text-sm">
              La seguridad y confidencialidad de tus datos comerciales son nuestra máxima prioridad en ClosetPro AI.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="glass-panel p-4 rounded-2xl">
              <span className="text-xs text-slate-500 block mb-1">Cifrado de Extremo a Extremo</span>
              <span className="text-sm font-semibold text-white">Activo (Supabase)</span>
            </div>
            <div className="glass-panel p-4 rounded-2xl">
              <span className="text-xs text-slate-500 block mb-1">Tiempo de Respuesta</span>
              <span className="text-sm font-semibold text-white">&lt; 3 Segundos</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
