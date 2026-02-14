/**
 * BriefingFlipOverlay - Modal fullscreen UNIFICATO per TUTTI i briefing video
 * Pattern M1U FlipOverlay: scale dal centro + backdrop blur + edge-to-edge
 * CTA: bianco opaco glass (no colori pieni)
 * Subtitles: EN/FR only for M1SSION HOME (IT = none)
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { X, VolumeX, Volume2 } from 'lucide-react';
import { getLocale } from '@/i18n/i18n';

const ADMIN_EMAILS = ['wikus77@hotmail.it'];

// FASE 3 — Testi autorizzati (IMMUTABILI) per sottotitoli M1SSION HOME
const SUBTITLES_EN = [
  'Agent, this is M1SSION.\nA limited-time hunt with real prizes.',
  'The mission lasts four weeks.\nOne main prize.\nNinety-nine secondary prizes.',
  'Your objective is to locate the final prize before anyone else.',
  'Use the map to explore.\nCollect clues.\nReduce the search area.',
  'When you are confident about the location,\nactivate Final Shot on the map.',
  'You have three attempts.',
];

const SUBTITLES_FR = [
  'Agent, ceci est M1SSION.\nUne chasse à durée limitée avec des récompenses réelles.',
  'La mission dure quatre semaines.\nUn prix principal.\nQuatre-vingt-dix-neuf prix secondaires.',
  'Votre objectif est de localiser le prix final avant tous les autres.',
  'Utilisez la carte pour explorer.\nObtenez des indices.\nRéduisez la zone de recherche.',
  "Lorsque vous êtes sûr de l'emplacement,\nactivez le Final Shot sur la carte.",
  "Vous avez trois tentatives.",
];

export interface BriefingFlipOverlayProps {
  open: boolean;
  onClose: () => void;
  onContinue: () => void;
  userEmail?: string;
  videoSrc: string;
  storageKey: string;
  title: string;
  subtitle?: string;
  /** Solo per M1SSION HOME: abilita sottotitoli EN/FR (IT = nessuno) */
  enableSubtitles?: boolean;
}

export const BriefingFlipOverlay: React.FC<BriefingFlipOverlayProps> = ({
  open,
  onClose,
  onContinue,
  userEmail,
  videoSrc,
  storageKey,
  title,
  subtitle = 'Guarda il video introduttivo prima di iniziare',
  enableSubtitles = false,
}) => {
  const [isClosing, setIsClosing] = useState(false);
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [subtitleIndex, setSubtitleIndex] = useState(-1);
  const [videoDuration, setVideoDuration] = useState(60);
  const videoRef = useRef<HTMLVideoElement>(null);

  const locale = getLocale();
  const showSubtitles = enableSubtitles && (locale === 'en' || locale === 'fr');
  const subtitleLines = locale === 'en' ? SUBTITLES_EN : SUBTITLES_FR;

  // Check se mostrare il video (admin sempre, altri controllano localStorage)
  const shouldShowVideo = useCallback(() => {
    const isAdmin = userEmail && ADMIN_EMAILS.includes(userEmail.toLowerCase());
    if (isAdmin) {
      localStorage.removeItem(storageKey);
      return true;
    }
    return localStorage.getItem(storageKey) !== 'true';
  }, [userEmail, storageKey]);

  // Create portal
  useEffect(() => {
    let container = document.getElementById('m1-briefing-portal');
    if (!container) {
      container = document.createElement('div');
      container.id = 'm1-briefing-portal';
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
        }).catch(() => {
          video.muted = true;
          video.play().catch(() => {});
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
    localStorage.setItem(storageKey, 'true');
    handleClose();
  }, [handleClose, storageKey]);

  // Video ended
  const handleVideoEnd = useCallback(() => {
    setTimeout(handleClose, 500);
  }, [handleClose]);

  // Reset subtitle when modal opens
  useEffect(() => {
    if (open) setSubtitleIndex(-1);
  }, [open]);

  // Subtitle sync: timeupdate + loadedmetadata
  useEffect(() => {
    if (!open || !showSubtitles || !videoRef.current) return;
    const video = videoRef.current;

    const onLoadedMetadata = () => {
      const d = video.duration;
      if (Number.isFinite(d) && d > 0) setVideoDuration(d);
    };

    const onTimeUpdate = () => {
      const t = video.currentTime;
      const d = Number.isFinite(video.duration) && video.duration > 0 ? video.duration : videoDuration;
      const segment = d / subtitleLines.length;
      const idx = Math.min(Math.floor(t / segment), subtitleLines.length - 1);
      setSubtitleIndex(t < 0.5 ? -1 : idx);
    };

    video.addEventListener('loadedmetadata', onLoadedMetadata);
    video.addEventListener('timeupdate', onTimeUpdate);

    if (video.readyState >= 1 && video.duration) {
      onLoadedMetadata();
    }

    return () => {
      video.removeEventListener('loadedmetadata', onLoadedMetadata);
      video.removeEventListener('timeupdate', onTimeUpdate);
    };
  }, [open, showSubtitles, videoDuration, subtitleLines.length]);

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
          {/* BACKDROP - vetro fumé con blur forte */}
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
              backgroundColor: 'rgba(0, 0, 0, 0.88)',
              backdropFilter: 'blur(40px) saturate(150%)',
              WebkitBackdropFilter: 'blur(40px) saturate(150%)',
              pointerEvents: 'auto',
            }}
          />

          {/* PANEL - TRUE FULLSCREEN */}
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
              inset: 0,
              zIndex: 99999,
              pointerEvents: 'auto',
              transformOrigin: '50% 50%',
              willChange: 'transform, opacity',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              background: '#000000',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header - ALTA LEGGIBILITÀ con sfondo solido scuro + glow titolo */}
            <div 
              className="flex items-center justify-between px-4 flex-shrink-0"
              style={{
                paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)',
                paddingBottom: '12px',
                background: 'rgba(0, 0, 0, 0.95)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <div className="flex items-center space-x-3">
                {/* Dot indicator con glow */}
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ 
                    background: '#00D1FF',
                    boxShadow: '0 0 8px #00D1FF, 0 0 16px rgba(0, 209, 255, 0.6)',
                  }}
                />
                {/* Titolo con alta leggibilità */}
                <h3 
                  className="font-orbitron font-bold text-base tracking-wider"
                  style={{ 
                    color: '#FFFFFF',
                    textShadow: '0 0 10px rgba(0, 209, 255, 0.5), 0 2px 4px rgba(0, 0, 0, 0.8)',
                  }}
                >
                  {title}
                </h3>
              </div>
              {/* X button - ALTA VISIBILITÀ */}
              <button
                onClick={handleClose}
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all"
                style={{ 
                  background: 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                }}
                aria-label="Chiudi"
              >
                <X className="w-5 h-5 text-white" strokeWidth={2.5} />
              </button>
            </div>
            
            {/* Subtitle */}
            <p 
              className="text-sm px-4 py-2 flex-shrink-0"
              style={{ 
                color: 'rgba(255, 255, 255, 0.7)',
                background: 'rgba(0, 0, 0, 0.8)',
              }}
            >
              {subtitle}
            </p>

            {/* Video Container - MASSIMIZZATO */}
            <div 
              className="flex-1 overflow-hidden min-h-0"
              onClick={handleScreenTap}
              onTouchStart={handleScreenTap}
            >
              <div className="relative bg-black h-full w-full">
                <video
                  ref={videoRef}
                  src={videoSrc}
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
                    style={{ background: 'rgba(0, 0, 0, 0.4)' }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <motion.div
                      className="flex flex-col items-center gap-2 px-5 py-3 rounded-2xl"
                      style={{ 
                        background: 'rgba(0, 0, 0, 0.7)',
                        backdropFilter: 'blur(8px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                      }}
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <VolumeX className="w-8 h-8 text-white" />
                      <span className="text-white text-xs font-medium">Tocca per l'audio</span>
                    </motion.div>
                  </motion.div>
                )}
                
                {/* Audio status badge */}
                <div className="absolute bottom-4 left-4">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ 
                      background: 'rgba(0, 0, 0, 0.6)',
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

                {/* Subtitles overlay - EN/FR only, bottom-center, safe-area */}
                {showSubtitles && subtitleIndex >= 0 && (
                  <motion.div
                    className="absolute left-4 right-4 flex justify-center"
                    style={{
                      bottom: 'calc(80px + env(safe-area-inset-bottom, 0px))',
                      pointerEvents: 'none',
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div
                      className="px-4 py-3 rounded-lg text-center max-w-lg"
                      style={{
                        background: 'rgba(0, 0, 0, 0.75)',
                        backdropFilter: 'blur(8px)',
                        color: '#FFFFFF',
                        fontSize: '14px',
                        lineHeight: 1.5,
                        textShadow: '0 1px 2px rgba(0,0,0,0.8)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                      }}
                    >
                      {subtitleLines[subtitleIndex]?.split('\n').map((line, i) => (
                        <p key={i} className="m-0" style={{ marginTop: i > 0 ? '0.25rem' : 0 }}>
                          {line}
                        </p>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Bottom Controls - sfondo solido + CTA BIANCO OPACO GLASS */}
            <div 
              className="px-4 pt-4 flex-shrink-0 space-y-3"
              style={{
                paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)',
                background: 'rgba(0, 0, 0, 0.95)',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              {/* CTA - BIANCO OPACO GLASS */}
              <motion.button
                className="w-full py-4 px-6 rounded-xl font-orbitron font-bold text-sm uppercase tracking-wider"
                style={{
                  background: 'rgba(255, 255, 255, 0.12)',
                  backdropFilter: 'blur(20px) saturate(150%)',
                  WebkitBackdropFilter: 'blur(20px) saturate(150%)',
                  color: '#FFFFFF',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  boxShadow: '0 4px 24px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleClose();
                }}
                whileHover={{ scale: 1.02, backgroundColor: 'rgba(255, 255, 255, 0.18)' }}
                whileTap={{ scale: 0.98 }}
              >
                CONTINUA →
              </motion.button>
              
              {/* Toggle - leggibile */}
              <button
                className="w-full text-xs py-2 transition-colors"
                style={{ 
                  color: 'rgba(255, 255, 255, 0.5)',
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

export default BriefingFlipOverlay;
