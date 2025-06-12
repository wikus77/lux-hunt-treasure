
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
  const [developerAutoLoginAttempted, setDeveloperAutoLoginAttempted] = useState(false);
  const [isDeveloperAutoLogin, setIsDeveloperAutoLogin] = useState(false);
  const [autoLoginError, setAutoLoginError] = useState<string | null>(null);
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
  }, [searchParams]);

  // CRITICAL: Separate useEffect for authentication check and redirect
  useEffect(() => {
    if (!authLoading && isAuthenticated && !isDeveloperAutoLogin) {
      console.log('✅ User already authenticated, redirecting to /home');
      navigate('/home', { replace: true });
    }
  }, [authLoading, isAuthenticated, navigate, isDeveloperAutoLogin]);

  // 🔐 CRITICAL DEVELOPER AUTO-LOGIN - FIXED VERSION
  useEffect(() => {
    const executeDeveloperAutoLogin = async () => {
      if (!developerAutoLoginAttempted && !authLoading && !isAuthenticated) {
        console.log('🔄 STARTING CRITICAL DEVELOPER AUTO-LOGIN for wikus77@hotmail.it');
        setDeveloperAutoLoginAttempted(true);
        setIsDeveloperAutoLogin(true);
        setAutoLoginError(null);
        
        try {
          console.log('📡 Calling login-no-captcha function... CRITICAL STEP');
          
          const functionResponse = await supabase.functions.invoke('login-no-captcha', {
            headers: {
              'Content-Type': 'application/json',
              'User-Agent': 'M1SSION-Developer-AutoLogin-CRITICAL',
              'Accept': 'application/json',
              'X-Developer-Mode': 'true'
            }
          });

          console.log('📋 CRITICAL Function response received:', {
            data: functionResponse.data,
            error: functionResponse.error,
            status: 'Response received - ANALYZING...'
          });

          if (functionResponse.error) {
            console.error('❌ CRITICAL: Auto-login function error:', functionResponse.error);
            setAutoLoginError(`Function error: ${functionResponse.error.message}`);
            setIsDeveloperAutoLogin(false);
            return;
          }

          const data = functionResponse.data;
          console.log('📊 CRITICAL Function data analysis:', {
            hasData: !!data,
            isSuccess: data?.success,
            hasAccessToken: !!data?.access_token,
            hasRefreshToken: !!data?.refresh_token,
            tokenLength: data?.access_token?.length || 0,
            method: data?.method,
            hasUser: !!data?.user,
            userEmail: data?.user?.email
          });

          if (data?.success && data?.access_token && data?.refresh_token) {
            console.log('✅ CRITICAL: DEVELOPER AUTO-LOGIN SUCCESS - Setting session with valid tokens...');
            
            console.log('🔧 CRITICAL: Setting session with password-generated tokens...');
            const sessionResult = await supabase.auth.setSession({
              access_token: data.access_token,
              refresh_token: data.refresh_token
            });

            console.log('📊 CRITICAL Session result:', {
              hasError: !!sessionResult.error,
              hasData: !!sessionResult.data,
              hasSession: !!sessionResult.data?.session,
              hasUser: !!sessionResult.data?.user,
              errorMessage: sessionResult.error?.message,
              userEmail: sessionResult.data?.user?.email,
              sessionValid: !!sessionResult.data?.session?.access_token
            });

            if (!sessionResult.error && sessionResult.data?.session) {
              console.log('✅ CRITICAL: DEVELOPER SESSION SET SUCCESSFULLY');
              console.log('👤 CRITICAL: User authenticated:', sessionResult.data.user?.email);
              
              toast.success('🔐 Developer Auto-Login SUCCESSFUL', {
                description: `Welcome back wikus77@hotmail.it! Method: ${data.method}`,
                duration: 3000
              });
              
              // CRITICAL: Reset auto-login state before redirect
              setIsDeveloperAutoLogin(false);
              
              // CRITICAL: Immediate redirect on success
              setTimeout(() => {
                console.log('🏠 CRITICAL: Executing redirect to /home...');
                navigate('/home', { replace: true });
              }, 1000);
            } else {
              console.error('❌ CRITICAL: Session setting failed:', sessionResult.error);
              setAutoLoginError(`Session error: ${sessionResult.error?.message || 'Unknown session error'}`);
              setIsDeveloperAutoLogin(false);
            }
          } else {
            console.log('⚠️ CRITICAL: Auto-login response invalid or failed');
            console.log('🔍 CRITICAL: Response data breakdown:', {
              success: data?.success,
              access_token_exists: !!data?.access_token,
              refresh_token_exists: !!data?.refresh_token,
              user_exists: !!data?.user,
              error: data?.error
            });
            setAutoLoginError(data?.error || 'Invalid auto-login response');
            setIsDeveloperAutoLogin(false);
          }
        } catch (error: any) {
          console.error('💥 CRITICAL: Auto-login exception:', error);
          setAutoLoginError(`Exception: ${error.message}`);
          setIsDeveloperAutoLogin(false);
        }
      }
    };

    // CRITICAL: Execute auto-login immediately after component mount
    if (!authLoading && !isAuthenticated && !developerAutoLoginAttempted) {
      const autoLoginTimer = setTimeout(executeDeveloperAutoLogin, 100);
      return () => clearTimeout(autoLoginTimer);
    }
  }, [authLoading, isAuthenticated, developerAutoLoginAttempted, navigate]);

  async function handleResendVerification(email: string) {
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
  }

  // Show loading during auth check or developer auto-login
  if (authLoading || isDeveloperAutoLogin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <Spinner className="h-8 w-8 text-white mx-auto mb-4" />
          <p className="text-white/70">
            {isDeveloperAutoLogin ? '🔐 CRITICAL Developer Auto-Login in progress...' : 'Verifying authentication...'}
          </p>
          {isDeveloperAutoLogin && (
            <div className="mt-4 text-center max-w-md">
              <p className="text-xs text-cyan-400">
                🚨 CRITICAL: Auto-login for wikus77@hotmail.it
              </p>
              <p className="text-xs text-white/50 mt-1">
                Using login-no-captcha edge function
              </p>
              <p className="text-xs text-green-400 mt-1">
                ✅ FIXED INFINITE LOOP VERSION
              </p>
            </div>
          )}
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
          {!developerAutoLoginAttempted && (
            <p className="text-xs text-cyan-400 mt-2">
              🔐 CRITICAL Developer auto-login enabled
            </p>
          )}
          {autoLoginError && (
            <div className="mt-2 p-2 bg-red-900/20 border border-red-500/30 rounded">
              <p className="text-xs text-red-400">
                CRITICAL Auto-login error: {autoLoginError}
              </p>
            </div>
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
            
            {/* CRITICAL Developer Controls */}
            <div className="mt-4 pt-4 border-t border-gray-700">
              <p className="text-xs text-gray-500 mb-2">🚨 CRITICAL Developer Controls</p>
              <button 
                onClick={async () => {
                  setDeveloperAutoLoginAttempted(false);
                  setAutoLoginError(null);
                  setIsDeveloperAutoLogin(false);
                  console.log('🔄 CRITICAL: Manual retry auto-login triggered');
                  window.location.reload();
                }}
                className="text-xs text-cyan-400 hover:text-cyan-300 mr-4"
              >
                🔄 CRITICAL Retry Auto-Login
              </button>
              <button 
                onClick={() => {
                  console.log('🔍 CRITICAL Session state:', {
                    isAuthenticated,
                    authLoading,
                    developerAutoLoginAttempted,
                    autoLoginError,
                    isDeveloperAutoLogin,
                    timestamp: new Date().toISOString()
                  });
                  toast.info('CRITICAL Diagnostic info logged to console');
                }}
                className="text-xs text-gray-500 hover:text-gray-400"
              >
                🔍 CRITICAL Debug Info
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
