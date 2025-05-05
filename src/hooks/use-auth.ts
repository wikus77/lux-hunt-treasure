
import { useState, useEffect } from 'react';
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
        setSession(currentSession);
        
        if (event === 'SIGNED_OUT') {
          toast.info("Disconnesso", {
            description: "Hai effettuato il logout con successo."
          });
          setIsEmailVerified(false);
        } else if (event === 'SIGNED_IN') {
          // Controllo se l'email è stata verificata
          if (currentSession?.user.email_confirmed_at) {
            setIsEmailVerified(true);
            toast.success("Accesso effettuato", {
              description: "Hai effettuato l'accesso con successo."
            });
          } else {
            setIsEmailVerified(false);
            toast.warning("Email non verificata", {
              description: "Controlla la tua casella di posta per verificare la tua email."
            });
          }
        } else if (event === 'TOKEN_REFRESHED') {
          console.log("Token aggiornato automaticamente");
        } else if (event === 'USER_UPDATED') {
          // Controlla se l'email è stata verificata dopo un aggiornamento dell'utente
          if (currentSession?.user.email_confirmed_at) {
            setIsEmailVerified(true);
            toast.success("Email verificata", {
              description: "La tua email è stata verificata con successo."
            });
          }
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
        
        // Controlla se l'email è stata verificata
        if (data.session?.user.email_confirmed_at) {
          setIsEmailVerified(true);
        } else {
          setIsEmailVerified(false);
        }
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
      
      // Controlla se l'email è stata verificata
      if (data.user.email_confirmed_at) {
        setIsEmailVerified(true);
      } else {
        setIsEmailVerified(false);
        toast.warning("Email non verificata", {
          description: "Controlla la tua casella di posta per verificare la tua email."
        });
      }
      
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

  // Funzione per inviare nuovamente l'email di verifica
  const resendVerificationEmail = async (email: string) => {
    try {
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
      console.error("Errore nell'invio dell'email di verifica:", error.message);
      toast.error("Errore", {
        description: error.message || "Impossibile inviare l'email di verifica."
      });
      return { success: false, error };
    }
  };

  // Funzione per effettuare il logout
  const logout = async () => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      setIsEmailVerified(false);
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
    isEmailVerified,
    isAuthenticated,
    login,
    logout,
    getCurrentUser,
    getAccessToken,
    resendVerificationEmail
  };
};
