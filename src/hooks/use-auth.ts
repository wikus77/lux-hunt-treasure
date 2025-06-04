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
    
    // BYPASS COMPLETO CAPTCHA per email sviluppatore - FORZA EDGE FUNCTION
    if (email === 'wikus77@hotmail.it') {
      console.log("🔑 DEVELOPER BYPASS: Login diretto per sviluppatore - NESSUN CAPTCHA");
      
      try {
        // Chiamata diretta SOLO alla funzione edge per sviluppatore
        const response = await fetch("https://vkjrqirvdvjbemsfzxof.functions.supabase.co/login-no-captcha", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZranJxaXJ2ZHZqYmVtc2Z6eG9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwMzQyMjYsImV4cCI6MjA2MDYxMDIyNn0.rb0F3dhKXwb_110--08Jsi4pt_jx-5IWwhi96eYMxBk`
          },
          body: JSON.stringify({ 
            email, 
            password: "developer_bypass" // Password ignorata dalla funzione
          }),
        });

        if (response.ok) {
          const data = await response.json();
          
          if (data.action_link) {
            // ✅ FIX: Usa il magic link per autenticare l'utente
            console.log("✅ Magic link ricevuto per sviluppatore");
            
            // Estrai i parametri dal magic link
            const url = new URL(data.action_link);
            const accessToken = url.searchParams.get('access_token');
            const refreshToken = url.searchParams.get('refresh_token');
            
            if (accessToken && refreshToken) {
              // Imposta la sessione sviluppatore
              const { error } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
              });
              
              if (!error) {
                console.log("✅ Login sviluppatore completato - CAPTCHA COMPLETAMENTE BYPASSATO");
                // Redirect automatico a /home
                window.location.href = '/home';
                return { success: true, data };
              }
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

    // Login standard per altri utenti (CAPTCHA RIMANE ATTIVO)
    try {
      const options: any = {};
      
      // Solo per utenti NON sviluppatori, usa CAPTCHA
      if (captchaToken) {
        options.options = {
          captchaToken: captchaToken
        };
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
        ...options
      });

      if (error) {
        console.error("Login error:", error.message);
        return { success: false, error };
      }

      console.log("Login successful for:", email);
      
      return { success: true, data };
    } catch (error) {
      console.error("Unexpected login error:", error);
      return {
        success: false,
        error: { message: "Si è verificato un errore imprevisto durante l'accesso." } as AuthError
      };
    }
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
