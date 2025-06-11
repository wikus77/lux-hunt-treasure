
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
  const [isDeveloperAutoLogin, setIsDeveloperAutoLogin] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

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

  // Developer auto-login - NO PASSWORD, NO CAPTCHA
  useEffect(() => {
    const attemptDeveloperAutoLogin = async () => {
      if (!autoLoginAttempted && !authLoading && !isAuthenticated) {
        const autoLoginEnabled = localStorage.getItem('auto_login_enabled') !== 'false';
        
        if (autoLoginEnabled) {
          console.log('🔄 Attempting DEVELOPER AUTO-LOGIN (NO PASSWORD, NO CAPTCHA)...');
          setAutoLoginAttempted(true);
          setIsDeveloperAutoLogin(true);
          
          try {
            // Call the login-no-captcha edge function
            const { data, error } = await supabase.functions.invoke('login-no-captcha', {
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'application/json, text/plain, */*',
                'cf-bypass-bot-check': 'true',
                'x-real-ip': '127.0.0.1'
              }
            });

            if (error) {
              console.error('❌ Developer auto-login function error:', error);
              setIsDeveloperAutoLogin(false);
              return;
            }

            if (data?.success && data?.access_token) {
              console.log('✅ DEVELOPER AUTO-LOGIN SUCCESS - setting session...');
              
              // Force session with developer tokens
              const { error: sessionError } = await supabase.auth.setSession({
                access_token: data.access_token,
                refresh_token: data.refresh_token
              });

              if (!sessionError) {
                console.log('✅ DEVELOPER SESSION SET SUCCESSFULLY');
                toast.success('Auto-login sviluppatore riuscito', {
                  description: 'Accesso automatico senza password completato'
                });
                
                // Immediate redirect to home
                setTimeout(() => {
                  navigate('/home', { replace: true });
                }, 800);
              } else {
                console.error('❌ Session setting error:', sessionError);
                setIsDeveloperAutoLogin(false);
              }
            } else {
              console.log('⚠️ Developer auto-login not available, showing login form');
              setIsDeveloperAutoLogin(false);
            }
          } catch (error) {
            console.error('⚠️ Developer auto-login error:', error);
            setIsDeveloperAutoLogin(false);
          }
        } else {
          setAutoLoginAttempted(true);
        }
      }
    };

    // Immediate attempt for developer auto-login
    const timer = setTimeout(attemptDeveloperAutoLogin, 500);
    return () => clearTimeout(timer);
  }, [authLoading, isAuthenticated, autoLoginAttempted, navigate]);

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

  // Show loading during auth check, auto-login attempt, or developer auto-login
  if (authLoading || isDeveloperAutoLogin || (autoLoginAttempted && !isAuthenticated && isDeveloperAutoLogin)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <Spinner className="h-8 w-8 text-white mx-auto mb-4" />
          <p className="text-white/70">
            {isDeveloperAutoLogin ? 'Auto-login sviluppatore in corso...' : 
             autoLoginAttempted ? 'Tentativo auto-login...' : 
             'Verifica autenticazione...'}
          </p>
          <p className="text-xs text-cyan-400 mt-2">
            Login automatico senza password attivo
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
              Auto-login sviluppatore attivo (NO PASSWORD)
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
                window.location.reload();
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
