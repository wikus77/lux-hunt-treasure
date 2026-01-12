/**
 * GenericVideoModal - Modal video briefing riusabile per tutte le pagine
 * Container espandibile grande come quello di Buzz
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import React, { useEffect, useRef, useCallback, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { X, VolumeX, Volume2 } from "lucide-react";

const ADMIN_EMAILS = ['wikus77@hotmail.it'];

export interface GenericVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
  userEmail?: string;
  videoSrc: string;
  storageKey: string;
  title: string;
  subtitle?: string;
  accentColor?: string;
}

export function GenericVideoModal({ 
  isOpen, 
  onClose, 
  onContinue, 
  userEmail, 
  videoSrc, 
  storageKey, 
  title,
  subtitle = "Guarda il video introduttivo prima di iniziare",
  accentColor = "#00D1FF"
}: GenericVideoModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);
  
  // Swipe-to-close
  const dragY = useMotionValue(0);
  const dragOpacity = useTransform(dragY, [0, 200], [1, 0.5]);
  const SWIPE_THRESHOLD = 100;

  // Check se mostrare il video
  const shouldShowVideo = useCallback(() => {
    const isAdmin = userEmail && ADMIN_EMAILS.includes(userEmail.toLowerCase());
    if (isAdmin) {
      localStorage.removeItem(storageKey);
      return true;
    }
    return localStorage.getItem(storageKey) !== 'true';
  }, [userEmail, storageKey]);

  // Create portal container
  useEffect(() => {
    let container = document.getElementById('m1-generic-video-portal');
    if (!container) {
      container = document.createElement('div');
      container.id = 'm1-generic-video-portal';
      document.body.appendChild(container);
    }
    setPortalContainer(container);
  }, []);

  // Audio logic - copiata da HomeIntroVideo
  useEffect(() => {
    if (isOpen && videoRef.current) {
      const video = videoRef.current;
      
      const tryUnmute = () => {
        video.muted = false;
        video.play().then(() => {
          setAudioEnabled(true);
        }).catch(() => {
          video.muted = true;
          video.play().catch(() => {});
        });
      };
      
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

  const handleScreenTap = useCallback(() => {
    if (videoRef.current && !audioEnabled) {
      videoRef.current.muted = false;
      videoRef.current.play().catch(() => {});
      setAudioEnabled(true);
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
    localStorage.setItem(storageKey, 'true');
    handleClose();
  }, [handleClose, storageKey]);

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

  // Se dismissato, vai direttamente
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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99998]"
            onClick={handleClose}
          />
          
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-[99999] overflow-hidden"
            style={{
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
            <div 
              className="h-full rounded-t-3xl bg-[#0a0a0f]/95 backdrop-blur-xl border-t border-x overflow-hidden flex flex-col"
              style={{
                borderColor: `${accentColor}30`,
                boxShadow: `0 -10px 40px ${accentColor}15, 0 0 0 1px ${accentColor}10`,
              }}
            >
              <div className="flex justify-center pt-3 pb-2 cursor-grab flex-shrink-0">
                <div className="w-12 h-1.5 rounded-full bg-white/30" />
              </div>

              <div className="flex items-center justify-between px-4 pb-3 border-b border-white/10 flex-shrink-0">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-2 h-2 rounded-full"
                    style={{ background: accentColor, boxShadow: `0 0 10px ${accentColor}` }}
                  />
                  <h3 className="font-orbitron font-bold text-white text-[15px]">{title}</h3>
                </div>
                <button
                  onClick={handleClose}
                  className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center"
                >
                  <X className="w-4 h-4 text-white/70" />
                </button>
              </div>
              
              <p className="text-xs text-white/50 px-4 pt-2 flex-shrink-0">{subtitle}</p>

              <div 
                className="flex-1 px-3 py-2 overflow-hidden"
                onClick={handleScreenTap}
                onTouchStart={handleScreenTap}
              >
                <div className="relative rounded-2xl overflow-hidden bg-black h-full">
                  <video
                    ref={videoRef}
                    src={videoSrc}
                    className="w-full h-full object-cover"
                    playsInline
                    muted={!audioEnabled}
                    onEnded={handleVideoEnd}
                    onError={handleClose}
                  />
                  
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

              <div className="px-4 pb-4 flex-shrink-0">
                <motion.button
                  className="w-full py-4 px-6 rounded-xl font-orbitron font-bold text-sm uppercase tracking-wider"
                  style={{
                    background: `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}CC 100%)`,
                    color: 'white',
                    boxShadow: `0 0 20px ${accentColor}50`,
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

export default GenericVideoModal;

