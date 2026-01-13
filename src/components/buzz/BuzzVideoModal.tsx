/**
 * BuzzVideoModal - Modal video briefing ESPANDIBILE fino alla header
 * Audio logic copiata da HomeIntroVideo (funzionante)
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import React, { useEffect, useRef, useCallback, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { X, VolumeX, Volume2 } from "lucide-react";

const VIDEO_SRC = '/assets/video/BUZZ-BRIF-VIDEO-01.mp4';
const STORAGE_KEY = 'm1_buzz_video_modal_dismissed';
const ADMIN_EMAILS = ['wikus77@hotmail.it'];

export interface BuzzVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string;
  onContinue: () => void;
}

export function BuzzVideoModal({ isOpen, onClose, userEmail, onContinue }: BuzzVideoModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);
  
  // Swipe-to-close
  const dragY = useMotionValue(0);
  const dragOpacity = useTransform(dragY, [0, 200], [1, 0.5]);
  const SWIPE_THRESHOLD = 100;

  // Check se mostrare il video (admin sempre, altri controllano localStorage)
  const shouldShowVideo = useCallback(() => {
    const isAdmin = userEmail && ADMIN_EMAILS.includes(userEmail.toLowerCase());
    if (isAdmin) {
      localStorage.removeItem(STORAGE_KEY);
      return true;
    }
    return localStorage.getItem(STORAGE_KEY) !== 'true';
  }, [userEmail]);

  // Create portal container
  useEffect(() => {
    let container = document.getElementById('m1-buzz-video-portal');
    if (!container) {
      container = document.createElement('div');
      container.id = 'm1-buzz-video-portal';
      document.body.appendChild(container);
    }
    setPortalContainer(container);
  }, []);

  // 🔊 AUDIO LOGIC - copiata da HomeIntroVideo (funzionante)
  useEffect(() => {
    if (isOpen && videoRef.current) {
      const video = videoRef.current;
      
      // Try to unmute - will work on desktop if MEI is high
      const tryUnmute = () => {
        video.muted = false;
        video.play().then(() => {
          setAudioEnabled(true);
          console.log('[BuzzVideoModal] 🔊 Audio enabled automatically');
        }).catch(() => {
          // Autoplay with audio blocked - keep muted
          video.muted = true;
          video.play().catch(() => {
            console.log('[BuzzVideoModal] ⚠️ Autoplay failed');
          });
        });
      };
      
      // Small delay to let video initialize
      setTimeout(tryUnmute, 100);
    }
  }, [isOpen]);

  // Lock body scroll
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  // Handle tap anywhere to enable audio (for mobile)
  const handleScreenTap = useCallback(() => {
    if (videoRef.current && !audioEnabled) {
      videoRef.current.muted = false;
      videoRef.current.play().catch(() => {});
      setAudioEnabled(true);
      console.log('[BuzzVideoModal] 🔊 Audio enabled by tap');
    }
  }, [audioEnabled]);

  const handleClose = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
    setAudioEnabled(false);
    onClose();
    onContinue();
  }, [onClose, onContinue]);

  const handleDismissForever = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    localStorage.setItem(STORAGE_KEY, 'true');
    handleClose();
  }, [handleClose]);

  const handleVideoEnd = useCallback(() => {
    setTimeout(() => {
      handleClose();
    }, 500);
  }, [handleClose]);

  const handleDragEnd = useCallback((_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.y > SWIPE_THRESHOLD || info.velocity.y > 500) {
      handleClose();
    }
    dragY.set(0);
  }, [handleClose, dragY]);

  // Se il video è stato dismissato, vai direttamente alla pagina
  useEffect(() => {
    if (isOpen && !shouldShowVideo()) {
      onClose();
      onContinue();
    }
  }, [isOpen, shouldShowVideo, onClose, onContinue]);

  if (!portalContainer || !shouldShowVideo()) return null;

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99998]"
            onClick={handleClose}
          />
          
          {/* Bottom Sheet - MASSIMA ALTEZZA - appena sotto la status bar */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-[99999] overflow-hidden"
            style={{
              // Arriva fino a 50px dalla cima (massima altezza possibile)
              top: 'calc(50px + env(safe-area-inset-top, 0px))',
              paddingBottom: 'env(safe-area-inset-bottom, 0px)',
              opacity: dragOpacity,
              y: dragY,
            }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.5 }}
            onDragEnd={handleDragEnd}
          >
            {/* Container */}
            <div 
              className="h-full rounded-t-3xl bg-[#0a0a0f]/95 backdrop-blur-xl border-t border-x overflow-hidden flex flex-col"
              style={{
                borderColor: 'rgba(0, 209, 255, 0.3)',
                boxShadow: '0 -10px 40px rgba(0, 209, 255, 0.15), 0 0 0 1px rgba(0, 209, 255, 0.1)',
              }}
            >
              {/* Drag handle */}
              <div className="flex justify-center pt-3 pb-2 cursor-grab flex-shrink-0">
                <div className="w-12 h-1.5 rounded-full bg-white/30" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-4 pb-3 border-b border-white/10 flex-shrink-0">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-2 h-2 rounded-full"
                    style={{ 
                      background: '#00D1FF',
                      boxShadow: '0 0 10px #00D1FF',
                    }}
                  />
                  <h3 className="font-orbitron font-bold text-white text-[15px]">BRIEFING BUZZ</h3>
                </div>
                <button
                  onClick={handleClose}
                  className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center"
                >
                  <X className="w-4 h-4 text-white/70" />
                </button>
              </div>
              
              <p className="text-xs text-white/50 px-4 pt-2 flex-shrink-0">
                Guarda il video introduttivo prima di iniziare
              </p>

              {/* Video Container - MASSIMO - occupa tutto lo spazio, video a pieno schermo */}
              <div 
                className="flex-1 px-3 py-2 overflow-hidden"
                onClick={handleScreenTap}
                onTouchStart={handleScreenTap}
              >
                <div className="relative rounded-2xl overflow-hidden bg-black h-full">
                  <video
                    ref={videoRef}
                    src={VIDEO_SRC}
                    className="w-full h-full object-cover"
                    playsInline
                    muted={!audioEnabled}
                    onEnded={handleVideoEnd}
                    onError={handleClose}
                    // 🛡️ Impedisce attivazione Dynamic Island su iOS
                    disablePictureInPicture
                    disableRemotePlayback
                    controlsList="nodownload noremoteplayback"
                  />
                  
                  {/* Audio indicator overlay */}
                  {!audioEnabled && (
                    <motion.div
                      className="absolute inset-0 flex items-center justify-center bg-black/30"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <motion.div
                        className="flex flex-col items-center gap-2 px-4 py-3 rounded-xl bg-black/60 backdrop-blur-sm"
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <VolumeX className="w-8 h-8 text-white/80" />
                        <span className="text-white/80 text-xs font-medium">Tocca per l'audio</span>
                      </motion.div>
                    </motion.div>
                  )}
                  
                  {/* Audio status indicator */}
                  <div className="absolute bottom-3 left-3">
                    <div className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center">
                      {audioEnabled ? (
                        <Volume2 className="w-5 h-5 text-cyan-400" />
                      ) : (
                        <VolumeX className="w-5 h-5 text-white/60" />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Controls - fissi in basso */}
              <div className="px-4 pb-4 flex-shrink-0">
                <motion.button
                  className="w-full py-4 px-6 rounded-xl font-orbitron font-bold text-sm uppercase tracking-wider"
                  style={{
                    background: 'linear-gradient(135deg, #00D1FF 0%, #0099CC 100%)',
                    color: 'white',
                    boxShadow: '0 0 20px rgba(0, 209, 255, 0.3)',
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
                  className="w-full mt-2 text-xs text-white/40 hover:text-white/60 transition-colors py-2"
                  onClick={handleDismissForever}
                >
                  Non mostrare più questo video
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, portalContainer);
}

export default BuzzVideoModal;

