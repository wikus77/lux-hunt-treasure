
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { toast } from "sonner";

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: Error | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    error: null,
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
        });
      } catch (error) {
        console.error("Errore durante il controllo della sessione:", error);
        setAuthState({
          user: null,
          session: null,
          loading: false,
          error: error as Error,
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

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      toast.success("Login effettuato con successo");
      return data;
    } catch (error: any) {
      console.error("Errore durante il login:", error);
      toast.error("Errore durante il login", {
        description: error.message || "Controlla le tue credenziali e riprova",
      });
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log('🔒 Logging out user - ensuring Live Activity cleanup');
      
      // Importazione dinamica per evitare circular dependency
      const { useDynamicIsland } = await import('./useDynamicIsland');
      const { forceEndActivity } = useDynamicIsland();
      
      // Chiusura forzata di sicurezza prima del logout
      await forceEndActivity();
      
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

  return {
    ...authState,
    login,
    logout,
  };
}
