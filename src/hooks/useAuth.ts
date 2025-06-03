
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
    // Force session fetch on mount
    const fetchSession = async () => {
      try {
        console.log("🔍 Forcing session fetch on mount...");
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        const session = data?.session;
        const user = session?.user || null;

        console.log("Stato autenticazione:", user ? "Autenticato" : "Non autenticato");
        console.log("User email:", user?.email);

        // Developer bypass for wikus77@hotmail.it
        if (user?.email === "wikus77@hotmail.it") {
          console.log("🔓 Developer bypass: allowing access for wikus77@hotmail.it");
          const fakeUser = {
            id: "dev-user-id",
            email: "wikus77@hotmail.it",
            role: "developer",
            aud: "authenticated",
            app_metadata: { provider: "email" },
            user_metadata: { name: "Wikus Developer" },
            created_at: new Date().toISOString(),
            email_confirmed_at: new Date().toISOString(), // Force email verified
          } as User;

          setAuthState({
            user: fakeUser,
            session: session || null,
            loading: false,
            error: null,
          });

          return;
        }

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

    // Force fetch session immediately
    fetchSession();

    // Set up auth state listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Evento di autenticazione:", event);
        
        const user = session?.user || null;
        
        // Developer bypass for wikus77@hotmail.it
        if (user?.email === "wikus77@hotmail.it") {
          console.log("🔓 Developer bypass active for wikus77@hotmail.it");
          const enhancedUser = {
            ...user,
            email_confirmed_at: new Date().toISOString(), // Force email verified
          };

          setAuthState({
            user: enhancedUser,
            session,
            loading: false,
            error: null,
          });
          return;
        }

        setAuthState({
          user,
          session,
          loading: false,
          error: null,
        });
      }
    );

    // Cleanup
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
