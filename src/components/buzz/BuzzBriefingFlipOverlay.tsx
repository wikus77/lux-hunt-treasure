/**
 * BuzzBriefingFlipOverlay - Fullscreen modal per video briefing BUZZ
 * Pattern identico a M1UPaymentFlipOverlay (scale dal centro + backdrop blur)
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { X, VolumeX, Volume2 } from 'lucide-react';

const VIDEO_SRC = '/assets/video/BUZZ-BRIF-VIDEO-01.mp4';
const STORAGE_KEY = 'm1_buzz_video_modal_dismissed';
const ADMIN_EMAILS = ['wikus77@hotmail.it'];

export interface BuzzBriefingFlipOverlayProps {
  open: boolean;
  onClose: () => void;
  userEmail?: string;
  onContinue: () => void;
}

export const BuzzBriefingFlipOverlay: React.FC<BuzzBriefingFlipOverlayProps> = ({
  open,
  onClose,
  userEmail,
  onContinue
}) => {
  const [isClosing, setIsClosing] = useState(false);
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Check se mostrare il video (admin sempre, altri controllano localStorage)
  const shouldShowVideo = useCallback(() => {
    const isAdmin = userEmail && ADMIN_EMAILS.includes(userEmail.toLowerCase());
    if (isAdmin) {
      localStorage.removeItem(STORAGE_KEY);
      return true;
    }
    return localStorage.getItem(STORAGE_KEY) !== 'true';
  }, [userEmail]);

  // Create portal
  useEffect(() => {
    let container = document.getElementById('m1-buzz-briefing-portal');
    if (!container) {
      container = document.createElement('div');
      container.id = 'm1-buzz-briefing-portal';
      container.style.cssText = 'position:fixed;inset:0;z-index:99999;pointer-events:none;';
      document.body.appendChild(container);
    }
    setPortalContainer(container);
  }, []);

  // Lock scroll + ESC handler
  useEffect(() => {
    if (open && shouldShowVideo()) {
      const orig = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      
      const handleEsc = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && !isClosing) handleClose();
      };
      window.addEventListener('keydown', handleEsc);
      
      return () => {
        document.body.style.overflow = orig;
        window.removeEventListener('keydown', handleEsc);
      };
    }
  }, [open, isClosing, shouldShowVideo]);

  // 🔊 AUDIO LOGIC - Auto-unmute attempt
  useEffect(() => {
    if (open && shouldShowVideo() && videoRef.current) {
      const video = videoRef.current;
      
      const tryUnmute = () => {
        video.muted = false;
        video.play().then(() => {
          setAudioEnabled(true);
          console.log('[BuzzBriefingFlipOverlay] 🔊 Audio enabled automatically');
        }).catch(() => {
          video.muted = true;
          video.play().catch(() => {
            console.log('[BuzzBriefingFlipOverlay] ⚠️ Autoplay failed');
          });
        });
      };
      
      setTimeout(tryUnmute, 100);
    }
  }, [open, shouldShowVideo]);

  // Handle tap to enable audio
  const handleScreenTap = useCallback(() => {
    if (videoRef.current && !audioEnabled) {
      videoRef.current.muted = false;
      videoRef.current.play().catch(() => {});
      setAudioEnabled(true);
    }
  }, [audioEnabled]);

  // Close handler
  const handleClose = useCallback(() => {
    if (isClosing) return;
    setIsClosing(true);
    
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
    setAudioEnabled(false);
    
    setTimeout(() => {
      onClose();
      onContinue();
      setIsClosing(false);
    }, 280);
  }, [isClosing, onClose, onContinue]);

  // Dismiss forever
  const handleDismissForever = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    localStorage.setItem(STORAGE_KEY, 'true');
    handleClose();
  }, [handleClose]);

  // Video ended
  const handleVideoEnd = useCallback(() => {
    setTimeout(handleClose, 500);
  }, [handleClose]);

  // Skip if already dismissed
  useEffect(() => {
    if (open && !shouldShowVideo()) {
      onClose();
      onContinue();
    }
  }, [open, shouldShowVideo, onClose, onContinue]);

  if (!portalContainer || !shouldShowVideo()) return null;

  return createPortal(
    <AnimatePresence mode="wait">
      {open && (
        <>
          {/* BACKDROP - REVOLUT style: vetro fumé con blur forte */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: isClosing ? 0.2 : 0.25 }}
            onClick={handleClose}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 99998,
              backgroundColor: 'rgba(10, 10, 15, 0.85)',
              backdropFilter: 'blur(50px) saturate(180%)',
              WebkitBackdropFilter: 'blur(50px) saturate(180%)',
              pointerEvents: 'auto',
            }}
          />

          {/* PANEL - Fullscreen con scale animation */}
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.85, opacity: 0 }}
            transition={{
              type: 'spring',
              stiffness: isClosing ? 400 : 280,
              damping: isClosing ? 32 : 24,
              mass: 0.8,
            }}
            style={{
              position: 'fixed',
              top: 'env(safe-area-inset-top, 0px)',
              left: 0,
              right: 0,
              bottom: 'env(safe-area-inset-bottom, 0px)',
              zIndex: 99999,
              pointerEvents: 'auto',
              transformOrigin: '50% 50%',
              willChange: 'transform, opacity',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Container principale */}
            <div 
              className="flex-1 flex flex-col bg-[#0a0a0f]/98 backdrop-blur-xl overflow-hidden"
              style={{
                borderRadius: '24px',
                margin: '8px',
                border: '1px solid rgba(0, 209, 255, 0.2)',
                boxShadow: '0 0 60px rgba(0, 209, 255, 0.15), inset 0 0 30px rgba(0, 209, 255, 0.03)',
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 flex-shrink-0">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ 
                      background: 'linear-gradient(135deg, #00D1FF 0%, #0099CC 100%)',
                      boxShadow: '0 0 15px #00D1FF',
                    }}
                  />
                  <h3 className="font-orbitron font-bold text-white text-lg tracking-wide">
                    BRIEFING BUZZ
                  </h3>
                </div>
                <button
                  onClick={handleClose}
                  className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                  aria-label="Chiudi"
                >
                  <X className="w-5 h-5 text-white/70" />
                </button>
              </div>
              
              {/* Subtitle */}
              <p className="text-sm text-white/50 px-5 py-3 flex-shrink-0">
                Guarda il video introduttivo prima di iniziare
              </p>

              {/* Video Container - occupa tutto lo spazio disponibile */}
              <div 
                className="flex-1 px-4 pb-2 overflow-hidden"
                onClick={handleScreenTap}
                onTouchStart={handleScreenTap}
              >
                <div className="relative rounded-2xl overflow-hidden bg-black h-full">
                  <video
                    ref={videoRef}
                    src={VIDEO_SRC}
                    className="w-full h-full object-contain"
                    playsInline
                    muted={!audioEnabled}
                    onEnded={handleVideoEnd}
                    onError={handleClose}
                    disablePictureInPicture
                    disableRemotePlayback
                    controlsList="nodownload noremoteplayback"
                  />
                  
                  {/* Audio indicator overlay */}
                  {!audioEnabled && (
                    <motion.div
                      className="absolute inset-0 flex items-center justify-center bg-black/40"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <motion.div
                        className="flex flex-col items-center gap-3 px-6 py-4 rounded-2xl bg-black/70 backdrop-blur-sm"
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <VolumeX className="w-10 h-10 text-white/80" />
                        <span className="text-white/80 text-sm font-medium">Tocca per l'audio</span>
                      </motion.div>
                    </motion.div>
                  )}
                  
                  {/* Audio status badge */}
                  <div className="absolute bottom-4 left-4">
                    <div className="w-12 h-12 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center">
                      {audioEnabled ? (
                        <Volume2 className="w-6 h-6 text-cyan-400" />
                      ) : (
                        <VolumeX className="w-6 h-6 text-white/50" />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Controls */}
              <div className="px-5 pb-5 pt-3 flex-shrink-0 space-y-3">
                <motion.button
                  className="w-full py-4 px-6 rounded-xl font-orbitron font-bold text-base uppercase tracking-wider"
                  style={{
                    background: 'linear-gradient(135deg, #00D1FF 0%, #0099CC 100%)',
                    color: 'white',
                    boxShadow: '0 0 30px rgba(0, 209, 255, 0.4)',
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClose();
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  CONTINUA →
                </motion.button>
                
                <button
                  className="w-full text-sm text-white/40 hover:text-white/60 transition-colors py-2"
                  onClick={handleDismissForever}
                >
                  Non mostrare più questo video
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    portalContainer
  );
};

export default BuzzBriefingFlipOverlay;
