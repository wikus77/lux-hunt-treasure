
import { useEffect, useState } from "react";
import { useNavigateCompat } from "@/hooks/useNavigateCompat";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

type VerificationStatus = 'idle' | 'verifying' | 'success' | 'error';

/**
 * Hook that handles email verification from redirects
 */
export const useEmailVerificationHandler = () => {
  // Disabilitato useSearchParams per Zustand
  const navigate = useNavigateCompat();
  const [status, setStatus] = useState<VerificationStatus>('idle');

  useEffect(() => {
    // Run once on component mount
    handleEmailVerification();
  }, []);

  const handleEmailVerification = async () => {
    // Disabilitato per compatibilità Zustand - verificazione tramite searchParams
    console.log('EmailVerificationHandler: Disabled for Zustand compatibility');
    return false; // Disabilitato temporaneamente
  };

  return { status };
};

// Create a standalone component for email verification page
export const EmailVerificationPage: React.FC = () => {
  const { status } = useEmailVerificationHandler();
  const navigate = useNavigateCompat();
  
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
