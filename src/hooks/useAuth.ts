import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  
  // États de loading centralisés
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Gérer les erreurs de token de rafraîchissement
        if (event === 'TOKEN_REFRESHED' && !session) {
          console.warn('Token refresh failed, clearing invalid session');
          await clearInvalidSession();
          return;
        }
        
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // THEN check for existing session with error handling
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Error getting session:', error);
        // Si c'est une erreur de token de rafraîchissement, nettoyer la session
        if (error.message?.includes('refresh_token') || error.message?.includes('Invalid Refresh Token')) {
          clearInvalidSession();
        }
      } else {
        setSession(session);
        setUser(session?.user ?? null);
      }
      setLoading(false);
    }).catch((error) => {
      console.error('Unexpected error getting session:', error);
      clearInvalidSession();
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string, role: string) => {
    setIsSigningUp(true);
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
            role: role
          }
        }
      });
      return { error };
    } finally {
      setIsSigningUp(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setIsLoggingIn(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      return { error };
    } finally {
      setIsLoggingIn(false);
    }
  };

  const signInWithGoogle = async () => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl
      }
    });
    return { error };
  };

  const signOut = async () => {
    setIsLoggingOut(true);
    try {
      const { error } = await supabase.auth.signOut();
      return { error };
    } finally {
      setIsLoggingOut(false);
    }
  };

  const checkSessionValidity = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Session validation error:', error);
        // Si c'est une erreur de token de rafraîchissement, nettoyer proprement
        if (error.message?.includes('refresh_token') || error.message?.includes('Invalid Refresh Token')) {
          await clearInvalidSession();
        } else {
          forceSignOut();
        }
        return false;
      }
      if (!session) {
        forceSignOut();
        return false;
      }
      return true;
    } catch (error) {
      console.error('Unexpected error validating session:', error);
      await clearInvalidSession();
      return false;
    }
  };

  const clearInvalidSession = async () => {
    try {
      // Nettoyer le localStorage des tokens invalides
      localStorage.removeItem('sb-snrlnfldhbopiyjwnjlu-auth-token');
      localStorage.removeItem('supabase.auth.token');
      
      // Forcer la déconnexion côté Supabase
      await supabase.auth.signOut({ scope: 'local' });
      
      // Mettre à jour l'état local
      setUser(null);
      setSession(null);
      setLoading(false);
      
      console.log('Invalid session cleared successfully');
    } catch (error) {
      console.error('Error clearing invalid session:', error);
      // En cas d'erreur, forcer quand même la déconnexion locale
      setUser(null);
      setSession(null);
      setLoading(false);
    }
  };

  const forceSignOut = () => {
    // Force la déconnexion locale - À utiliser uniquement en cas d'erreur de session
    setUser(null);
    setSession(null);
    setLoading(false);
  };

  // Vérifier la validité de la session au chargement
  useEffect(() => {
    if (user && session) {
      checkSessionValidity();
    }
  }, [user, session]);

  return {
    user,
    session,
    loading,
    isLoggingIn,
    isSigningUp,
    isLoggingOut,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    forceSignOut,
    checkSessionValidity,
    clearInvalidSession
  };
}