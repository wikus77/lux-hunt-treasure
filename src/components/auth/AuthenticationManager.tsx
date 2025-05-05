
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    console.log("AuthenticationManager initialized at path:", location.pathname);
    
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
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event);
        
        if (event === "SIGNED_IN" && session) {
          console.log("User signed in:", session.user.id);
          
          // Check if email is verified
          if (!session.user.email_confirmed_at) {
            console.log("Email not verified after sign in");
            onEmailNotVerified();
            return;
          }
          
          console.log("Authenticated user with verified email");
          onAuthenticated(session.user.id);
        } else if (event === "SIGNED_OUT") {
          console.log("User signed out");
          onNotAuthenticated();
          
          // Redirect to login page if on a protected route
          const protectedRoutes = ['/home', '/profile', '/events', '/buzz', '/map', '/settings'];
          if (protectedRoutes.some(route => location.pathname.startsWith(route))) {
            navigate('/login');
          }
        } else if (event === "USER_UPDATED") {
          console.log("User updated");
          
          // If email was just verified
          if (session?.user.email_confirmed_at) {
            toast.success("Email verificata con successo", {
              description: "Ora puoi accedere a tutte le funzionalità"
            });
            onAuthenticated(session.user.id);
          }
        }
      }
    );
    
    return () => {
      console.log("Unsubscribing from auth state changes");
      subscription.unsubscribe();
    };
  }, [onAuthenticated, onNotAuthenticated, onEmailNotVerified, navigate, location.pathname]);

  return null; // This is a logic component, it doesn't render anything
};

export default AuthenticationManager;
