import { useState, useEffect, useCallback } from 'react';
import { AuthError, Session, User } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { AuthContextType } from '@/contexts/auth/types';

/**
 * Hook for authentication functionality using Supabase Auth.
 * Handles login, registration, session management, and email verification.
 */
export function useAuth(): Omit<AuthContextType, 'userRole' | 'hasRole' | 'isRoleLoading'> {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isEmailVerified, setIsEmailVerified] = useState<boolean>(false);

  // Initialize auth state
  useEffect(() => {
    console.log("useAuth: Initializing auth state");
    
    // First set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log("Auth state changed:", event);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        // Update email verification status
        if (currentSession?.user) {
          // Per l'email sviluppatore, considera sempre verificata
          const isDeveloper = currentSession.user.email === 'wikus77@hotmail.it';
          setIsEmailVerified(isDeveloper || !!currentSession.user.email_confirmed_at);
          console.log("Email verification status:", isDeveloper || !!currentSession.user.email_confirmed_at);
        } else {
          setIsEmailVerified(false);
        }
        
        // Mark loading as complete after auth state changes
        setIsLoading(false);
      }
    );
    
    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      console.log("Initial session check:", initialSession ? "Found session" : "No session");
      setSession(initialSession);
      setUser(initialSession?.user ?? null);
      
      // Update email verification status
      if (initialSession?.user) {
        const isDeveloper = initialSession.user.email === 'wikus77@hotmail.it';
        setIsEmailVerified(isDeveloper || !!initialSession.user.email_confirmed_at);
        console.log("Initial email verification status:", isDeveloper || !!initialSession.user.email_confirmed_at);
      }
      
      // Mark loading as complete after initial check
      setIsLoading(false);
    });
    
    // Clean up subscription on unmount
    return () => {
      console.log("useAuth: Cleaning up subscription");
      subscription.unsubscribe();
    };
  }, []);

  /**
   * Login function using email and password
   */
  const login = async (email: string, password: string, captchaToken?: string) => {
    console.log("Login attempt for email:", email);
    
    // ✅ BYPASS COMPLETO per email sviluppatore - LOGIN DIRETTO SENZA MAGIC LINK
    if (email === 'wikus77@hotmail.it') {
      console.log("🔑 DEVELOPER BYPASS: Login diretto per sviluppatore - SESSIONE DIRETTA");
      
      try {
        // Chiamata diretta alla funzione edge per ottenere sessione diretta
        const response = await fetch("https://vkjrqirvdvjbemsfzxof.functions.supabase.co/login-no-captcha", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZranJxaXJ2ZHZqYmVtc2Z6eG9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwMzQyMjYsImV4cCI6MjA2MDYxMDIyNn0.rb0F3dhKXwb_110--08Jsi4pt_jx-5IWwhi96eYMxBk`
          },
          body: JSON.stringify({ email }),
        });

        if (response.ok) {
          const data = await response.json();
          
          if (data.session) {
            console.log("🧠 Sessione diretta ricevuta per sviluppatore");
            console.log("🧠 Sessione settata manualmente:", data.session);
            
            // Imposta la sessione direttamente in Supabase
            const { error } = await supabase.auth.setSession({
              access_token: data.session.access_token,
              refresh_token: data.session.refresh_token,
            });
            
            if (!error) {
              console.log("✅ Login sviluppatore completato - SESSIONE DIRETTA ATTIVA");
              localStorage.setItem('developer_access', 'granted');
              localStorage.setItem('developer_user_email', email);
              localStorage.setItem('captcha_bypassed', 'true');
              // Redirect automatico a /home
              window.location.href = '/home';
              return { success: true, data };
            } else {
              console.error("❌ Errore impostazione sessione:", error);
              return { success: false, error: { message: "Errore impostazione sessione" } };
            }
          }
        }
        
        const errorData = await response.json();
        return { success: false, error: { message: errorData.error || "Login sviluppatore fallito" } };
        
      } catch (error) {
        console.error("Errore login sviluppatore:", error);
        return { success: false, error: { message: "Errore durante il login sviluppatore" } };
      }
    }

    // ⚠️ STOP: Per altri utenti, blocca il login se non c'è CAPTCHA
    console.warn("⚠️ Altri utenti devono completare CAPTCHA - login bloccato");
    return { success: false, error: { message: "CAPTCHA richiesto per questo utente" } as AuthError };
  };

  /**
   * Logout function
   */
  const logout = async () => {
    console.log("Logging out user");
    try {
      await supabase.auth.signOut();
      toast.success("Logout effettuato");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Errore durante il logout");
    }
  };

  /**
   * Check if user is authenticated
   */
  const isAuthenticated = useCallback(() => {
    return !!user && !!session;
  }, [user, session]);

  /**
   * Get current authenticated user
   */
  const getCurrentUser = useCallback(() => {
    return user;
  }, [user]);

  /**
   * Get access token
   */
  const getAccessToken = useCallback(() => {
    return session?.access_token || null;
  }, [session]);

  /**
   * Sends a verification email to the specified email address
   */
  const resendVerificationEmail = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });

      if (error) {
        console.error("Error sending verification email:", error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      console.error("Exception sending verification email:", error);
      return { success: false, error: error.message };
    }
  };

  /**
   * Sends a password reset email to the specified email address
   */
  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset-password',
      });

      if (error) {
        console.error("Error sending password reset email:", error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      console.error("Exception sending password reset email:", error);
      return { success: false, error: error.message };
    }
  };

  return {
    session,
    isLoading,
    isEmailVerified,
    isAuthenticated: isAuthenticated(), 
    login,
    logout,
    getCurrentUser,
    getAccessToken,
    resendVerificationEmail,
    resetPassword,
    user,
  };
}
