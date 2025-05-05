
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useAuth = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const navigate = useNavigate();

  // Verifica la sessione al caricamento e imposta un listener per i cambiamenti
  useEffect(() => {
    // Imposta il listener per i cambiamenti di autenticazione PRIMA
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log("Auth state change event:", event);
        setSession(currentSession);
        
        if (event === 'SIGNED_OUT') {
          console.log("User signed out");
          // Clear any locally stored data
          localStorage.removeItem('userProfileType');
          localStorage.removeItem('investigativeStyle');
          localStorage.removeItem('investigativeStyleColor');
          
          setIsEmailVerified(false);
        } else if (event === 'SIGNED_IN') {
          console.log("User signed in:", currentSession?.user);
          // Controllo se l'email è stata verificata
          if (currentSession?.user?.email_confirmed_at) {
            setIsEmailVerified(true);
          } else {
            setIsEmailVerified(false);
            navigate('/login?verification=pending');
          }
        } else if (event === 'TOKEN_REFRESHED') {
          console.log("Token refreshed automatically");
        } else if (event === 'USER_UPDATED') {
          console.log("User updated");
          // Controlla se l'email è stata verificata dopo un aggiornamento dell'utente
          if (currentSession?.user?.email_confirmed_at) {
            setIsEmailVerified(true);
          }
        }
        
        setIsLoading(false);
      }
    );

    // POI verifica la sessione esistente
    const checkSession = async () => {
      try {
        console.log("Checking existing session...");
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        console.log("Session check result:", data.session ? "Found session" : "No session");
        setSession(data.session);
        
        // Controlla se l'email è stata verificata
        if (data.session?.user?.email_confirmed_at) {
          console.log("Email is verified");
          setIsEmailVerified(true);
        } else if (data.session) {
          console.log("Email is NOT verified");
          setIsEmailVerified(false);
          navigate('/login?verification=pending');
        }
      } catch (error: any) {
        console.error("Error retrieving session:", error.message);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    // Cleanup del listener all'unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  // Funzione per effettuare il login
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      console.log("Attempting login for:", email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Login error:", error.message);
        throw error;
      }
      
      console.log("Login successful, user:", data.user?.id);
      
      // Controlla se l'email è stata verificata
      if (data.user?.email_confirmed_at) {
        setIsEmailVerified(true);
        // Redirect to home or dashboard
        navigate('/home');
      } else {
        setIsEmailVerified(false);
        // Redirect to verification pending page
        navigate('/login?verification=pending');
      }
      
      return { success: true, data };
    } catch (error: any) {
      console.error("Login failed:", error.message);
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  // Funzione per inviare nuovamente l'email di verifica
  const resendVerificationEmail = async (email: string) => {
    try {
      console.log("Resending verification email to:", email);
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email
      });

      if (error) throw error;
      
      toast.success("Email inviata", {
        description: "Un nuovo link di verifica è stato inviato alla tua email."
      });
      
      return { success: true };
    } catch (error: any) {
      console.error("Failed to resend verification email:", error.message);
      return { success: false, error };
    }
  };

  // Funzione per effettuare il logout
  const logout = useCallback(async () => {
    setIsLoading(true);
    
    try {
      console.log("Attempting logout");
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      console.log("Logout successful");
      setIsEmailVerified(false);
      setSession(null);
      
      // Clear local storage data
      localStorage.removeItem('userProfileType');
      localStorage.removeItem('investigativeStyle');
      localStorage.removeItem('investigativeStyleColor');
      
      // Navigate to login page
      navigate('/login');
    } catch (error: any) {
      console.error("Logout failed:", error.message);
      toast.error("Errore durante il logout", {
        description: "Si è verificato un problema. Riprova più tardi."
      });
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  // Funzione per verificare se l'utente è autenticato
  const isAuthenticated = useCallback(() => {
    return !!session && isEmailVerified;
  }, [session, isEmailVerified]);

  // Funzione per ottenere l'utente corrente
  const getCurrentUser = useCallback(() => {
    return session?.user || null;
  }, [session]);

  // Funzione per ottenere il token di accesso
  const getAccessToken = useCallback(() => {
    return session?.access_token || null;
  }, [session]);

  return {
    session,
    isLoading,
    isEmailVerified,
    isAuthenticated,
    login,
    logout,
    getCurrentUser,
    getAccessToken,
    resendVerificationEmail
  };
};
