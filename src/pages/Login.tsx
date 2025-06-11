
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import AnimatedLogo from "@/components/logo/AnimatedLogo";
import { supabase } from "@/integrations/supabase/client";
import { LoginForm } from "@/components/auth/login-form";
import BackgroundParticles from "@/components/ui/background-particles";
import { useAuth } from "@/hooks/use-auth";
import { Spinner } from "@/components/ui/spinner";

const Login = () => {
  const [verificationStatus, setVerificationStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [autoLoginAttempted, setAutoLoginAttempted] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, isLoading: authLoading, login } = useAuth();

  useEffect(() => {
    const verification = searchParams.get('verification');
    if (verification === 'pending') {
      setVerificationStatus('pending');
    } else if (verification === 'success') {
      setVerificationStatus('success');
      toast.success("Email verificata", {
        description: "La tua email è stata verificata con successo."
      });
    }

    // Enhanced authentication check with immediate redirect
    if (!authLoading && isAuthenticated) {
      console.log('✅ User already authenticated, redirecting to /home');
      navigate('/home', { replace: true });
    }
  }, [navigate, searchParams, authLoading, isAuthenticated]);

  // Auto-login for developer email
  useEffect(() => {
    const attemptAutoLogin = async () => {
      if (!autoLoginAttempted && !authLoading && !isAuthenticated) {
        const developerEmail = 'wikus77@hotmail.it';
        const autoLoginEnabled = localStorage.getItem('auto_login_enabled') !== 'false';
        
        if (autoLoginEnabled) {
          console.log('🔄 Attempting auto-login for developer...');
          setAutoLoginAttempted(true);
          
          try {
            const result = await login(developerEmail, 'developer123');
            if (result?.success) {
              console.log('✅ Auto-login successful');
              toast.success('Auto-login sviluppatore riuscito');
              setTimeout(() => navigate('/home', { replace: true }), 1000);
            } else {
              console.log('⚠️ Auto-login failed, showing login form');
            }
          } catch (error) {
            console.log('⚠️ Auto-login error:', error);
          }
        }
      }
    };

    // Delay auto-login slightly to avoid conflicts
    const timer = setTimeout(attemptAutoLogin, 1000);
    return () => clearTimeout(timer);
  }, [authLoading, isAuthenticated, autoLoginAttempted, login, navigate]);

  // Enhanced session persistence check on mount
  useEffect(() => {
    const checkSessionPersistence = async () => {
      if (!authLoading) {
        const { data: { session } } = await supabase.auth.getSession();
        console.log('🔍 LOGIN PAGE SESSION CHECK:', {
          session: session?.user?.email || 'None',
          localStorage: localStorage.getItem('sb-vkjrqirvdvjbemsfzxof-auth-token') ? 'Present' : 'Missing'
        });
        
        if (session && !isAuthenticated) {
          console.log('⚠️ SESSION EXISTS BUT AUTH STATE NOT UPDATED - FORCING AUTH UPDATE');
          window.location.reload();
        }
      }
    };
    
    checkSessionPersistence();
  }, [authLoading, isAuthenticated]);

  const handleResendVerification = async (email: string) => {
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

  // Show loading while checking auth state or during auto-login
  if (authLoading || (autoLoginAttempted && !isAuthenticated)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <Spinner className="h-8 w-8 text-white mx-auto mb-4" />
          <p className="text-white/70">
            {autoLoginAttempted ? 'Tentativo auto-login...' : 'Verifica autenticazione...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4 py-12 relative overflow-hidden">
      <BackgroundParticles count={15} />

      <motion.div 
        className="w-full max-w-md z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <AnimatedLogo />
          </div>
          <h2 className="text-2xl font-bold text-white mb-1">Accedi</h2>
          <p className="text-gray-400">
            Inserisci le tue credenziali per accedere
          </p>
          {!autoLoginAttempted && (
            <p className="text-xs text-cyan-400 mt-2">
              Auto-login sviluppatore attivo
            </p>
          )}
        </div>

        <div className="glass-card p-6 backdrop-blur-md border border-gray-800 rounded-xl">
          <LoginForm 
            verificationStatus={verificationStatus}
            onResendVerification={handleResendVerification}
          />

          <div className="mt-6 text-center">
            <p className="text-sm text-white/70">
              Non hai un account?{" "}
              <Link to="/register" className="text-cyan-400 hover:text-cyan-300 transition-colors">
                Registrati
              </Link>
            </p>
            <p className="text-sm text-white/50 mt-2">
              <Link to="/" className="text-cyan-400 hover:text-cyan-300 transition-colors">
                ← Torna alla homepage
              </Link>
            </p>
            <button 
              onClick={() => {
                localStorage.setItem('auto_login_enabled', 'false');
                toast.info('Auto-login disabilitato');
              }}
              className="text-xs text-gray-500 hover:text-gray-400 mt-2 block mx-auto"
            >
              Disabilita auto-login
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
