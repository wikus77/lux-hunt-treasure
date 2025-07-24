
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
    console.log("🔐 AuthenticationManager PWA iOS Enhanced - initialized at path:", location);
    
    const checkAuthentication = async () => {
      try {
        console.log("🔍 Checking authentication status with PWA iOS optimizations...");
        
        // PWA iOS: Add retry mechanism for session checks
        let retryCount = 0;
        const maxRetries = 3;
        let session = null;
        let error = null;
        
        while (retryCount < maxRetries && !session) {
          const response = await supabase.auth.getSession();
          session = response.data?.session;
          error = response.error;
          
          if (error || !session) {
            retryCount++;
            if (retryCount < maxRetries) {
              console.log(`🔄 Session check retry ${retryCount}/${maxRetries}`);
              await new Promise(resolve => setTimeout(resolve, 100 * retryCount));
            }
          }
        }
        
        if (error) {
          console.error("❌ Error checking session after retries:", error);
          onNotAuthenticated();
          return;
        }
        
        if (session?.user) {
          console.log("✅ Session found, user ID:", session.user.id);
          
          // Check if the email is verified
          if (!session.user.email_confirmed_at) {
            console.log("📧 Email not verified, triggering email verification flow");
            onEmailNotVerified();
            return;
          }
          
          console.log("🎯 User is fully authenticated - triggering success callback");
          onAuthenticated(session.user.id);
        } else {
          console.log("🚫 No active session found - user not authenticated");
          onNotAuthenticated();
        }
      } catch (error) {
        console.error("💥 Unexpected error in authentication check:", error);
        onNotAuthenticated();
      }
    };
    
    // Immediate check
    checkAuthentication();
    
    // PWA iOS: Enhanced cleanup and delegation
    console.log("🔧 AuthenticationManager: Enhanced PWA iOS - delegating to AuthProvider");
    
    return () => {
      console.log("🧹 AuthenticationManager cleanup - PWA iOS optimized");
    };
  }, [onAuthenticated, onNotAuthenticated, onEmailNotVerified, navigate, location]);

  return null; // This is a logic component, it doesn't render anything
};

export default AuthenticationManager;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
