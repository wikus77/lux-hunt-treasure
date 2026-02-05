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

          {/* PANEL - TRUE FULLSCREEN con scale animation */}
          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
            transition={{
              type: 'spring',
              stiffness: isClosing ? 400 : 280,
              damping: isClosing ? 32 : 24,
              mass: 0.8,
            }}
            style={{
              position: 'fixed',
              inset: 0, // TRUE FULLSCREEN: edge-to-edge
              zIndex: 99999,
              pointerEvents: 'auto',
              transformOrigin: '50% 50%',
              willChange: 'transform, opacity',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              background: 'linear-gradient(180deg, #0a0a0f 0%, #0d1117 50%, #0a0a0f 100%)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header - con safe-area e sfondo per leggibilità */}
            <div 
              className="flex items-center justify-between px-4 pb-3 flex-shrink-0"
              style={{
                paddingTop: 'calc(env(safe-area-inset-top, 0px) + 12px)',
                background: 'linear-gradient(180deg, rgba(10,10,15,0.95) 0%, rgba(10,10,15,0.8) 70%, transparent 100%)',
              }}
            >
              <div className="flex items-center space-x-3">
                <div 
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ 
                    background: '#00D1FF',
                    boxShadow: '0 0 12px #00D1FF, 0 0 24px rgba(0,209,255,0.5)',
                  }}
                />
                <h3 
                  className="font-orbitron font-bold text-white text-base tracking-wider"
                  style={{ textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}
                >
                  BRIEFING BUZZ
                </h3>
              </div>
              <button
                onClick={handleClose}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                style={{ backdropFilter: 'blur(8px)' }}
                aria-label="Chiudi"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            
            {/* Subtitle - compatto e leggibile */}
            <p 
              className="text-sm px-4 pb-2 flex-shrink-0"
              style={{ 
                color: 'rgba(255,255,255,0.75)',
                textShadow: '0 1px 4px rgba(0,0,0,0.6)',
              }}
            >
              Guarda il video introduttivo prima di iniziare
            </p>

            {/* Video Container - MASSIMIZZATO */}
            <div 
              className="flex-1 px-2 overflow-hidden min-h-0"
              onClick={handleScreenTap}
              onTouchStart={handleScreenTap}
            >
              <div 
                className="relative overflow-hidden bg-black h-full"
                style={{ borderRadius: '16px' }}
              >
                <video
                  ref={videoRef}
                  src={VIDEO_SRC}
                  className="w-full h-full object-cover"
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
                    className="absolute inset-0 flex items-center justify-center"
                    style={{ background: 'rgba(0,0,0,0.35)' }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <motion.div
                      className="flex flex-col items-center gap-2 px-5 py-3 rounded-2xl"
                      style={{ 
                        background: 'rgba(0,0,0,0.6)',
                        backdropFilter: 'blur(8px)',
                      }}
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <VolumeX className="w-8 h-8 text-white/90" />
                      <span className="text-white/90 text-xs font-medium">Tocca per l'audio</span>
                    </motion.div>
                  </motion.div>
                )}
                
                {/* Audio status badge */}
                <div className="absolute bottom-3 left-3">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ 
                      background: 'rgba(0,0,0,0.5)',
                      backdropFilter: 'blur(8px)',
                    }}
                  >
                    {audioEnabled ? (
                      <Volume2 className="w-5 h-5 text-cyan-400" />
                    ) : (
                      <VolumeX className="w-5 h-5 text-white/60" />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Controls - con safe-area e sfondo */}
            <div 
              className="px-4 pt-3 flex-shrink-0 space-y-2"
              style={{
                paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)',
                background: 'linear-gradient(0deg, rgba(10,10,15,0.95) 0%, rgba(10,10,15,0.8) 70%, transparent 100%)',
              }}
            >
              <motion.button
                className="w-full py-3.5 px-6 rounded-xl font-orbitron font-bold text-sm uppercase tracking-wider"
                style={{
                  background: 'linear-gradient(135deg, #00D1FF 0%, #0099CC 100%)',
                  color: 'white',
                  boxShadow: '0 0 24px rgba(0, 209, 255, 0.4), 0 4px 12px rgba(0,0,0,0.3)',
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
                className="w-full text-xs py-2 transition-colors"
                style={{ 
                  color: 'rgba(255,255,255,0.6)',
                  textShadow: '0 1px 3px rgba(0,0,0,0.5)',
                }}
                onClick={handleDismissForever}
              >
                Non mostrare più questo video
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    portalContainer
  );
};

export default BuzzBriefingFlipOverlay;
