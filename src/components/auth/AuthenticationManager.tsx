
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useWouterNavigation } from "@/hooks/useWouterNavigation";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AuthenticationManagerProps {
  onAuthenticated: (userId: string) => void;
  onNotAuthenticated: () => void;
  onEmailNotVerified: () => void;
}

export const AuthenticationManager: React.FC<AuthenticationManagerProps> = ({
  onAuthenticated,
  onNotAuthenticated,
  onEmailNotVerified
}) => {
  const { navigate } = useWouterNavigation();
  const [location] = useLocation();
  
  useEffect(() => {
    console.log("AuthenticationManager initialized at path:", location);
    
    const checkAuthentication = async () => {
      try {
        console.log("Checking authentication status...");
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error checking session:", error);
          onNotAuthenticated();
          return;
        }
        
        if (session?.user) {
          console.log("Session found, user ID:", session.user.id);
          
          // Check if the email is verified
          if (!session.user.email_confirmed_at) {
            console.log("Email not verified, redirecting to verification page");
            // Email not verified
            onEmailNotVerified();
            return;
          }
          
          console.log("User is fully authenticated");
          // Email is verified, user is authenticated
          onAuthenticated(session.user.id);
        } else {
          console.log("No active session found");
          // No session, user is not authenticated
          onNotAuthenticated();
        }
      } catch (error) {
        console.error("Unexpected error in authentication check:", error);
        onNotAuthenticated();
      }
    };
    
    checkAuthentication();
    
    // SIMPLIFIED AUTH LISTENER - Remove redundant auth state handling
    // Let AuthProvider handle the auth state changes to prevent conflicts
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("🔄 AuthManager - Auth state:", event, !!session);
        
        // Only handle sign out event here
        if (event === "SIGNED_OUT") {
          console.log("👋 User signed out - redirecting if needed");
          onNotAuthenticated();
          
          // Redirect to login page if on a protected route
          const protectedRoutes = ['/home', '/profile', '/events', '/buzz', '/map', '/settings'];
          if (protectedRoutes.some(route => location.startsWith(route))) {
            navigate('/login');
          }
        }
      }
    );
    
    return () => {
      console.log("Unsubscribing from auth state changes");
      subscription.unsubscribe();
    };
  }, [onAuthenticated, onNotAuthenticated, onEmailNotVerified, navigate, location]);

  return null; // This is a logic component, it doesn't render anything
};

export default AuthenticationManager;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
