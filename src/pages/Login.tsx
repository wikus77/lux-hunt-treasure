
// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// 🎬 NEW LOGIN v8: Video Background + OAuth CTA (Apple, Google, Email)
// Flow "C": Lento → UI appare → Accelera on tap

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { useWouterNavigation } from "@/hooks/useWouterNavigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Mail } from "lucide-react";
import { useUnifiedAuth } from "@/hooks/useUnifiedAuth";
import { useAppleAuth } from "@/hooks/useAppleAuth";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";
import { postLoginRedirectFixed } from "@/utils/postLoginRedirectFixed";
import { StandardLoginForm } from "@/components/auth/StandardLoginForm";

// Flow "C" Animation Phases
type AnimationPhase = 'video-only' | 'brand-emerge' | 'cta-appear' | 'ready';

const Login = () => {
  const [verificationStatus, setVerificationStatus] = useState<string | null>(null);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [phase, setPhase] = useState<AnimationPhase>('video-only');
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [buttonPressed, setButtonPressed] = useState<string | null>(null);
  
  const { navigate } = useWouterNavigation();
  const { isAuthenticated, isLoading } = useUnifiedAuth();
  const { signInWithApple, loading: appleLoading } = useAppleAuth();
  const { signInWithGoogle, loading: googleLoading } = useGoogleAuth();
  
  const searchParams = new URLSearchParams(window.location.search);
  const redirectAttemptedRef = useRef(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // 🚀 Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading && !redirectAttemptedRef.current) {
      console.log('🔄 LOGIN PAGE: User authenticated, redirecting');
      redirectAttemptedRef.current = true;
      postLoginRedirectFixed(navigate);
    }
  }, [isAuthenticated, isLoading, navigate]);

  // 🎬 Flow "C" Animation Timeline
  useEffect(() => {
    if (!videoLoaded) return;
    
    // Phase 1: Video only (0-2s)
    const phase1Timer = setTimeout(() => {
      setPhase('brand-emerge');
    }, 2000);
    
    // Phase 2: Brand emerges (2-4s)
    const phase2Timer = setTimeout(() => {
      setPhase('cta-appear');
    }, 4000);
    
    // Phase 3: CTA appear (4-6s) → Ready
    const phase3Timer = setTimeout(() => {
      setPhase('ready');
    }, 6000);
    
    return () => {
      clearTimeout(phase1Timer);
      clearTimeout(phase2Timer);
      clearTimeout(phase3Timer);
    };
  }, [videoLoaded]);

  // Handle verification params
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
  }, []);

  // Video load handler
  const handleVideoLoad = useCallback(() => {
    console.log('🎬 Login video loaded');
    setVideoLoaded(true);
  }, []);

  // 🍎 Apple Sign In Handler
  const handleAppleLogin = useCallback(async () => {
    setButtonPressed('apple');
    // Micro acceleration feedback
    if (videoRef.current) {
      videoRef.current.playbackRate = 1.5;
    }
    await signInWithApple();
  }, [signInWithApple]);

  // 🔐 Google Sign In Handler
  const handleGoogleLogin = useCallback(async () => {
    setButtonPressed('google');
    if (videoRef.current) {
      videoRef.current.playbackRate = 1.5;
    }
    await signInWithGoogle();
  }, [signInWithGoogle]);

  // 📧 Email Login Handler
  const handleEmailLogin = useCallback(() => {
    setButtonPressed('email');
    if (videoRef.current) {
      videoRef.current.playbackRate = 1.5;
    }
    setTimeout(() => {
      setShowEmailForm(true);
    }, 300);
  }, []);

  // Back from email form
  const handleBackFromEmail = useCallback(() => {
    setShowEmailForm(false);
    setButtonPressed(null);
    if (videoRef.current) {
      videoRef.current.playbackRate = 1.0;
    }
  }, []);

  // Skip intro on tap (during video-only phase)
  const handleSkipIntro = useCallback(() => {
    if (phase === 'video-only' || phase === 'brand-emerge') {
      setPhase('cta-appear');
      setTimeout(() => setPhase('ready'), 500);
    }
  }, [phase]);

  return createPortal(
    <div 
      className="fixed inset-0 z-[100] overflow-hidden"
      onClick={phase !== 'ready' && phase !== 'cta-appear' ? handleSkipIntro : undefined}
    >
      {/* 🎬 Video Background - Full Screen Cover */}
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        onLoadedData={handleVideoLoad}
        className="absolute inset-0 w-full h-full object-cover"
        style={{ 
          filter: buttonPressed ? 'brightness(1.1) contrast(1.05)' : 'brightness(0.7)',
          transition: 'filter 0.3s ease-out'
        }}
        poster="/assets/m1-logo-dark.png"
      >
        <source src="/assets/VIDEO/M1SSION_INTRO.mp4" type="video/mp4" />
      </video>

      {/* Dark Gradient Overlay for Readability */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 40%, rgba(0,0,0,0.2) 70%, rgba(0,0,0,0.4) 100%)'
        }}
      />

      {/* Content Container */}
      <div className="relative z-10 flex flex-col items-center justify-end h-full pb-16 px-6"
        style={{
          paddingBottom: 'max(env(safe-area-inset-bottom, 64px), 64px)'
        }}
      >
        
        {/* 🏷️ Brand Logo - Emerges in Phase 2 */}
        <AnimatePresence>
          {(phase === 'brand-emerge' || phase === 'cta-appear' || phase === 'ready') && !showEmailForm && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="absolute top-1/4 left-1/2 -translate-x-1/2 text-center"
            >
              <h1 className="text-5xl font-orbitron font-black tracking-wider mb-2">
                <span className="text-[#00D1FF] drop-shadow-[0_0_20px_rgba(0,209,255,0.8)]">M1</span>
                <span className="text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">SSION</span>
              </h1>
              <p className="text-white/70 text-sm font-light tracking-widest uppercase">
                La Caccia al Tesoro Reale
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 🎮 CTA Buttons - Appear in Phase 3 */}
        <AnimatePresence>
          {(phase === 'cta-appear' || phase === 'ready') && !showEmailForm && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], staggerChildren: 0.1 }}
              className="w-full max-w-sm space-y-3"
            >
              {/* 🍎 Continue with Apple */}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleAppleLogin}
                disabled={appleLoading || googleLoading}
                className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-xl
                  bg-white text-black font-semibold text-base
                  shadow-[0_0_20px_rgba(255,255,255,0.2)]
                  hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]
                  active:scale-[0.98] transition-all duration-200
                  disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Continua con Apple"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
                {appleLoading ? 'Caricamento...' : 'Continua con Apple'}
              </motion.button>

              {/* 🔐 Continue with Google */}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleGoogleLogin}
                disabled={appleLoading || googleLoading}
                className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-xl
                  bg-white/10 backdrop-blur-md text-white font-semibold text-base
                  border border-white/20
                  shadow-[0_0_15px_rgba(255,255,255,0.1)]
                  hover:bg-white/20 hover:shadow-[0_0_25px_rgba(255,255,255,0.15)]
                  active:scale-[0.98] transition-all duration-200
                  disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Continua con Google"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {googleLoading ? 'Caricamento...' : 'Continua con Google'}
              </motion.button>

              {/* 📧 Continue with Email */}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleEmailLogin}
                disabled={appleLoading || googleLoading}
                className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-xl
                  bg-transparent text-white font-semibold text-base
                  border border-white/30
                  hover:bg-white/10 hover:border-white/50
                  active:scale-[0.98] transition-all duration-200
                  disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Accedi con email"
              >
                <Mail className="w-5 h-5" />
                Accedi con email
              </motion.button>

              {/* Terms Notice */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-center text-white/40 text-xs mt-4 px-4"
              >
                Continuando, accetti i{' '}
                <a href="/terms" className="text-white/60 underline">Termini di Servizio</a>
                {' '}e la{' '}
                <a href="/privacy" className="text-white/60 underline">Privacy Policy</a>
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 📧 Email Login Form - Slides up when selected */}
        <AnimatePresence>
          {showEmailForm && (
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-sm"
            >
              {/* Neon glass container */}
              <div className="relative rounded-2xl p-[1.5px] bg-gradient-to-r from-[#00D1FF] via-[#7C3AED] to-[#00D1FF] shadow-[0_0_40px_rgba(0,209,255,0.25),0_0_60px_rgba(124,58,237,0.2)]">
                <div className="rounded-2xl bg-black/90 backdrop-blur-xl p-6">
                  
                  {/* Back Button */}
                  <button
                    onClick={handleBackFromEmail}
                    className="mb-4 text-white/60 hover:text-white text-sm flex items-center gap-2 transition-colors"
                  >
                    ← Torna indietro
                  </button>
                  
                  {/* Title */}
                  <div className="text-center mb-4">
                    <h2 className="text-xl font-orbitron font-bold text-white">
                      Accedi con Email
                    </h2>
                  </div>

                  {/* Standard Login Form */}
                  <StandardLoginForm verificationStatus={verificationStatus} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Skip Hint - During video phase */}
        <AnimatePresence>
          {phase === 'video-only' && videoLoaded && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute bottom-8 text-white/50 text-xs"
            >
              Tocca per continuare
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>,
    document.body
  );
};

export default Login;

// Copyright © 2025 Joseph M1SSION KFT
