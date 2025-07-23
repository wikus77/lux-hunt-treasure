
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
import LaunchCountdown from "@/components/login/LaunchCountdown";
import { PreRegistrationForm } from "@/components/auth/PreRegistrationForm";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const Login = () => {
  const [verificationStatus, setVerificationStatus] = useState<string | null>(null);
  const [showPreRegistration, setShowPreRegistration] = useState(false);
  const [missionStarted, setMissionStarted] = useState(false);
  const { navigate } = useWouterNavigation();
  const { isAuthenticated, isLoading } = useUnifiedAuth();
  const searchParams = new URLSearchParams(window.location.search);
  const redirectAttemptedRef = useRef(false);
  const fallbackTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Pre-fill email from URL params
  const prefillEmail = searchParams.get('email') || '';
  const redirectAfterLogin = searchParams.get('redirect') || '';
  const agentCodeFromUrl = searchParams.get('agent_code') || '';

  // 🔍 PWA Detection
  const isPWAStandalone = () => {
    return window.matchMedia('(display-mode: standalone)').matches || 
           (window.navigator as any).standalone === true;
  };

  // Check if mission has started
  useEffect(() => {
    const checkMissionStatus = async () => {
      try {
        const { data, error } = await supabase.rpc('has_mission_started');
        if (!error) {
          setMissionStarted(data);
        }
      } catch (error) {
        console.error('Error checking mission status:', error);
      }
    };

    checkMissionStatus();
  }, []);

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
      console.log('🔄 LOGIN PAGE: User already authenticated, checking pre-registration status');
      
      // Check if user is pre-registered and needs plan selection
      const checkUserStatus = async () => {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (!currentUser) return;

        const { data: profile } = await supabase
          .from('profiles')
          .select('plan, is_pre_registered, agent_code, can_access_app')
          .eq('id', currentUser.id)
          .single();

        console.log('🔍 User profile check:', profile);

        if (profile?.is_pre_registered) {
          // Check if there's a specific redirect requested
          if (redirectAfterLogin === 'choose-plan') {
            console.log('🎯 Forced redirect to choose-plan requested');
            navigate('/choose-plan' + (profile.agent_code ? `?agent_code=${profile.agent_code}` : ''));
            return;
          }
          
          // Se è pre-registrato ma non ha piano o ha piano Base, va alla scelta piano
          if (!profile.plan || profile.plan === 'Base') {
            console.log('🎯 Pre-registered user without plan - redirecting to choose-plan');
            navigate('/choose-plan' + (profile.agent_code ? `?agent_code=${profile.agent_code}` : ''));
          } else {
            // Ha già un piano, va alla home invece che how-it-works
            console.log('🎯 Pre-registered user with plan - redirecting to home');
            forceRedirectToHome('PRE_REGISTERED_USER_WITH_PLAN');
          }
        } else {
          forceRedirectToHome('USER_ALREADY_AUTHENTICATED');
        }
      };

      checkUserStatus();
    }
  }, [isAuthenticated, isLoading, missionStarted, redirectAfterLogin]);

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
            Accedi per iniziare la tua missione
          </p>
        </div>

        <div className="glass-card p-6 backdrop-blur-md border border-gray-800 rounded-xl">
          {prefillEmail && (
            <div className="bg-cyan-500/10 border border-cyan-500/30 p-3 rounded-lg mb-4">
              <p className="text-cyan-400 text-sm font-semibold mb-1">
                👤 Account pre-registrato rilevato
              </p>
              <p className="text-white/70 text-xs">
                Email: {prefillEmail} {agentCodeFromUrl && `• Agente: ${agentCodeFromUrl}`}
              </p>
            </div>
          )}
          <StandardLoginForm 
            verificationStatus={verificationStatus} 
            prefillEmail={prefillEmail}
            redirectAfterLogin={redirectAfterLogin}
            agentCode={agentCodeFromUrl}
          />

          {/* Pre-Registration Button - Only show if mission hasn't started and user not authenticated */}
          {!missionStarted && !isAuthenticated && (
            <div className="mt-4 pt-4 border-t border-gray-700">
              <Button
                onClick={() => setShowPreRegistration(true)}
                className="w-full bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800 text-white font-bold py-3 text-lg"
              >
                🟪 PRE-REGISTRATI ORA
              </Button>
              <p className="text-xs text-gray-500 text-center mt-2">
                Registrati ora per essere pronto al lancio del 19 Agosto 2025
              </p>
            </div>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-white/50 mt-2">
              <Link to="/" className="text-cyan-400 hover:text-cyan-300 transition-colors">
                ← Torna alla homepage
              </Link>
            </p>
          </div>
        </div>

        {/* Pre-Registration Modal */}
        {showPreRegistration && (
          <PreRegistrationForm
            onSuccess={() => {
              setShowPreRegistration(false);
              navigate('/how-it-works');
            }}
            onCancel={() => setShowPreRegistration(false)}
          />
        )}

      </motion.div>
    </div>
  );
};

export default Login;

// Copyright © 2025 Joseph M1SSION KFT
