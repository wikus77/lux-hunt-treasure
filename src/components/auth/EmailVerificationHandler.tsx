
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Component that handles email verification from redirects
 * @returns Boolean indicating whether verification was handled
 */
export const useEmailVerificationHandler = (): boolean => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Run once on component mount
    handleEmailVerification();
  }, []);

  const handleEmailVerification = async (): Promise<boolean> => {
    // Check if the URL contains a verification token from email
    const access_token = searchParams.get('access_token');
    const refresh_token = searchParams.get('refresh_token');
    const type = searchParams.get('type');

    if (access_token && refresh_token && type === 'email_confirmation') {
      try {
        await supabase.auth.setSession({
          access_token,
          refresh_token
        });
        
        // Email is now verified
        toast.success("Email verificata con successo", {
          description: "Ora puoi accedere alla M1SSION."
        });
        
        // Redirect to auth to complete authentication flow
        navigate('/auth');
        return true;
      } catch (error) {
        console.error("Error handling email verification:", error);
        toast.error("Errore di verifica", {
          description: "Si è verificato un problema durante la verifica dell'email."
        });
      }
    }
    return false;
  };

  return false;
};
