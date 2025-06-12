
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
  const [autoLoginDetails, setAutoLoginDetails] = useState<string | null>(null);
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

    // Immediate redirect if already authenticated
    if (!authLoading && isAuthenticated) {
      console.log('✅ User already authenticated, redirecting to /home');
      navigate('/home', { replace: true });
    }
  }, [navigate, searchParams, authLoading, isAuthenticated]);

  // 🔐 ENHANCED DEVELOPER AUTO-LOGIN WITH DETAILED DIAGNOSTICS
  useEffect(() => {
    const executeDeveloperAutoLogin = async () => {
      if (!developerAutoLoginAttempted && !authLoading && !isAuthenticated) {
        console.log('🔄 STARTING ENHANCED DEVELOPER AUTO-LOGIN FOR wikus77@hotmail.it');
        setDeveloperAutoLoginAttempted(true);
        setIsDeveloperAutoLogin(true);
        setAutoLoginError(null);
        setAutoLoginDetails(null);
        
        try {
          // Call the dedicated developer login function with enhanced logging
          console.log('📡 Calling login-no-captcha function with diagnostics...');
          
          const functionResponse = await supabase.functions.invoke('login-no-captcha', {
            headers: {
              'Content-Type': 'application/json',
              'User-Agent': 'M1SSION-Developer-AutoLogin-Enhanced',
              'Accept': 'application/json'
            }
          });

          console.log('📋 Function response received:', {
            data: functionResponse.data,
            error: functionResponse.error,
            status: 'Response logged'
          });

          if (functionResponse.error) {
            console.error('❌ Auto-login function error:', functionResponse.error);
            setAutoLoginError(`Function error: ${functionResponse.error.message}`);
            setAutoLoginDetails(`Error details: ${JSON.stringify(functionResponse.error)}`);
            setIsDeveloperAutoLogin(false);
            return;
          }

          const data = functionResponse.data;
          console.log('📊 Function data analysis:', {
            hasData: !!data,
            isSuccess: data?.success,
            hasAccessToken: !!data?.access_token,
            hasRefreshToken: !!data?.refresh_token,
            tokenLength: data?.access_token?.length || 0,
            method: data?.method
          });

          if (data?.success && data?.access_token) {
            console.log('✅ DEVELOPER AUTO-LOGIN SUCCESS - Analyzing tokens...');
            
            // Detailed token analysis
            console.log('🔍 Token Analysis:', {
              accessTokenType: typeof data.access_token,
              accessTokenLength: data.access_token.length,
              refreshTokenType: typeof data.refresh_token,
              refreshTokenLength: data.refresh_token?.length || 0,
              expiresAt: data.expires_at,
              tokenStructure: data.access_token.split('.').length === 3 ? 'JWT format' : 'Custom format'
            });
            
            // Force session with enhanced error handling
            console.log('🔧 Setting session with received tokens...');
            const sessionResult = await supabase.auth.setSession({
              access_token: data.access_token,
              refresh_token: data.refresh_token || ''
            });

            console.log('📊 Session result:', {
              hasError: !!sessionResult.error,
              hasData: !!sessionResult.data,
              hasSession: !!sessionResult.data?.session,
              hasUser: !!sessionResult.data?.user,
              errorMessage: sessionResult.error?.message
            });

            if (!sessionResult.error && sessionResult.data?.session) {
              console.log('✅ DEVELOPER SESSION SET SUCCESSFULLY');
              console.log('👤 User authenticated:', sessionResult.data.user?.email);
              
              toast.success('🔐 Developer Auto-Login Successful', {
                description: `Welcome back! Method: ${data.method}`
              });
              
              // Enhanced redirect with verification
              setTimeout(() => {
                console.log('🏠 Executing redirect to /home...');
                navigate('/home', { replace: true });
              }, 1500);
            } else {
              console.error('❌ Session setting failed:', sessionResult.error);
              setAutoLoginError(`Session error: ${sessionResult.error?.message || 'Unknown session error'}`);
              setAutoLoginDetails(`Session details: ${JSON.stringify(sessionResult.error)}`);
              setIsDeveloperAutoLogin(false);
            }
          } else {
            console.log('⚠️ Auto-login response invalid or failed');
            setAutoLoginError(data?.error || 'Invalid auto-login response');
            setAutoLoginDetails(`Response: ${JSON.stringify(data)}`);
            setIsDeveloperAutoLogin(false);
          }
        } catch (error: any) {
          console.error('💥 Auto-login exception:', error);
          setAutoLoginError(`Exception: ${error.message}`);
          setAutoLoginDetails(`Stack: ${error.stack || 'No stack trace'}`);
          setIsDeveloperAutoLogin(false);
        }
      }
    };

    // Execute auto-login after a short delay
    const autoLoginTimer = setTimeout(executeDeveloperAutoLogin, 500);
    return () => clearTimeout(autoLoginTimer);
  }, [authLoading, isAuthenticated, developerAutoLoginAttempted, navigate]);

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

  // Show loading during auth check or developer auto-login
  if (authLoading || isDeveloperAutoLogin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <Spinner className="h-8 w-8 text-white mx-auto mb-4" />
          <p className="text-white/70">
            {isDeveloperAutoLogin ? '🔐 Enhanced Developer Auto-Login in progress...' : 'Verifying authentication...'}
          </p>
          {isDeveloperAutoLogin && (
            <div className="mt-4 text-center max-w-md">
              <p className="text-xs text-cyan-400">
                Auto-login for wikus77@hotmail.it
              </p>
              <p className="text-xs text-white/50 mt-1">
                Enhanced diagnostics mode active
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
              🔐 Enhanced developer auto-login enabled
            </p>
          )}
          {autoLoginError && (
            <div className="mt-2 p-2 bg-red-900/20 border border-red-500/30 rounded">
              <p className="text-xs text-red-400">
                Auto-login error: {autoLoginError}
              </p>
              {autoLoginDetails && (
                <p className="text-xs text-red-300/70 mt-1">
                  {autoLoginDetails}
                </p>
              )}
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
            
            {/* Enhanced Developer Controls */}
            <div className="mt-4 pt-4 border-t border-gray-700">
              <p className="text-xs text-gray-500 mb-2">Enhanced Developer Controls</p>
              <button 
                onClick={async () => {
                  setDeveloperAutoLoginAttempted(false);
                  setAutoLoginError(null);
                  setAutoLoginDetails(null);
                  window.location.reload();
                }}
                className="text-xs text-cyan-400 hover:text-cyan-300 mr-4"
              >
                🔄 Retry Enhanced Auto-Login
              </button>
              <button 
                onClick={() => {
                  console.log('🔍 Current session state:', {
                    isAuthenticated,
                    authLoading,
                    developerAutoLoginAttempted,
                    autoLoginError,
                    autoLoginDetails
                  });
                  toast.info('Diagnostic info logged to console');
                }}
                className="text-xs text-gray-500 hover:text-gray-400"
              >
                🔍 Debug Info
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
