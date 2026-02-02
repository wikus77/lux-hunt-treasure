// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// M1 Logo Video Intro - AAA Cinematic Quality
// Jan 2026 update: Uses M1SSION_INTRO.mp4 with proper fade in/out

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// 🎬 Video path - same as Login page
const VIDEO_SRC = '/assets/video/M1SSION_INTRO.mp4';

interface M1LogoSplashProps {
  onComplete: () => void;
  duration?: number; // Fallback duration if video fails (ms)
}

const M1LogoSplash: React.FC<M1LogoSplashProps> = ({ 
  onComplete, 
  duration = 4500 // 4.5 seconds default
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isFadingIn, setIsFadingIn] = useState(true);  // Start with fade-in
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hasEndedRef = useRef(false);

  // Handle completion with smooth fade-out
  const handleComplete = () => {
    if (hasEndedRef.current) return;
    hasEndedRef.current = true;
    
    console.log('🎬 [Splash] Starting fade-out transition');
    setIsFadingOut(true);
    
    // Wait for fade-out animation to complete (800ms)
    setTimeout(() => {
      setIsVisible(false);
      onComplete();
    }, 800);
  };

  // Fade-in complete after mount
  useEffect(() => {
    const fadeInTimer = setTimeout(() => {
      setIsFadingIn(false);
      console.log('🎬 [Splash] Fade-in complete');
    }, 600);
    
    return () => clearTimeout(fadeInTimer);
  }, []);

  // Main duration timer
  useEffect(() => {
    const durationTimer = setTimeout(() => {
      if (!hasEndedRef.current) {
        console.log('🎬 [Splash] Duration reached, completing');
        handleComplete();
      }
    }, duration);

    return () => clearTimeout(durationTimer);
  }, [duration]);

  // Handle video loaded
  const handleVideoLoaded = () => {
    console.log('🎬 [Splash] Video loaded successfully');
    setVideoLoaded(true);
  };

  // Handle video error
  const handleVideoError = () => {
    console.error('🎬 [Splash] Video failed to load');
    setVideoError(true);
  };

  // Auto-play video when component mounts
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      // Set up listeners first
      video.addEventListener('loadeddata', handleVideoLoaded);
      video.addEventListener('error', handleVideoError);
      
      // Try to play
      video.play().catch(err => {
        console.log('🎬 [Splash] Video autoplay blocked, trying muted:', err);
        video.muted = true;
        video.play().catch(() => {
          console.error('🎬 [Splash] Video play failed even muted');
          setVideoError(true);
        });
      });
      
      return () => {
        video.removeEventListener('loadeddata', handleVideoLoaded);
        video.removeEventListener('error', handleVideoError);
      };
    }
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#000000',
            overflow: 'hidden',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: isFadingIn ? 0 : isFadingOut ? 0 : 1 }}
          exit={{ opacity: 0 }}
          transition={{ 
            duration: isFadingIn ? 0.6 : isFadingOut ? 0.8 : 0.3,
            ease: 'easeInOut'
          }}
        >
          {!videoError ? (
            <>
              {/* Video Player - M1SSION_INTRO.mp4 */}
              <video
                ref={videoRef}
                playsInline
                autoPlay
                muted
                loop // Loop to ensure it plays during the full duration
                preload="auto"
                // 🛡️ Prevents Dynamic Island activation on iOS
                disablePictureInPicture
                disableRemotePlayback
                controlsList="nodownload noremoteplayback"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  backgroundColor: '#000000',
                  zIndex: 1,
                  opacity: videoLoaded ? 1 : 0,
                  transition: 'opacity 0.3s ease-in',
                }}
                src={VIDEO_SRC}
              />
              
              {/* Dark overlay to soften video and improve text readability */}
              <div 
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.6) 100%)',
                  pointerEvents: 'none',
                  zIndex: 2,
                }}
              />

              {/* Optional: M1SSION logo overlay during video */}
              <motion.div
                style={{
                  position: 'absolute',
                  bottom: 'calc(env(safe-area-inset-bottom, 34px) + 40px)',
                  left: 0,
                  right: 0,
                  textAlign: 'center',
                  zIndex: 10,
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: videoLoaded ? 1 : 0, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                <p 
                  style={{ 
                    color: 'rgba(255, 255, 255, 0.6)',
                    fontSize: '11px',
                    letterSpacing: '3px',
                    textTransform: 'uppercase',
                    fontFamily: 'Inter, sans-serif',
                  }}
                >
                  IT IS POSSIBLE
                </p>
              </motion.div>
            </>
          ) : (
            // Fallback: Simple logo if video fails
            <motion.div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '32px' }}>
                <span 
                  style={{ 
                    fontSize: '96px',
                    fontWeight: 700,
                    color: '#00D1FF',
                    textShadow: '0 0 40px rgba(0, 209, 255, 0.8), 0 0 80px rgba(0, 209, 255, 0.4)',
                    fontFamily: 'Inter, sans-serif'
                  }}
                >
                  M
                </span>
                <span 
                  style={{ 
                    fontSize: '96px',
                    fontWeight: 700,
                    color: '#FFFFFF',
                    textShadow: '0 0 20px rgba(255, 255, 255, 0.5)',
                    fontFamily: 'Inter, sans-serif'
                  }}
                >
                  1
                </span>
              </div>
              <p 
                style={{ 
                  fontSize: '18px',
                  letterSpacing: '0.3em',
                  color: '#F59E0B',
                  fontFamily: 'Orbitron, sans-serif',
                  textShadow: '0 0 20px rgba(218, 165, 32, 0.6)'
                }}
              >
                IT IS POSSIBLE
              </p>
            </motion.div>
          )}

          {/* Loading indicator while video loads */}
          {!videoLoaded && !videoError && (
            <motion.div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#000000',
                zIndex: 5,
              }}
              initial={{ opacity: 1 }}
              animate={{ opacity: videoLoaded ? 0 : 1 }}
              transition={{ duration: 0.3 }}
            >
              <div 
                style={{
                  width: '40px',
                  height: '40px',
                  border: '3px solid rgba(0, 209, 255, 0.2)',
                  borderTopColor: '#00D1FF',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                }}
              />
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default M1LogoSplash;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
