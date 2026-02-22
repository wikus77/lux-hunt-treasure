/**
 * BriefingFlipOverlay - Modal fullscreen UNIFICATO per TUTTI i briefing video
 * Pattern M1U FlipOverlay: scale dal centro + backdrop blur + edge-to-edge
 * CTA: bianco opaco glass (no colori pieni)
 * Subtitles: EN/FR only for M1SSION HOME and BUZZ MAP (IT = none)
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { X, VolumeX, Volume2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
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

// FASE 3 — Testi autorizzati (IMMUTABILI) per sottotitoli BUZZ MAP
const SUBTITLES_BUZZMAP_EN = [
  'This is the M1SSION map.\nThe final prize is hidden here.\nYou cannot see it.\nYou must discover it.',
  'Press the button to generate the area\nwhere the final prize is located.',
  'The map will generate search areas.',
  'Search and find the green markers.\nThey are real, instant prizes.',
  'They are hidden,\nbut you can find them.',
  'If you find them,\nthey are yours immediately.',
  'Each press of the Buzz button\nreduces the search area of the final prize.',
];

const SUBTITLES_BUZZMAP_FR = [
  "Voici la carte de M1SSION.\nLe prix final est caché ici.\nIl n'est pas visible.\nVous devez le découvrir.",
  "Appuyez sur le bouton pour générer la zone\noù se trouve le prix final.",
  'La carte génère des zones de recherche.',
  'Cherchez et trouvez les marqueurs verts.\nCe sont des récompenses réelles et immédiates.',
  'Ils sont cachés,\nmais vous pouvez les trouver.',
  'Si vous les trouvez,\nils sont à vous immédiatement.',
  'Chaque pression du bouton Buzz\nréduit la zone de recherche du prix final.',
];

// FIX: Subtitles for Buzz, AION, Classifica, Notifiche (EN/FR)
const SUBTITLES_BUZZ_EN = [
  'BUZZ is your scan action.\nIt reveals clues and narrows the search.',
  'Each BUZZ costs energy.\nUse it wisely on the map.',
  'Unlock new areas.\nFind green markers for instant rewards.',
  'The more you scan,\nthe closer you get to the final prize.',
  'BUZZ from anywhere.\nThe map is your control center.',
];
const SUBTITLES_BUZZ_FR = [
  'BUZZ est votre action de scan.\nIl révèle des indices et affine la recherche.',
  'Chaque BUZZ coûte de l\'énergie.\nUtilisez-le avec sagesse sur la carte.',
  'Débloquez de nouvelles zones.\nTrouvez les marqueurs verts pour des récompenses instantanées.',
  'Plus vous scannez,\nplus vous vous rapprochez du prix final.',
  'BUZZ de partout.\nLa carte est votre centre de contrôle.',
];

const SUBTITLES_AION_EN = [
  'AION is your AI oracle.\nPatterns and energy reveal the path.',
  'Ask questions.\nGet strategic insights.',
  'The oracle speaks in probabilities.\nInterpret wisely.',
  'AION sees what you cannot.\nTrust the patterns.',
  'Your intelligence partner.\nAlways available.',
];
const SUBTITLES_AION_FR = [
  'AION est votre oracle IA.\nLes motifs et l\'énergie révèlent le chemin.',
  'Posez des questions.\nObtenez des insights stratégiques.',
  'L\'oracle parle en probabilités.\nInterprétez avec sagesse.',
  'AION voit ce que vous ne pouvez pas.\nFaites confiance aux motifs.',
  'Votre partenaire intelligence.\nToujours disponible.',
];

const SUBTITLES_CLASSIFICA_EN = [
  'The leaderboard ranks all agents.\nClimb to the top.',
  'Points come from clues,\nPulse energy and streaks.',
  'See who is ahead.\nOvertake your rivals.',
  'Top 10 get special recognition.\nAim for the podium.',
  'Real-time updates.\nThe race never stops.',
];
const SUBTITLES_CLASSIFICA_FR = [
  'Le classement range tous les agents.\nGrimpez au sommet.',
  'Les points viennent des indices,\n de l\'énergie Pulse et des streaks.',
  'Voyez qui est devant.\nDépassez vos rivaux.',
  'Le Top 10 a une reconnaissance spéciale.\nVisez le podium.',
  'Mises à jour en temps réel.\nLa course ne s\'arrête jamais.',
];

const SUBTITLES_NOTIFICHE_EN = [
  'Notifications keep you in the mission.\nNever miss a clue.',
  'Alerts for rewards, rivals, and events.\nStay informed.',
  'Enable push for real-time updates.\nCustomize your alerts.',
  'Your mission, your rhythm.\nWe notify when it matters.',
  'Turn them on.\nStay ahead.',
];
const SUBTITLES_NOTIFICHE_FR = [
  'Les notifications vous gardent en mission.\nNe manquez aucun indice.',
  'Alertes pour récompenses, rivaux et événements.\nRestez informé.',
  'Activez les push pour des mises à jour en temps réel.\nPersonnalisez vos alertes.',
  'Votre mission, votre rythme.\nNous notifions quand ça compte.',
  'Activez-les.\nRestez en avance.',
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
  /** 'home' | 'buzz_map' | 'buzz' | 'aion' | 'classifica' | 'notifiche' = sottotitoli EN/FR (IT = nessuno); undefined = nessun sottotitolo */
  enableSubtitles?: 'home' | 'buzz_map' | 'buzz' | 'aion' | 'classifica' | 'notifiche';
}

export const BriefingFlipOverlay: React.FC<BriefingFlipOverlayProps> = ({
  open,
  onClose,
  onContinue,
  userEmail,
  videoSrc,
  storageKey,
  title,
  subtitle,
  enableSubtitles,
}) => {
  const { t } = useTranslation();
  const [isClosing, setIsClosing] = useState(false);
  const subtitleDisplay = subtitle ?? t('tutorial_default_subtitle');
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [subtitleIndex, setSubtitleIndex] = useState(-1);
  const [videoDuration, setVideoDuration] = useState(60);
  const videoRef = useRef<HTMLVideoElement>(null);

  const locale = getLocale();
  const showSubtitles = !!enableSubtitles && (locale === 'en' || locale === 'fr');
  const getSubtitleLines = () => {
    if (!enableSubtitles) return SUBTITLES_EN;
    const isEn = locale === 'en';
    switch (enableSubtitles) {
      case 'buzz_map': return isEn ? SUBTITLES_BUZZMAP_EN : SUBTITLES_BUZZMAP_FR;
      case 'buzz': return isEn ? SUBTITLES_BUZZ_EN : SUBTITLES_BUZZ_FR;
      case 'aion': return isEn ? SUBTITLES_AION_EN : SUBTITLES_AION_FR;
      case 'classifica': return isEn ? SUBTITLES_CLASSIFICA_EN : SUBTITLES_CLASSIFICA_FR;
      case 'notifiche': return isEn ? SUBTITLES_NOTIFICHE_EN : SUBTITLES_NOTIFICHE_FR;
      case 'home':
      default: return isEn ? SUBTITLES_EN : SUBTITLES_FR;
    }
  };
  const subtitleLines = getSubtitleLines();

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

  const safeSet = useCallback((k: string, v: string) => {
    try { if (typeof localStorage !== 'undefined') localStorage.setItem(k, v); } catch {}
  }, []);

  // Dismiss forever — commit setItem before close to avoid unmount race (e.g. iOS WKWebView)
  const handleDismissForever = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    safeSet(storageKey, 'true');
    Promise.resolve().then(() => {
      handleClose();
    });
  }, [handleClose, storageKey, safeSet]);

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
                aria-label={t('tutorial_close')}
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
              {subtitleDisplay}
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
                      <span className="text-white text-xs font-medium">{t('tutorial_tap_audio')}</span>
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
                {t('tutorial_continue')}
              </motion.button>
              
              {/* Toggle - leggibile */}
              <button
                className="w-full text-xs py-2 transition-colors"
                style={{ 
                  color: 'rgba(255, 255, 255, 0.5)',
                }}
                onClick={handleDismissForever}
              >
                {t('tutorial_dont_show_again')}
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
