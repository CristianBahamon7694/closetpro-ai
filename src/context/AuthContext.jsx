/* eslint-disable react-refresh/only-export-components, no-unused-vars, preserve-caught-error */
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { supabase } from '../services/supabase';

const AuthContext = createContext(null);

// Translate Supabase errors into natural, friendly Spanish
const translateAuthError = (error) => {
  if (!error) return null;
  const msg = error.message || '';
  
  if (msg.includes('Invalid login credentials') || msg.includes('does not match') || msg.includes('invalid_grant')) {
    return new Error('Credenciales de acceso incorrectas. Por favor, verifica tu correo y contraseña.');
  }
  if (msg.includes('User already exists') || msg.includes('signup_disabled')) {
    return new Error('Este correo electrónico ya está registrado en ClosetPro AI.');
  }
  if (msg.includes('Password should be')) {
    return new Error('La contraseña es demasiado débil. Debe tener al menos 6 caracteres.');
  }
  if (msg.includes('Email not confirmed') || msg.includes('confirmation')) {
    return new Error('Por favor, confirma tu dirección de correo electrónico antes de iniciar sesión.');
  }
  if (msg.includes('Rate limit exceeded') || msg.includes('too many requests')) {
    return new Error('Límite de solicitudes excedido. Por favor, espera unos minutos e inténtalo de nuevo.');
  }
  if (msg.includes('Network') || msg.includes('fetch')) {
    return new Error('Error de conexión a internet. Por favor, verifica tu red.');
  }
  
  return new Error(msg || 'Ha ocurrido un error inesperado durante la autenticación.');
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const registeringRef = useRef(false);

  useEffect(() => {
    // 1. Check initial active session
    const checkInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        setUser(session?.user ?? null);
      } catch (err) {
        console.error('[AuthContext] Error getting initial session:', err);
      } finally {
        setLoading(false);
      }
    };

    checkInitialSession();

    // 2. Listen to active auth session status changes (Login, Logout, Token Refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (registeringRef.current) {
        console.log('[AuthContext] Ignoring auth state change event during active registration flow:', event);
        return;
      }

      const newUser = session?.user ?? null;
      console.log('[AuthContext] onAuthStateChange event triggered:', event, {
        userId: newUser?.id || 'null',
        email: newUser?.email || 'null'
      });

      setUser((prevUser) => {
        if (prevUser?.id === newUser?.id) {
          console.log('[AuthContext] User state unchanged (IDs match). Skipping state update to prevent rerender loops.');
          return prevUser;
        }
        console.log('[AuthContext] Updating user state:', {
          from: prevUser?.email || 'null',
          to: newUser?.email || 'null'
        });
        return newUser;
      });
    });

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  const login = async (email, password) => {
    console.log('[AuthContext] login() initiated for email:', email);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      console.log('[AuthContext] Supabase signInWithPassword response:', {
        success: !error,
        hasUser: !!data?.user,
        hasSession: !!data?.session,
        errorMsg: error?.message || 'none'
      });

      if (error) throw error;
      
      console.log('[AuthContext] Login successful. Updating user state:', data.user?.email);
      setUser(data.user);
      return data.user;
    } catch (err) {
      console.error('[AuthContext] Login failed:', err.message || err);
      const translatedError = translateAuthError(err);
      throw translatedError;
    }
  };

  const register = async (email, password, fullName) => {
    console.log('[AuthContext] register() initiated for email:', email);
    registeringRef.current = true;
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { 
            fullName,
            // Pre-fill some default user metadata settings in Spanish
            role: 'owner',
            createdAt: new Date().toISOString()
          }
        }
      });

      console.log('[AuthContext] Supabase signUp response:', {
        success: !error,
        hasUser: !!data?.user,
        hasSession: !!data?.session,
        errorMsg: error?.message || 'none'
      });

      if (error) throw error;

      // In some Supabase projects, email confirmation is active.
      // If data.session is null, it means confirmation is required.
      if (data?.user && !data?.session) {
        console.log('[AuthContext] Registration completed but email confirmation is active. throwing custom tag.');
        throw new Error('registration_successful_confirm_email');
      }

      console.log('[AuthContext] Registration successful. Auto-login prevention...');
      if (data?.session) {
        await supabase.auth.signOut();
      }
      return data.user;
    } catch (err) {
      console.error('[AuthContext] Registration failed:', err.message || err);
      
      // Special custom message for confirming email redirection
      if (err.message === 'registration_successful_confirm_email') {
        throw new Error('¡Registro exitoso! Te hemos enviado un enlace de confirmación por correo electrónico.');
      }
      
      const translatedError = translateAuthError(err);
      throw translatedError;
    } finally {
      setTimeout(() => {
        registeringRef.current = false;
      }, 150);
    }
  };

  const logout = async () => {
    console.log('[AuthContext] logout() initiated');
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      console.log('[AuthContext] Logout successful. Setting user to null.');
      setUser(null);
    } catch (err) {
      console.error('[AuthContext] Error during logout:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
