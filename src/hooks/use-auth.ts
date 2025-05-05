
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useAuth = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Verifica la sessione al caricamento e imposta un listener per i cambiamenti
  useEffect(() => {
    // Imposta il listener per i cambiamenti di autenticazione PRIMA
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession(currentSession);
        
        if (event === 'SIGNED_OUT') {
          toast.info("Disconnesso", {
            description: "Hai effettuato il logout con successo."
          });
        } else if (event === 'SIGNED_IN') {
          toast.success("Accesso effettuato", {
            description: "Hai effettuato l'accesso con successo."
          });
        } else if (event === 'TOKEN_REFRESHED') {
          console.log("Token aggiornato automaticamente");
        }
        
        setIsLoading(false);
      }
    );

    // POI verifica la sessione esistente
    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        setSession(data.session);
      } catch (error: any) {
        console.error("Errore nel recupero della sessione:", error.message);
        toast.error("Errore di autenticazione", {
          description: "Si è verificato un problema con la tua sessione."
        });
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    // Cleanup del listener all'unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Funzione per effettuare il login
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      // La sessione viene gestita automaticamente da Supabase
      // e il listener onAuthStateChange gestirà l'aggiornamento dello stato
      
      return { success: true, data };
    } catch (error: any) {
      console.error("Errore durante il login:", error.message);
      toast.error("Accesso fallito", {
        description: error.message || "Credenziali non valide. Riprova."
      });
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  // Funzione per effettuare il logout
  const logout = async () => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      // La rimozione della sessione viene gestita automaticamente da Supabase
      // e il listener onAuthStateChange gestirà l'aggiornamento dello stato
      
      navigate('/login');
    } catch (error: any) {
      console.error("Errore durante il logout:", error.message);
      toast.error("Errore durante il logout", {
        description: "Si è verificato un problema. Riprova più tardi."
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Funzione per verificare se l'utente è autenticato
  const isAuthenticated = () => {
    return !!session;
  };

  // Funzione per ottenere l'utente corrente
  const getCurrentUser = () => {
    return session?.user || null;
  };

  // Funzione per ottenere il token di accesso
  const getAccessToken = () => {
    return session?.access_token || null;
  };

  return {
    session,
    isLoading,
    isAuthenticated,
    login,
    logout,
    getCurrentUser,
    getAccessToken
  };
};
