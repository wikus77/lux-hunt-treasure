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

    fetchSession();

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

      // ✅ Salvataggio email sviluppatore
      if (data?.user?.email === "wikus77@hotmail.it") {
        localStorage.setItem("developer_email", "wikus77@hotmail.it");
        console.log("✅ Email sviluppatore salvata nel localStorage");
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
