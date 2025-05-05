
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import AnimatedLogo from "@/components/logo/AnimatedLogo";
import { supabase } from "@/integrations/supabase/client";
import { LoginForm } from "@/components/auth/login-form";

const Login = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [verificationStatus, setVerificationStatus] = useState<string | null>(null);

  useEffect(() => {
    // Check URL parameters for verification status
    const verification = searchParams.get('verification');
    if (verification === 'pending') {
      setVerificationStatus('pending');
    } else if (verification === 'success') {
      setVerificationStatus('success');
    }

    // Check if there's an active session already
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // If session exists and email is verified, redirect to auth component
        // Auth component will handle redirection based on quiz completion
        if (session.user.email_confirmed_at) {
          navigate('/auth');
        }
      }
    };
    
    checkSession();
  }, [navigate, searchParams]);

  const handleResendVerification = async () => {
    if (!email) {
      toast.error("Errore", {
        description: "Inserisci la tua email per ricevere nuovamente il link di verifica."
      });
      return;
    }

    try {
      setIsLoading(true);
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email
      });

      if (error) throw error;

      toast.success("Email inviata", {
        description: "Un nuovo link di verifica è stato inviato alla tua email."
      });
    } catch (error: any) {
      toast.error("Errore", {
        description: error.message || "Impossibile inviare l'email di verifica."
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          {/* Logo animato */}
          <div className="flex justify-center mb-4">
            <AnimatedLogo />
          </div>
          <p className="text-muted-foreground">
            Accedi al tuo account
          </p>
        </div>

        <LoginForm 
          verificationStatus={verificationStatus}
          onResendVerification={handleResendVerification}
        />

        <div className="mt-6 text-center">
          <p className="text-sm text-white/70">
            Accedendo accetti i nostri Termini e Condizioni e la nostra Informativa sulla Privacy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
