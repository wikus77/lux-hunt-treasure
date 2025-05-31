
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
          
          // Special handling for developer access
          if (session.user.email === 'joseph@m1ssion.com') {
            console.log("Developer access detected");
            onAuthenticated(session.user.id);
            
            // Redirect to home if on landing page
            if (location.pathname === '/') {
              navigate('/home');
            }
            return;
          }
          
          // Check if the email is verified for normal users
          if (!session.user.email_confirmed_at) {
            console.log("Email not verified, redirecting to verification page");
            onEmailNotVerified();
            return;
          }
          
          console.log("User is fully authenticated");
          onAuthenticated(session.user.id);
        } else {
          console.log("No active session found");
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
          
          // Special handling for developer access
          if (session.user.email === 'joseph@m1ssion.com') {
            console.log("Developer signed in, redirecting to home");
            onAuthenticated(session.user.id);
            navigate('/home');
            return;
          }
          
          // Check if email is verified for normal users
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

  return null;
};

export default AuthenticationManager;
