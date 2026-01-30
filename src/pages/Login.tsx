
// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// 🎬 LOGIN v9: "RUNWAY-STYLE" - Video Background + Sign Up / Log In
// UI appears IMMEDIATELY on mount (no tap required, no video dependency)

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

// Screen types for the login flow
type LoginScreen = 'opening' | 'signup' | 'login';

const Login = () => {
  const [currentScreen, setCurrentScreen] = useState<LoginScreen>('opening');
  const [verificationStatus, setVerificationStatus] = useState<string | null>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  
  const { navigate } = useWouterNavigation();
  const { isAuthenticated, isLoading } = useUnifiedAuth();
  const { signInWithApple, loading: appleLoading } = useAppleAuth();
  const { signInWithGoogle, loading: googleLoading } = useGoogleAuth();
  
  const searchParams = new URLSearchParams(window.location.search);
  const redirectAttemptedRef = useRef(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // 🔍 Debug log on mount
  useEffect(() => {
    const platform = Capacitor.isNativePlatform() ? 'capacitor' : 'web';
    const videoSrc = '/assets/VIDEO/M1SSION_INTRO.mp4';
    console.log('🎬 [Login] Mount debug:', { platform, videoSrc, videoLoaded, videoError });
  }, [videoLoaded, videoError]);

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

  // Video handlers
  const handleVideoLoad = useCallback(() => {
    console.log('🎬 [Login] Video loaded successfully');
    setVideoLoaded(true);
  }, []);

  const handleVideoError = useCallback((e: React.SyntheticEvent<HTMLVideoElement>) => {
    console.error('🎬 [Login] Video failed to load:', e);
    setVideoError(true);
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
  // RENDER: Opening Screen (Photo 3 - "Runway Style")
  // ============================================================================
  const renderOpeningScreen = () => (
    <motion.div
      key="opening"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="relative z-10 flex flex-col items-center justify-between h-full py-16 px-6"
      style={{
        paddingTop: 'max(env(safe-area-inset-top, 64px), 64px)',
        paddingBottom: 'max(env(safe-area-inset-bottom, 64px), 64px)'
      }}
    >
      {/* Brand Logo - Top Center */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="text-center"
      >
        <h1 className="text-5xl font-orbitron font-black tracking-wider mb-2">
          <span className="text-[#00D1FF] drop-shadow-[0_0_20px_rgba(0,209,255,0.8)]">M1</span>
          <span className="text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">SSION</span>
        </h1>
        <p className="text-white/70 text-sm font-light tracking-widest uppercase">
          La Caccia al Tesoro Reale
        </p>
      </motion.div>

      {/* Spacer */}
      <div className="flex-1" />

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

        {/* Terms Notice */}
        <p className="text-center text-white/40 text-xs mt-6 px-4">
          By continuing, you agree to our{' '}
          <a href="/terms" className="text-white/60 underline">Terms</a>
          {' '}and{' '}
          <a href="/privacy" className="text-white/60 underline">Privacy Policy</a>
        </p>
      </motion.div>
    </motion.div>
  );

  // ============================================================================
  // RENDER: Sign Up Screen (Photo 4 - Provider options)
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
    <div className="fixed inset-0 z-[100] overflow-hidden bg-black">
      {/* 🎬 Video Background - Full Screen Cover */}
      {!videoError && (
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          onLoadedData={handleVideoLoad}
          onError={handleVideoError}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ 
            opacity: videoLoaded ? 1 : 0,
            transition: 'opacity 0.5s ease-in'
          }}
        >
          <source src="/assets/VIDEO/M1SSION_INTRO.mp4" type="video/mp4" />
        </video>
      )}

      {/* Fallback gradient if video fails */}
      <div 
        className="absolute inset-0"
        style={{
          background: videoLoaded 
            ? 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.5) 100%)'
            : 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #0a0a0a 100%)',
          transition: 'background 0.5s ease-in'
        }}
      />

      {/* Animated content based on current screen */}
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
