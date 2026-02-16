
// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// 🎬 LOGIN v10: "RUNWAY-STYLE" - Video Background + Sign Up / Log In
// UI appears IMMEDIATELY on mount - Video path FIXED for iOS (lowercase)

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { useWouterNavigation } from "@/hooks/useWouterNavigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Mail, ArrowLeft } from "lucide-react";
import { useUnifiedAuth } from "@/hooks/useUnifiedAuth";
import { useAppleAuth } from "@/hooks/useAppleAuth";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";
import { postLoginRedirectFixed } from "@/utils/postLoginRedirectFixed";
import { StandardLoginForm } from "@/components/auth/StandardLoginForm";
import { Capacitor } from "@capacitor/core";
import { useFaceIDLogin } from "@/hooks/useFaceIDLogin";

// Screen types for the login flow
type LoginScreen = 'opening' | 'signup' | 'login';

// 🔧 FIX: Correct video path (lowercase 'video' folder)
const VIDEO_SRC = '/assets/video/M1SSION_INTRO.mp4';
const MAX_VIDEO_RETRIES = 2;
const MEDIA_ERR_DECODE = 3;

/** Device class for forensics: ipad | iphone | other (UA + MacIntel/maxTouchPoints) */
function getLoginVideoDeviceClass(): 'ipad' | 'iphone' | 'other' {
  if (typeof navigator === 'undefined') return 'other';
  const ua = navigator.userAgent;
  if (/iPad/.test(ua)) return 'ipad';
  if (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) return 'ipad';
  if (/iPhone|iPod/.test(ua)) return 'iphone';
  return 'other';
}

/** Forensic log: [LOGIN-VIDEO-FORENSIC] event + deviceClass + optional props/error/retry/finalMode */
function logLoginVideoForensic(
  event: string,
  extra?: { video?: HTMLVideoElement; errorCode?: number; errorMessage?: string; retryCount?: number; finalMode?: 'VIDEO_OK' | 'RETRY_OK' | 'FALLBACK' }
) {
  const deviceClass = getLoginVideoDeviceClass();
  const payload: Record<string, unknown> = { event, deviceClass };
  if (extra?.video) {
    payload.src = extra.video.currentSrc || VIDEO_SRC;
    payload.readyState = extra.video.readyState;
    payload.networkState = extra.video.networkState;
    payload.currentTime = extra.video.currentTime;
    payload.paused = extra.video.paused;
    payload.muted = extra.video.muted;
    payload.playsInline = extra.video.hasAttribute('playsinline');
    payload.preload = extra.video.preload;
  }
  if (extra?.errorCode != null) payload.errorCode = extra.errorCode;
  if (extra?.errorMessage != null) payload.errorMessage = extra.errorMessage;
  if (extra?.retryCount != null) payload.retryCount = extra.retryCount;
  if (extra?.finalMode != null) payload.finalMode = extra.finalMode;
  console.log('[LOGIN-VIDEO-FORENSIC]', JSON.stringify(payload));
}

const Login = () => {
  // 🔐 FIX: Check if coming from logout → skip 'opening', go straight to 'login'
  const getInitialScreen = (): LoginScreen => {
    const loginReason = sessionStorage.getItem('m1ssion_login_reason');
    if (loginReason === 'logout') {
      console.log('🔐 [Login] Detected login_reason=logout → forcing currentScreen=login');
      // Clear the flag immediately (one-time use)
      sessionStorage.removeItem('m1ssion_login_reason');
      return 'login';
    }
    return 'opening';
  };
  
  const [currentScreen, setCurrentScreen] = useState<LoginScreen>(getInitialScreen);
  const [verificationStatus, setVerificationStatus] = useState<string | null>(null);
  
  const { navigate } = useWouterNavigation();
  const { isAuthenticated, isLoading } = useUnifiedAuth();
  const { signInWithApple, loading: appleLoading } = useAppleAuth();
  const { signInWithGoogle, loading: googleLoading } = useGoogleAuth();
  
  const searchParams = new URLSearchParams(window.location.search);
  const redirectAttemptedRef = useRef(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hasDispatchedLoginVisibleRef = useRef(false);
  const videoRetryTappedRef = useRef(false);
  const retryCountRef = useRef(0);
  const firstFrameSeenRef = useRef(false);
  const hasLoggedFinalRef = useRef(false);
  const retryingRef = useRef(false);
  const [showFallback, setShowFallback] = useState(false);

  // iPad/WKWebView: retry video play on first tap (autoplay often blocked)
  const handleVideoRetryTap = useCallback(() => {
    if (videoRetryTappedRef.current || showFallback) return;
    videoRetryTappedRef.current = true;
    const v = videoRef.current;
    if (v) {
      v.muted = true;
      v.play().catch(() => {});
    }
  }, [showFallback]);

  // 🔐 FACE ID: Trigger Face ID when login screen is visible (iOS native only)
  // This is NON-INVASIVE: no UI changes, no auth flow changes, only adds Face ID prompt
  useFaceIDLogin(currentScreen === 'login');

  // 🔐 FIX: Dispatch event when login screen becomes visible (for Face ID hook)
  // This ensures Face ID triggers even when coming from logout (no native foreground event)
  useEffect(() => {
    if (currentScreen === 'login' && !hasDispatchedLoginVisibleRef.current) {
      console.log('🔐 [Login] Dispatching m1ssion:login-visible event');
      hasDispatchedLoginVisibleRef.current = true;
      // Small delay to ensure Face ID hook listener is mounted
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('m1ssion:login-visible', {
          detail: { timestamp: Date.now(), source: 'login-screen-mount' }
        }));
      }, 100);
    }
    
    // Reset flag when leaving login screen
    if (currentScreen !== 'login') {
      hasDispatchedLoginVisibleRef.current = false;
    }
  }, [currentScreen]);

  // Video: always-try + auto-recovery (max 2 retries) + forensics; fallback invisibile on final fail
  useEffect(() => {
    const video = videoRef.current;
    if (!video || showFallback) return;

    logLoginVideoForensic('mount', {});

    video.muted = true;
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');
    video.preload = 'auto';
    if (video.disablePictureInPicture !== undefined) video.disablePictureInPicture = true;

    const attemptPlay = () => {
      video.play().catch(() => {});
    };

    const tryRecover = () => {
      if (retryingRef.current) return;
      if (retryCountRef.current >= MAX_VIDEO_RETRIES) {
        logLoginVideoForensic('error', {
          video,
          errorCode: video.error?.code,
          errorMessage: video.error?.message,
          retryCount: retryCountRef.current,
          finalMode: 'FALLBACK'
        });
        hasLoggedFinalRef.current = true;
        setShowFallback(true);
        return;
      }
      retryingRef.current = true;
      retryCountRef.current += 1;
      logLoginVideoForensic('retry', { video, retryCount: retryCountRef.current });
      video.pause();
      try {
        video.currentTime = 0;
      } catch {
        // ignore
      }
      video.load();
      setTimeout(() => {
        attemptPlay();
        retryingRef.current = false;
      }, 300);
    };

    const onLoadStart = () => logLoginVideoForensic('loadstart', { video });
    const onCanPlay = () => {
      logLoginVideoForensic('canplay', { video });
      attemptPlay();
    };
    const onPlaying = () => {
      if (!hasLoggedFinalRef.current) {
        hasLoggedFinalRef.current = true;
        logLoginVideoForensic('playing', { video, finalMode: retryCountRef.current > 0 ? 'RETRY_OK' : 'VIDEO_OK' });
      } else {
        logLoginVideoForensic('playing', { video });
      }
    };
    const onTimeUpdate = () => {
      if (!firstFrameSeenRef.current) {
        firstFrameSeenRef.current = true;
        logLoginVideoForensic('timeupdate', { video });
      }
    };
    const onStalled = () => {
      logLoginVideoForensic('stalled', { video });
      tryRecover();
    };
    const onWaiting = () => logLoginVideoForensic('waiting', { video });
    const onError = () => {
      const code = video.error?.code;
      const msg = video.error?.message;
      logLoginVideoForensic('error', { video, errorCode: code, errorMessage: msg, retryCount: retryCountRef.current });
      tryRecover();
    };
    const onEnded = () => logLoginVideoForensic('ended', { video });

    video.addEventListener('loadstart', onLoadStart);
    video.addEventListener('canplay', onCanPlay);
    video.addEventListener('playing', onPlaying);
    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('stalled', onStalled);
    video.addEventListener('waiting', onWaiting);
    video.addEventListener('error', onError);
    video.addEventListener('ended', onEnded);

    attemptPlay();

    return () => {
      video.removeEventListener('loadstart', onLoadStart);
      video.removeEventListener('canplay', onCanPlay);
      video.removeEventListener('playing', onPlaying);
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('stalled', onStalled);
      video.removeEventListener('waiting', onWaiting);
      video.removeEventListener('error', onError);
      video.removeEventListener('ended', onEnded);
    };
  }, [showFallback]);

  // 🚀 Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading && !redirectAttemptedRef.current) {
      console.log('🔄 LOGIN PAGE: User authenticated, redirecting');
      redirectAttemptedRef.current = true;
      postLoginRedirectFixed(navigate);
    }
  }, [isAuthenticated, isLoading, navigate]);

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

  // Navigation handlers
  const handleSignUp = useCallback(() => setCurrentScreen('signup'), []);
  const handleLogIn = useCallback(() => setCurrentScreen('login'), []);
  const handleBack = useCallback(() => setCurrentScreen('opening'), []);

  // OAuth handlers
  const handleAppleSignUp = useCallback(async () => {
    await signInWithApple();
  }, [signInWithApple]);

  const handleGoogleSignUp = useCallback(async () => {
    await signInWithGoogle();
  }, [signInWithGoogle]);

  // ============================================================================
  // RENDER: Opening Screen (RUNWAY Style - headline LEFT, M1SSION branding)
  // ============================================================================
  const renderOpeningScreen = () => (
    <motion.div
      key="opening"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="relative z-10 flex flex-col h-full px-6"
      style={{
        paddingTop: 'max(env(safe-area-inset-top, 24px), 24px)',
        paddingBottom: 'max(env(safe-area-inset-bottom, 40px), 40px)'
      }}
    >
      {/* Small M1SSION label - Top Left (like "runway" in reference) */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="self-start"
      >
        <span className="text-white text-sm font-medium tracking-wider">
          M1SSION
        </span>
      </motion.div>

      {/* Large Headline - LEFT aligned (RUNWAY style) */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="flex-1 flex items-center"
      >
        <h1 className="text-5xl sm:text-6xl font-orbitron font-black text-white leading-tight text-left">
          <span className="block">Tools for</span>
          <span className="block">Real-World</span>
          <span className="block text-[#00D1FF] drop-shadow-[0_0_20px_rgba(0,209,255,0.6)]">Treasure Hunting</span>
        </h1>
      </motion.div>

      {/* CTA Buttons - Bottom */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="w-full max-w-sm space-y-4"
      >
        {/* Sign Up Button - Primary */}
        <button
          onClick={handleSignUp}
          className="w-full py-4 px-6 rounded-full
            bg-white text-black font-bold text-lg
            shadow-[0_0_30px_rgba(255,255,255,0.3)]
            hover:shadow-[0_0_40px_rgba(255,255,255,0.4)]
            active:scale-[0.98] transition-all duration-200"
        >
          Sign Up
        </button>

        {/* Log In Button - Secondary (outline) */}
        <button
          onClick={handleLogIn}
          className="w-full py-4 px-6 rounded-full
            bg-transparent text-white font-bold text-lg
            border-2 border-white/50
            hover:bg-white/10 hover:border-white/70
            active:scale-[0.98] transition-all duration-200"
        >
          Log In
        </button>

        {/* Terms Notice - Runway Style */}
        <p className="text-white/40 text-xs mt-6 leading-relaxed">
          By tapping "Sign Up", you agree to our{' '}
          <a href="/terms" className="text-white/60 underline">Terms of Use</a>
          {' '}and acknowledge that you have read and understand our{' '}
          <a href="/privacy" className="text-white/60 underline">Privacy Policy</a>.
        </p>
      </motion.div>
    </motion.div>
  );

  // ============================================================================
  // RENDER: Sign Up Screen (Provider options)
  // ============================================================================
  const renderSignUpScreen = () => (
    <motion.div
      key="signup"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.4 }}
      className="relative z-10 flex flex-col h-full py-8 px-6"
      style={{
        paddingTop: 'max(env(safe-area-inset-top, 48px), 48px)',
        paddingBottom: 'max(env(safe-area-inset-bottom, 32px), 32px)'
      }}
    >
      {/* Back Button */}
      <button
        onClick={handleBack}
        className="flex items-center gap-2 text-white/70 hover:text-white mb-8 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back</span>
      </button>

      {/* Title */}
      <h2 className="text-3xl font-orbitron font-bold text-white mb-2">
        Create Account
      </h2>
      <p className="text-white/60 mb-8">
        Choose how you want to sign up
      </p>

      {/* Provider Buttons */}
      <div className="space-y-3 mb-6">
        {/* Sign up with Apple */}
        <button
          onClick={handleAppleSignUp}
          disabled={appleLoading || googleLoading}
          className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-xl
            bg-white text-black font-semibold text-base
            shadow-lg hover:shadow-xl
            active:scale-[0.98] transition-all duration-200
            disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
          </svg>
          {appleLoading ? 'Loading...' : 'Sign up with Apple'}
        </button>

        {/* Sign up with Google */}
        <button
          onClick={handleGoogleSignUp}
          disabled={appleLoading || googleLoading}
          className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-xl
            bg-white text-black font-semibold text-base
            shadow-lg hover:shadow-xl
            active:scale-[0.98] transition-all duration-200
            disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {googleLoading ? 'Loading...' : 'Sign up with Google'}
        </button>
      </div>

      {/* OR Divider */}
      <div className="flex items-center gap-4 my-6">
        <div className="flex-1 h-px bg-white/20" />
        <span className="text-white/50 text-sm">or</span>
        <div className="flex-1 h-px bg-white/20" />
      </div>

      {/* Email signup - Navigate to register */}
      <button
        onClick={() => navigate('/register')}
        className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-xl
          bg-white/10 backdrop-blur text-white font-semibold text-base
          border border-white/20
          hover:bg-white/20
          active:scale-[0.98] transition-all duration-200"
      >
        <Mail className="w-5 h-5" />
        Sign up with Email
      </button>

      {/* Existing account link */}
      <p className="text-center text-white/50 text-sm mt-8">
        Already have an account?{' '}
        <button onClick={handleLogIn} className="text-[#00D1FF] hover:underline">
          Log In
        </button>
      </p>
    </motion.div>
  );

  // ============================================================================
  // RENDER: Log In Screen (Existing email/password flow)
  // ============================================================================
  const renderLoginScreen = () => (
    <motion.div
      key="login"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.4 }}
      className="relative z-10 flex flex-col h-full py-8 px-6"
      style={{
        paddingTop: 'max(env(safe-area-inset-top, 48px), 48px)',
        paddingBottom: 'max(env(safe-area-inset-bottom, 32px), 32px)'
      }}
    >
      {/* Back Button */}
      <button
        onClick={handleBack}
        className="flex items-center gap-2 text-white/70 hover:text-white mb-8 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back</span>
      </button>

      {/* Title */}
      <h2 className="text-3xl font-orbitron font-bold text-white mb-2">
        Welcome Back
      </h2>
      <p className="text-white/60 mb-8">
        Log in to continue your mission
      </p>

      {/* Glass container for form */}
      <div className="relative rounded-2xl p-[1.5px] bg-gradient-to-r from-[#00D1FF]/50 via-[#7C3AED]/50 to-[#00D1FF]/50">
        <div className="rounded-2xl bg-black/80 backdrop-blur-xl p-6">
          <StandardLoginForm verificationStatus={verificationStatus} />
        </div>
      </div>

      {/* No account link */}
      <p className="text-center text-white/50 text-sm mt-8">
        Don't have an account?{' '}
        <button onClick={handleSignUp} className="text-[#00D1FF] hover:underline">
          Sign Up
        </button>
      </p>
    </motion.div>
  );

  // ============================================================================
  // MAIN RENDER
  // ============================================================================
  return createPortal(
    <div
      className="fixed inset-0 z-[100] overflow-hidden bg-black"
      onClick={handleVideoRetryTap}
      onTouchStart={handleVideoRetryTap}
      role="presentation"
    >
      {/* 🎬 Video Background or fallback invisibile (black + same overlay); always-try + recovery + forensics */}
      {!showFallback && (
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ zIndex: 0, transform: 'translateZ(0)' }}
          disablePictureInPicture
        >
          <source src={VIDEO_SRC} type="video/mp4" />
        </video>
      )}
      {showFallback && (
        <div
          className="absolute inset-0 w-full h-full bg-black"
          style={{ zIndex: 0 }}
          aria-hidden
        />
      )}

      {/* Gradient overlay for readability (z-index: 1) — identico per video e fallback */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 1,
          background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 40%, rgba(0,0,0,0.2) 70%, rgba(0,0,0,0.5) 100%)'
        }}
      />

      {/* Animated content based on current screen (z-index: 10) */}
      <AnimatePresence mode="wait">
        {currentScreen === 'opening' && renderOpeningScreen()}
        {currentScreen === 'signup' && renderSignUpScreen()}
        {currentScreen === 'login' && renderLoginScreen()}
      </AnimatePresence>
    </div>,
    document.body
  );
};

export default Login;

// Copyright © 2025 Joseph M1SSION KFT
