
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

    // Immediate redirect if already authenticated
    if (!authLoading && isAuthenticated) {
      console.log('✅ User already authenticated, redirecting to /home');
      navigate('/home', { replace: true });
    }
  }, [navigate, searchParams, authLoading, isAuthenticated]);

  // 🔐 ENHANCED DEVELOPER AUTO-LOGIN WITH ADMIN SESSION
  useEffect(() => {
    const executeDeveloperAutoLogin = async () => {
      if (!developerAutoLoginAttempted && !authLoading && !isAuthenticated) {
        console.log('🔄 STARTING ENHANCED DEVELOPER AUTO-LOGIN FOR wikus77@hotmail.it');
        setDeveloperAutoLoginAttempted(true);
        setIsDeveloperAutoLogin(true);
        setAutoLoginError(null);
        
        try {
          console.log('📡 Calling enhanced login-no-captcha function...');
          
          const functionResponse = await supabase.functions.invoke('login-no-captcha', {
            headers: {
              'Content-Type': 'application/json',
              'User-Agent': 'M1SSION-Developer-AutoLogin-Enhanced',
              'Accept': 'application/json'
            }
          });

          console.log('📋 Enhanced function response:', {
            data: functionResponse.data,
            error: functionResponse.error,
            status: 'Response received'
          });

          if (functionResponse.error) {
            console.error('❌ Enhanced auto-login function error:', functionResponse.error);
            setAutoLoginError(`Function error: ${functionResponse.error.message}`);
            setIsDeveloperAutoLogin(false);
            return;
          }

          const data = functionResponse.data;
          console.log('📊 Enhanced function data analysis:', {
            hasData: !!data,
            isSuccess: data?.success,
            hasAccessToken: !!data?.access_token,
            hasRefreshToken: !!data?.refresh_token,
            tokenLength: data?.access_token?.length || 0,
            method: data?.method,
            hasUser: !!data?.user
          });

          if (data?.success && data?.access_token && data?.refresh_token) {
            console.log('✅ ENHANCED DEVELOPER AUTO-LOGIN SUCCESS - Setting session with admin tokens...');
            
            // Set session with admin-generated tokens
            console.log('🔧 Setting session with enhanced admin tokens...');
            const sessionResult = await supabase.auth.setSession({
              access_token: data.access_token,
              refresh_token: data.refresh_token
            });

            console.log('📊 Enhanced session result:', {
              hasError: !!sessionResult.error,
              hasData: !!sessionResult.data,
              hasSession: !!sessionResult.data?.session,
              hasUser: !!sessionResult.data?.user,
              errorMessage: sessionResult.error?.message,
              userEmail: sessionResult.data?.user?.email
            });

            if (!sessionResult.error && sessionResult.data?.session) {
              console.log('✅ ENHANCED DEVELOPER SESSION SET SUCCESSFULLY');
              console.log('👤 Enhanced user authenticated:', sessionResult.data.user?.email);
              
              toast.success('🔐 Enhanced Developer Auto-Login Successful', {
                description: `Welcome back! Admin method: ${data.method}`
              });
              
              // Immediate redirect on success
              setTimeout(() => {
                console.log('🏠 Executing enhanced redirect to /home...');
                navigate('/home', { replace: true });
              }, 1000);
            } else {
              console.error('❌ Enhanced session setting failed:', sessionResult.error);
              setAutoLoginError(`Enhanced session error: ${sessionResult.error?.message || 'Unknown session error'}`);
              setIsDeveloperAutoLogin(false);
            }
          } else {
            console.log('⚠️ Enhanced auto-login response invalid or failed');
            setAutoLoginError(data?.error || 'Invalid enhanced auto-login response');
            setIsDeveloperAutoLogin(false);
          }
        } catch (error: any) {
          console.error('💥 Enhanced auto-login exception:', error);
          setAutoLoginError(`Enhanced exception: ${error.message}`);
          setIsDeveloperAutoLogin(false);
        }
      }
    };

    // Execute enhanced auto-login after a short delay
    const autoLoginTimer = setTimeout(executeDeveloperAutoLogin, 300);
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
                Enhanced auto-login for wikus77@hotmail.it
              </p>
              <p className="text-xs text-white/50 mt-1">
                Using admin session creation
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
                Enhanced auto-login error: {autoLoginError}
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
            
            {/* Enhanced Developer Controls */}
            <div className="mt-4 pt-4 border-t border-gray-700">
              <p className="text-xs text-gray-500 mb-2">Enhanced Developer Controls</p>
              <button 
                onClick={async () => {
                  setDeveloperAutoLoginAttempted(false);
                  setAutoLoginError(null);
                  window.location.reload();
                }}
                className="text-xs text-cyan-400 hover:text-cyan-300 mr-4"
              >
                🔄 Retry Enhanced Auto-Login
              </button>
              <button 
                onClick={() => {
                  console.log('🔍 Enhanced session state:', {
                    isAuthenticated,
                    authLoading,
                    developerAutoLoginAttempted,
                    autoLoginError,
                    timestamp: new Date().toISOString()
                  });
                  toast.info('Enhanced diagnostic info logged to console');
                }}
                className="text-xs text-gray-500 hover:text-gray-400"
              >
                🔍 Enhanced Debug Info
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
