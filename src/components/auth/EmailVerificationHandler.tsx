
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

type VerificationStatus = 'idle' | 'verifying' | 'success' | 'error';

/**
 * Hook that handles email verification from redirects
 */
export const useEmailVerificationHandler = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<VerificationStatus>('idle');

  useEffect(() => {
    // Run once on component mount
    handleEmailVerification();
  }, []);

  const handleEmailVerification = async () => {
    // Check if the URL contains a verification token from email
    const access_token = searchParams.get('access_token');
    const refresh_token = searchParams.get('refresh_token');
    const type = searchParams.get('type');

    if (access_token && refresh_token && type === 'email_confirmation') {
      setStatus('verifying');
      try {
        await supabase.auth.setSession({
          access_token,
          refresh_token
        });
        
        // Email is now verified
        setStatus('success');
        toast.success("Email verificata con successo", {
          description: "Ora puoi accedere alla M1SSION."
        });
        
        // Redirect to auth to complete authentication flow
        navigate('/auth');
        return true;
      } catch (error) {
        console.error("Error handling email verification:", error);
        setStatus('error');
        toast.error("Errore di verifica", {
          description: "Si è verificato un problema durante la verifica dell'email."
        });
      }
    }
    return false;
  };

  return { status };
};

// Create a standalone component for email verification page
export const EmailVerificationPage: React.FC = () => {
  const { status } = useEmailVerificationHandler();
  const navigate = useNavigate();
  
  // UI for different verification states
  if (status === 'verifying') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-black">
        <div className="bg-black/50 border border-blue-500/30 rounded-lg p-6 max-w-md mx-auto text-center">
          <h2 className="text-xl font-bold mb-4 text-white">Verifica in corso</h2>
          <Loader2 className="animate-spin h-8 w-8 text-cyan-400 mx-auto mb-4" />
          <p className="mb-6 text-white/80">
            Stiamo verificando la tua email, attendere prego...
          </p>
        </div>
      </div>
    );
  }
  
  if (status === 'error') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-black">
        <div className="bg-black/50 border border-red-500/30 rounded-lg p-6 max-w-md mx-auto text-center">
          <h2 className="text-xl font-bold mb-4 text-white">Verifica fallita</h2>
          <p className="mb-6 text-white/80">
            Si è verificato un problema durante la verifica della tua email. Il link potrebbe essere scaduto.
          </p>
          <Button onClick={() => navigate("/login")}>Torna al login</Button>
        </div>
      </div>
    );
  }
  
  // This will only show briefly before redirect happens
  return null;
};
