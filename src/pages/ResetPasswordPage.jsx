import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { Shirt, Lock, Eye, EyeOff, ArrowRight, Sparkles, CheckCircle2, AlertTriangle, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const ResetPasswordPage = () => {
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [verifyingSession, setVerifyingSession] = useState(true);
  const [isValidSession, setIsValidSession] = useState(false);
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [urlErrorMsg, setUrlErrorMsg] = useState('');

  useEffect(() => {
    const verifyRecoverySession = async () => {
      setError('');
      setUrlErrorMsg('');

      try {
        // 1. Check for recovery link errors embedded in the URL by Supabase (e.g. expired link)
        // Check both hash params and search params
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const queryParams = new URLSearchParams(window.location.search);
        
        const errorType = hashParams.get('error') || queryParams.get('error');
        const errorCode = hashParams.get('error_code') || queryParams.get('error_code');
        const errorDesc = hashParams.get('error_description') || queryParams.get('error_description');

        console.log('[ResetPassword] URL Error Params check:', { errorType, errorCode, errorDesc });

        if (errorType || errorDesc) {
          console.warn('[ResetPassword] Expired or invalid recovery link detected from URL params.');
          let customMsg = 'El enlace de recuperación de contraseña es inválido o ha expirado.';
          if (errorDesc && errorDesc.toLowerCase().includes('expired')) {
            customMsg = 'Tu enlace de recuperación ha expirado. Por favor, solicita uno nuevo.';
          }
          setUrlErrorMsg(customMsg);
          setIsValidSession(false);
          setVerifyingSession(false);
          return;
        }

        // 2. Fetch current session to ensure the client is authenticated via the recovery token
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw sessionError;
        }

        console.log('[ResetPassword] Active Auth Session status:', session ? 'Authenticated' : 'No Session');

        if (session && session.user) {
          setIsValidSession(true);
        } else {
          // If no session is active and no error was in URL, wait briefly for Supabase onAuthStateChange
          // Sometimes it takes a few milliseconds for the client to register the hash fragment.
          await new Promise(resolve => setTimeout(resolve, 800));
          const { data: { session: retrySession } } = await supabase.auth.getSession();
          if (retrySession && retrySession.user) {
            setIsValidSession(true);
          } else {
            console.warn('[ResetPassword] No active authenticated session found for password reset.');
            setUrlErrorMsg('No se detectó una sesión de recuperación activa. Utiliza el enlace enviado a tu correo o solicita uno nuevo.');
            setIsValidSession(false);
          }
        }
      } catch (err) {
        console.error('[ResetPassword Session Check Error]', err);
        setUrlErrorMsg('Ocurrió un error al verificar tu enlace de recuperación. Inténtalo de nuevo.');
        setIsValidSession(false);
      } finally {
        setVerifyingSession(false);
      }
    };

    verifyRecoverySession();
  }, []);

  const handleSubmit = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setError('');
    setSuccess('');

    if (!password || !confirmPassword) {
      setError('Por favor, completa ambos campos.');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas ingresadas no coinciden.');
      return;
    }

    setLoading(true);

    try {
      console.log('[ResetPassword] Attempting to update user password...');
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        throw updateError;
      }

      setSuccess('Contraseña actualizada correctamente. Ahora puedes iniciar sesión. Redirigiéndote...');
      
      // Sign out the temporary recovery session and redirect to login
      setTimeout(async () => {
        try {
          await supabase.auth.signOut();
        } catch (signOutErr) {
          console.error('[ResetPassword SignOut Error]', signOutErr);
        }
        navigate('/login', { 
          state: { 
            successMessage: 'Contraseña actualizada correctamente. Ahora puedes iniciar sesión.' 
          } 
        });
      }, 3000);

    } catch (err) {
      console.error('[ResetPassword Error]', err);
      // Translate common error messages
      const msg = err.message || '';
      if (msg.includes('same as old') || msg.includes('diferente')) {
        setError('La nueva contraseña debe ser diferente de la anterior.');
      } else if (msg.includes('JWT') || msg.includes('session') || msg.includes('expired')) {
        setError('Tu sesión de recuperación ha expirado. Por favor, solicita un nuevo enlace.');
      } else {
        setError(msg || 'No pudimos actualizar tu contraseña. Por favor, inténtalo de nuevo.');
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

      {/* --- LEFT HAND SIDE: FORM & CONTENT --- */}
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

          <AnimatePresence mode="wait">
            {/* 1. STATE: VERIFYING SESSION */}
            {verifyingSession ? (
              <motion.div
                key="verifying"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center text-center py-12"
              >
                <div className="relative w-16 h-16 mb-4">
                  <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-500/20 rounded-full"></div>
                  <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <h3 className="text-white font-medium text-lg mb-1">Verificando enlace</h3>
                <p className="text-slate-400 text-sm">Validando tu solicitud segura de recuperación...</p>
              </motion.div>
            ) : 

            /* 2. STATE: EXPIRED OR INVALID LINK ERROR SCREEN */
            !isValidSession ? (
              <motion.div
                key="invalid-session"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="glass-panel p-8 rounded-3xl border border-rose-500/20 text-center"
              >
                <div className="w-12 h-12 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-rose-400">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <h3 className="font-display font-bold text-2xl text-white mb-2">Enlace no Válido</h3>
                <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                  {urlErrorMsg || 'El enlace de recuperación ha expirado, es inválido o ya ha sido utilizado.'}
                </p>
                <div className="space-y-3">
                  <Link
                    to="/forgot-password"
                    className="glow-btn w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-1.5 transition-all"
                  >
                    Solicitar nuevo enlace
                  </Link>
                  <Link
                    to="/login"
                    className="block text-xs text-slate-400 hover:text-white transition-colors py-2"
                  >
                    Volver a Iniciar Sesión
                  </Link>
                </div>
              </motion.div>
            ) : (

            /* 3. STATE: HAPPY PATH - PASSWORD RESET FORM */
            <motion.div
              key="reset-form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Title & Info */}
              <h2 className="font-display font-bold text-3xl text-white mb-2">Nueva Contraseña</h2>
              <p className="text-slate-400 text-sm mb-8">
                Crea una contraseña segura y fácil de recordar para acceder a ClosetPro AI.
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
                      <CheckCircle2 className="h-4.5 w-4.5 shrink-0 text-emerald-400 mt-0.5 animate-bounce" />
                      <span>{success}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Password field */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Nueva Contraseña
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      className="glass-input w-full pl-10 pr-10 py-3 rounded-xl text-sm"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      tabIndex="-1"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3.5 text-slate-500 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password field */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                    Confirmar Nueva Contraseña
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repite la contraseña"
                      className="glass-input w-full pl-10 pr-10 py-3 rounded-xl text-sm"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      tabIndex="-1"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-3.5 text-slate-500 hover:text-slate-300"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
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
                      Guardar Nueva Contraseña <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            </motion.div>
            )}
          </AnimatePresence>
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
              "Una contraseña robusta es el primer escudo para proteger tu boutique de modas en línea."
            </h3>
            <p className="text-slate-400 text-sm">
              Recomendamos usar una combinación de letras mayúsculas, minúsculas, números y caracteres especiales.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
              <span>Mínimo 6 caracteres de longitud</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
              <span>Validación de coincidencia exacta</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
