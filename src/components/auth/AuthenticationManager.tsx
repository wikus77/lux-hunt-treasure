
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  
  useEffect(() => {
    const checkAuthentication = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Check if the email is verified
        if (!session.user.email_confirmed_at) {
          // Email not verified
          await supabase.auth.signOut();
          navigate('/login?verification=pending');
          onEmailNotVerified();
          return;
        }
        
        // Email is verified, user is authenticated
        onAuthenticated(session.user.id);
      } else {
        // No session, user is not authenticated
        onNotAuthenticated();
      }
    };
    
    checkAuthentication();
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session) {
          // Check if email is verified
          if (!session.user.email_confirmed_at) {
            await supabase.auth.signOut();
            navigate('/login?verification=pending');
            onEmailNotVerified();
            return;
          }
          
          onAuthenticated(session.user.id);
        } else if (event === "SIGNED_OUT") {
          onNotAuthenticated();
        }
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, [onAuthenticated, onNotAuthenticated, onEmailNotVerified, navigate]);

  return null; // This is a logic component, it doesn't render anything
};

export default AuthenticationManager;
