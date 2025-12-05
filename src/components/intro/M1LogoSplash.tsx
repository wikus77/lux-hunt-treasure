// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// M1 Logo Video Intro - AAA Cinematic Quality

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface M1LogoSplashProps {
  onComplete: () => void;
  duration?: number; // Fallback duration if video fails
}

const M1LogoSplash: React.FC<M1LogoSplashProps> = ({ 
  onComplete, 
  duration = 8000 
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isFading, setIsFading] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hasEndedRef = useRef(false);

  const handleComplete = () => {
    if (hasEndedRef.current) return;
    hasEndedRef.current = true;
    
    setIsFading(true);
    setTimeout(() => {
      setIsVisible(false);
      onComplete();
    }, 500);
  };

  useEffect(() => {
    // Fallback timer in case video doesn't load or has issues
    const fallbackTimer = setTimeout(() => {
      if (!hasEndedRef.current) {
        console.log('Video fallback timer triggered');
        handleComplete();
      }
    }, duration);

    return () => clearTimeout(fallbackTimer);
  }, [duration]);

  // Handle video end
  const handleVideoEnded = () => {
    console.log('Video ended naturally');
    handleComplete();
  };

  // Handle video error
  const handleVideoError = () => {
    console.error('Video failed to load');
    setVideoError(true);
    // Show fallback briefly then complete
    setTimeout(handleComplete, 2000);
  };

  // Auto-play video when component mounts
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.play().catch(err => {
        console.log('Video autoplay blocked, trying muted:', err);
        video.muted = true;
        video.play().catch(handleVideoError);
      });
    }
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-black overflow-hidden"
          initial={{ opacity: 1 }}
          animate={{ opacity: isFading ? 0 : 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {!videoError ? (
            <>
              {/* Video Player - MOV file - Centered and contained */}
              <video
                ref={videoRef}
                playsInline
                autoPlay
                muted
                onEnded={handleVideoEnded}
                onError={handleVideoError}
                preload="auto"
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  backgroundColor: 'black',
                  zIndex: 1
                }}
                src="/videos/m1-intro.mov"
              />
              
              {/* Top gradient fade - ABOVE video to hide sharp edge - STRONG */}
              <div 
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '40%',
                  background: 'linear-gradient(to bottom, #000000 0%, #000000 30%, rgba(0,0,0,0.95) 50%, rgba(0,0,0,0.7) 70%, rgba(0,0,0,0.3) 85%, rgba(0,0,0,0) 100%)',
                  pointerEvents: 'none',
                  zIndex: 100
                }}
              />
              
              {/* Bottom gradient fade - ABOVE video to hide sharp edge - STRONG */}
              <div 
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: '40%',
                  background: 'linear-gradient(to top, #000000 0%, #000000 30%, rgba(0,0,0,0.95) 50%, rgba(0,0,0,0.7) 70%, rgba(0,0,0,0.3) 85%, rgba(0,0,0,0) 100%)',
                  pointerEvents: 'none',
                  zIndex: 100
                }}
              />
            </>
          ) : (
            // Fallback: Simple logo if video fails
            <motion.div
              className="flex flex-col items-center justify-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center mb-8">
                <span 
                  className="text-8xl font-bold text-cyan-400"
                  style={{ 
                    textShadow: '0 0 40px rgba(0, 209, 255, 0.8), 0 0 80px rgba(0, 209, 255, 0.4)',
                    fontFamily: 'Inter, sans-serif'
                  }}
                >
                  M
                </span>
                <span 
                  className="text-8xl font-bold text-white"
                  style={{ 
                    textShadow: '0 0 20px rgba(255, 255, 255, 0.5)',
                    fontFamily: 'Inter, sans-serif'
                  }}
                >
                  1
                </span>
              </div>
              <p 
                className="text-xl tracking-[0.3em] text-amber-500"
                style={{ 
                  fontFamily: 'Orbitron, sans-serif',
                  textShadow: '0 0 20px rgba(218, 165, 32, 0.6)'
                }}
              >
                IT IS POSSIBLE
              </p>
            </motion.div>
          )}

          {/* Tap to unmute hint (for iOS) */}
          <motion.div
            className="absolute bottom-8 text-white/40 text-xs"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            {/* Hidden on purpose - just in case needed */}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default M1LogoSplash;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
