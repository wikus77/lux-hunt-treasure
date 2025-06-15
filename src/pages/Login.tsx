
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import AnimatedLogo from "@/components/logo/AnimatedLogo";
import { StandardLoginForm } from "@/components/auth/StandardLoginForm";
import BackgroundParticles from "@/components/ui/background-particles";
import { useAuth } from "@/hooks/use-auth";
import { Spinner } from "@/components/ui/spinner";
import { useDeveloperSetup } from "@/hooks/use-developer-setup";

const Login = () => {
  const [verificationStatus, setVerificationStatus] = useState<string | null>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { isSetupComplete, isLoading: setupLoading } = useDeveloperSetup();

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

    // Redirect if already authenticated
    if (!authLoading && isAuthenticated) {
      console.log('✅ User already authenticated, redirecting to /home');
      navigate('/home', { replace: true });
    }
  }, [navigate, searchParams, authLoading, isAuthenticated]);

  // Show loading during auth check or developer setup
  if (authLoading || setupLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <Spinner className="h-8 w-8 text-white mx-auto mb-4" />
          <p className="text-white/70">
            {setupLoading ? 'Configurazione sistema developer...' : 'Verifica autenticazione...'}
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
          <h2 className="text-2xl font-bold text-white mb-1">M1SSION™</h2>
          <p className="text-gray-400">
            Accedi o registrati per iniziare la tua missione
          </p>
        </div>

        <div className="glass-card p-6 backdrop-blur-md border border-gray-800 rounded-xl">
          <StandardLoginForm verificationStatus={verificationStatus} />

          <div className="mt-6 text-center">
            <p className="text-sm text-white/50 mt-2">
              <Link to="/" className="text-cyan-400 hover:text-cyan-300 transition-colors">
                ← Torna alla homepage
              </Link>
            </p>
          </div>
        </div>

        {/* Developer Info Panel */}
        {isSetupComplete && (
          <motion.div 
            className="mt-4 p-3 bg-green-900/20 border border-green-500/30 rounded-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <p className="text-green-400 text-sm text-center">
              ✅ Sistema developer configurato correttamente
            </p>
            <p className="text-green-300 text-xs text-center mt-1">
              Login developer: wikus77@hotmail.it
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default Login;
