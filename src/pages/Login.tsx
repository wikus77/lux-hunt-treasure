
// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import { useState, useEffect, useRef } from "react";
import { useWouterNavigation } from "@/hooks/useWouterNavigation";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { toast } from "sonner";
import AnimatedLogo from "@/components/logo/AnimatedLogo";
import { StandardLoginForm } from "@/components/auth/StandardLoginForm";
import BackgroundParticles from "@/components/ui/background-particles";
import { useUnifiedAuth } from "@/hooks/useUnifiedAuth";
import AdminEmergencyLogin from "@/components/auth/AdminEmergencyLogin";
import { postLoginRedirectFixed } from "@/utils/postLoginRedirectFixed";

const Login = () => {
  const [verificationStatus, setVerificationStatus] = useState<string | null>(null);
  const [showEmergencyLogin, setShowEmergencyLogin] = useState(false);
  const { navigate } = useWouterNavigation();
  const { isAuthenticated, isLoading } = useUnifiedAuth();
  const searchParams = new URLSearchParams(window.location.search);
  const redirectAttemptedRef = useRef(false);
  const fallbackTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 🔍 PWA Detection
  const isPWAStandalone = () => {
    return window.matchMedia('(display-mode: standalone)').matches || 
           (window.navigator as any).standalone === true;
  };

  // 🚀 FORCE REDIRECT FUNCTION - PWA iOS Safari Optimized
  const forceRedirectToHome = (reason: string) => {
    if (redirectAttemptedRef.current) return;
    
    console.log(`🏠 FORCE REDIRECT TO HOME: ${reason}`);
    console.log('✅ ROUTE: Login → using postLoginRedirectFixed (authenticated user)');
    redirectAttemptedRef.current = true;
    
    // Clear any existing fallback timer
    if (fallbackTimerRef.current) {
      clearTimeout(fallbackTimerRef.current);
      fallbackTimerRef.current = null;
    }
    
    try {
      postLoginRedirectFixed(navigate);
    } catch (error) {
      console.error('❌ postLoginRedirectFixed failed, forcing location replace:', error);
      const target = '/home';
      window.location.replace(target);
    }
  };

  // 📡 LISTENER FOR AUTH SUCCESS EVENT - DISABLED to prevent conflicts with StandardLoginForm redirect
  // useEffect(() => {
  //   const handleAuthSuccess = () => {
  //     console.log('🎉 AUTH SUCCESS EVENT RECEIVED');
  //     forceRedirectToHome('AUTH_SUCCESS_EVENT');
  //   };

  //   window.addEventListener('auth-success', handleAuthSuccess);
    
  //   return () => {
  //     window.removeEventListener('auth-success', handleAuthSuccess);
  //   };
  // }, []);

  useEffect(() => {
    if (isAuthenticated && !isLoading && !redirectAttemptedRef.current) {
      console.log('🔄 LOGIN PAGE: User already authenticated, initiating redirect (POST_LOGIN_REDIRECT)');
      redirectAttemptedRef.current = true;
      postLoginRedirectFixed(navigate);
    }
  }, [isAuthenticated, isLoading]);

  // ⏱️ FALLBACK TIMER - PWA iOS Safari Emergency Exit
  useEffect(() => {
    if (isAuthenticated && !isLoading && window.location.pathname === '/login') {
      console.log('⏱️ Setting up PWA fallback timer (2s)');
      
      fallbackTimerRef.current = setTimeout(() => {
        if (window.location.pathname === '/login' && isAuthenticated) {
          console.log('🚨 FALLBACK TIMER TRIGGERED - User stuck on login page');
          // Use the unified post-login redirect to honor saved target
          postLoginRedirectFixed(navigate);
        }
      }, 2000);
      
      return () => {
        if (fallbackTimerRef.current) {
          clearTimeout(fallbackTimerRef.current);
          fallbackTimerRef.current = null;
        }
      };
    }
  }, [isAuthenticated, isLoading]);

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
  }, [navigate]);

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
          <h2 className="text-2xl font-bold text-white mb-1 neon-text-cyan">M1SSION™</h2>
          <p className="text-gray-400">
            Accedi per iniziare la tua missione
          </p>
        </div>

        <div 
          className="m1ssion-glass-card p-6 rounded-xl relative"
          style={{
            background: 'rgba(0, 0, 0, 0.05)',
            backdropFilter: 'blur(40px)',
            WebkitBackdropFilter: 'blur(40px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2), inset 0 2px 3px rgba(255, 255, 255, 0.05)'
          }}
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-amber-500 opacity-90" />
          <StandardLoginForm verificationStatus={verificationStatus} />

          <div className="mt-6 text-center space-y-3">
            <p className="text-sm text-white/70">
              Non hai un account?{" "}
              <Link to="/register" className="text-cyan-400 hover:text-cyan-300 transition-colors">
                Registrati
              </Link>
            </p>
            <p className="text-sm text-white/50">
              <Link to="/landing" className="text-cyan-400 hover:text-cyan-300 transition-colors">
                ← Torna alla homepage
              </Link>
            </p>
            
          </div>
        </div>

      </motion.div>
      
      {/* Emergency Login Modal */}
      {showEmergencyLogin && (
        <AdminEmergencyLogin onClose={() => setShowEmergencyLogin(false)} />
      )}
    </div>
  );
};

export default Login;

// Copyright © 2025 Joseph M1SSION KFT
