
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
    
    // REMOVE ALL AUTH STATE LISTENERS FROM HERE
    // AuthProvider will handle ALL auth state changes
    console.log("🔧 AuthenticationManager: Delegating all auth state management to AuthProvider");
    
    // No subscription to clean up since we removed the listener
    return () => {
      console.log("AuthenticationManager cleanup - no auth listeners to remove");
    };
  }, [onAuthenticated, onNotAuthenticated, onEmailNotVerified, navigate, location]);

  return null; // This is a logic component, it doesn't render anything
};

export default AuthenticationManager;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
