
// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import { useState, useEffect, useRef } from "react";
import { useWouterNavigation } from "@/hooks/useWouterNavigation";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { toast } from "sonner";
import AnimatedLogo from "@/components/logo/AnimatedLogo";
import { StandardLoginForm } from "@/components/auth/StandardLoginForm";
import { PreRegistrationForm } from "@/components/auth/PreRegistrationForm";
import BackgroundParticles from "@/components/ui/background-particles";
import { useUnifiedAuth } from "@/hooks/useUnifiedAuth";
import LaunchCountdown from "@/components/login/LaunchCountdown";

const Login = () => {
  const [verificationStatus, setVerificationStatus] = useState<string | null>(null);
  const [showPreRegistration, setShowPreRegistration] = useState(false);
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
    redirectAttemptedRef.current = true;
    
    // Clear any existing fallback timer
    if (fallbackTimerRef.current) {
      clearTimeout(fallbackTimerRef.current);
      fallbackTimerRef.current = null;
    }
    
    // Strategy 1: Try wouter navigate first
    try {
      navigate('/');
      console.log('✅ WOUTER NAVIGATE EXECUTED');
    } catch (error) {
      console.error('❌ WOUTER NAVIGATE FAILED:', error);
    }
    
    // Strategy 2: PWA iOS fallback with window.location.href
    if (isPWAStandalone()) {
      console.log('📱 PWA STANDALONE DETECTED - Using window.location.href fallback');
      setTimeout(() => {
        if (window.location.pathname === '/login') {
          console.log('🔄 WOUTER FAILED - Forcing window.location.href');
          window.location.href = '/';
        }
      }, 500);
    }
  };

  // 📡 LISTENER FOR AUTH SUCCESS EVENT
  useEffect(() => {
    const handleAuthSuccess = () => {
      console.log('🎉 AUTH SUCCESS EVENT RECEIVED');
      forceRedirectToHome('AUTH_SUCCESS_EVENT');
    };

    window.addEventListener('auth-success', handleAuthSuccess);
    
    return () => {
      window.removeEventListener('auth-success', handleAuthSuccess);
    };
  }, []);

  // 🔄 REDIRECT AUTHENTICATED USERS - Enhanced
  useEffect(() => {
    if (isAuthenticated && !isLoading && !redirectAttemptedRef.current) {
      console.log('🔄 LOGIN PAGE: User already authenticated, initiating redirect');
      forceRedirectToHome('USER_ALREADY_AUTHENTICATED');
    }
  }, [isAuthenticated, isLoading]);

  // ⏱️ FALLBACK TIMER - PWA iOS Safari Emergency Exit
  useEffect(() => {
    if (isAuthenticated && !isLoading && window.location.pathname === '/login') {
      console.log('⏱️ Setting up PWA fallback timer (2s)');
      
      fallbackTimerRef.current = setTimeout(() => {
        if (window.location.pathname === '/login' && isAuthenticated) {
          console.log('🚨 FALLBACK TIMER TRIGGERED - User stuck on login page');
          
          // Final fallback: Hard reload to home
          if (isPWAStandalone()) {
            console.log('📱 PWA HARD REDIRECT TO HOME');
            window.location.replace('/');
          } else {
            console.log('🌐 BROWSER HARD REDIRECT TO HOME');
            window.location.href = '/';
          }
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
        {/* Launch Countdown */}
        <LaunchCountdown />

        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <AnimatedLogo />
          </div>
          <h2 className="text-2xl font-bold text-white mb-1 neon-text-cyan">M1SSION™</h2>
          <p className="text-gray-400">
            {showPreRegistration ? 'Ottieni accesso prioritario' : 'Accedi per iniziare la tua missione'}
          </p>
        </div>

        {showPreRegistration ? (
          <PreRegistrationForm
            onSuccess={() => {
              setShowPreRegistration(false);
              toast.success('Pre-registrazione completata! Riceverai una email quando sarà il momento dell\'accesso.');
            }}
            onCancel={() => setShowPreRegistration(false)}
          />
        ) : (
          <div className="glass-card p-6 backdrop-blur-md border border-gray-800 rounded-xl">
            <StandardLoginForm verificationStatus={verificationStatus} />

            <div className="mt-6 text-center space-y-3">
              <button
                onClick={() => setShowPreRegistration(true)}
                className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 font-semibold"
              >
                🚀 Pre-registrati ora
              </button>
              
              <p className="text-sm text-white/50">
                <Link to="/" className="text-cyan-400 hover:text-cyan-300 transition-colors">
                  ← Torna alla homepage
                </Link>
              </p>
            </div>
          </div>
        )}

      </motion.div>
    </div>
  );
};

export default Login;

// Copyright © 2025 Joseph M1SSION KFT
