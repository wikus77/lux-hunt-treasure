import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: Error | null;
  isAuthenticated: boolean;
  isEmailVerified: boolean;
}

export function useAuth() {
  const navigate = useNavigate();
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    error: null,
    isAuthenticated: false,
    isEmailVerified: false,
  });

  useEffect(() => {
    // Controlla se c'è già una sessione attiva
    const fetchSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        const session = data?.session;
        const user = session?.user || null;
        
        console.log("Stato autenticazione:", user ? "Autenticato" : "Non autenticato");
        
        setAuthState({
          user,
          session,
          loading: false,
          error: null,
          isAuthenticated: !!user,
          isEmailVerified: !!user?.email_confirmed_at,
        });
      } catch (error) {
        console.error("Errore durante il controllo della sessione:", error);
        setAuthState({
          user: null,
          session: null,
          loading: false,
          error: error as Error,
          isAuthenticated: false,
          isEmailVerified: false,
        });
      }
    };

    // Carica la sessione all'avvio
    fetchSession();

    // Imposta listener per i cambiamenti di autenticazione
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Evento di autenticazione:", event);
        
        setAuthState({
          user: session?.user || null,
          session,
          loading: false,
          error: null,
          isAuthenticated: !!session?.user,
          isEmailVerified: !!session?.user?.email_confirmed_at,
        });
      }
    );

    // Pulizia dell'effetto
    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  const login = async (email: string, password: string, turnstileToken?: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      // Special redirect for developer access
      if (email === 'joseph@m1ssion.com') {
        console.log('Developer access detected, redirecting to /home');
        navigate('/home');
      }

      toast.success("Login effettuato con successo");
      return { success: true, data };
    } catch (error: any) {
      console.error("Errore durante il login:", error);
      toast.error("Errore durante il login", {
        description: error.message || "Controlla le tue credenziali e riprova",
      });
      return { success: false, error };
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      toast.success("Logout effettuato con successo");
    } catch (error: any) {
      console.error("Errore durante il logout:", error);
      toast.error("Errore durante il logout", {
        description: error.message || "Si è verificato un errore durante il logout",
      });
      throw error;
    }
  };

  const getCurrentUser = () => authState.user;

  return {
    ...authState,
    login,
    logout,
    getCurrentUser,
  };
}
