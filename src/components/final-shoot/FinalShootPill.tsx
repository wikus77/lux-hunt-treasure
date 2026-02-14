// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// FINAL SHOOT PILL - IDENTICAL to other pills, 1 cyan orbiting dot
// NOTA: Componente COMPLETAMENTE INDIPENDENTE dalla logica Buzz Map

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Crosshair, Target, Trophy, AlertCircle, Lock, X, Zap, VolumeX, Volume2 } from 'lucide-react';
import { useFinalShootContext } from './FinalShootContext';
import '@/features/m1u/m1u-ui.css';
import './FinalShootPill.css';

// 🎬 Video e Audio paths
const FINALSHOT_VIDEO = '/assets/video/FINALSHOT-BRIF-VIDEO.mp4';
const HEARTBEAT_AUDIO = '/assets/audio/HMNHart-heart_beats-Elevenlabs.mp3';
const VIDEO_STORAGE_KEY = 'm1_finalshot_video_dismissed';
const ADMIN_EMAILS = ['wikus77@hotmail.it'];

const FinalShootPill: React.FC = () => {
  const { t } = useTranslation();
  const {
    isAvailable,
    isActive,
    isLocked,
    remainingAttempts,
    daysRemaining,
    totalMissionDays,
    hasWon,
    isLoading,
    isTestMode,
    activateFinalShoot,
    deactivateFinalShoot,
    pricing, // 🎯 PLUS/ELITE pricing
  } = useFinalShootContext();
  
  // 🎯 PLUS/ELITE: Format next attempt cost
  const getNextAttemptLabel = () => {
    if (!pricing) return `${remainingAttempts} tentativi`;
    if (pricing.tier === 'blocked') return 'Limite raggiunto';
    if (pricing.tier === 'free') return `${pricing.free_remaining} gratuiti`;
    if (pricing.tier === 'plus') return `${pricing.cost_m1u} M1U`;
    if (pricing.tier === 'elite') return `${pricing.cost_m1u} M1U (Elite)`;
    return `${remainingAttempts} tentativi`;
  };
  
  const getTierBadge = () => {
    if (!pricing || pricing.tier === 'free') return null;
    if (pricing.tier === 'plus') return { label: 'PLUS', color: 'bg-amber-500' };
    if (pricing.tier === 'elite') return { label: 'ELITE', color: 'bg-purple-500' };
    return null;
  };

  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [videoAudioEnabled, setVideoAudioEnabled] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const heartbeatAudioRef = useRef<HTMLAudioElement | null>(null);
  
  // 🎵 Gestione audio battito cardiaco quando Final Shot è attivo
  useEffect(() => {
    if (isActive) {
      // Avvia audio battito cardiaco
      if (!heartbeatAudioRef.current) {
        heartbeatAudioRef.current = new Audio(HEARTBEAT_AUDIO);
        heartbeatAudioRef.current.loop = true;
        heartbeatAudioRef.current.volume = 0.5;
      }
      heartbeatAudioRef.current.play().catch(err => {
        console.log('[FinalShootPill] Heartbeat audio play failed:', err);
      });
    } else {
      // Ferma audio
      if (heartbeatAudioRef.current) {
        heartbeatAudioRef.current.pause();
        heartbeatAudioRef.current.currentTime = 0;
      }
    }
    
    return () => {
      if (heartbeatAudioRef.current) {
        heartbeatAudioRef.current.pause();
        heartbeatAudioRef.current.currentTime = 0;
      }
    };
  }, [isActive]);
  
  // 🎬 Check se mostrare il video
  const shouldShowVideo = useCallback((userEmail?: string) => {
    const isAdmin = userEmail && ADMIN_EMAILS.includes(userEmail.toLowerCase());
    if (isAdmin) {
      localStorage.removeItem(VIDEO_STORAGE_KEY);
      return true;
    }
    return localStorage.getItem(VIDEO_STORAGE_KEY) !== 'true';
  }, []);
  
  // 🎬 Tap per attivare audio video
  const handleVideoTapForAudio = useCallback(() => {
    if (videoRef.current && !videoAudioEnabled) {
      videoRef.current.muted = false;
      videoRef.current.play().catch(() => {});
      setVideoAudioEnabled(true);
    }
  }, [videoAudioEnabled]);
  
  // 🎬 Video terminato
  const handleVideoEnd = useCallback(() => {
    setShowVideoModal(false);
    setVideoAudioEnabled(false);
    activateFinalShoot();
  }, [activateFinalShoot]);
  
  // 🎬 Skip video
  const handleSkipVideo = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
    setShowVideoModal(false);
    setVideoAudioEnabled(false);
    activateFinalShoot();
  }, [activateFinalShoot]);
  
  // 🎬 Non mostrare più
  const handleDismissVideo = useCallback(() => {
    localStorage.setItem(VIDEO_STORAGE_KEY, 'true');
    if (videoRef.current) {
      videoRef.current.pause();
    }
    setShowVideoModal(false);
    setVideoAudioEnabled(false);
    activateFinalShoot();
  }, [activateFinalShoot]);
  
  // 🎬 Chiudi video senza attivare
  const handleCloseVideo = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
    setShowVideoModal(false);
    setVideoAudioEnabled(false);
  }, []);
  
  // 🎬 Avvia video quando si apre il modal
  useEffect(() => {
    if (showVideoModal && videoRef.current) {
      videoRef.current.muted = false;
      videoRef.current.play().then(() => {
        setVideoAudioEnabled(true);
      }).catch(() => {
        if (videoRef.current) {
          videoRef.current.muted = true;
          videoRef.current.play().catch(() => {});
        }
      });
    }
  }, [showVideoModal]);

  // Don't render while loading
  if (isLoading) {
    return null;
  }

  // Calculate days until Final Shoot is available
  const daysUntilAvailable = Math.max(0, daysRemaining - 7);

  // Determine state
  const getState = () => {
    if (hasWon) return 'won';
    if (isAvailable && remainingAttempts <= 0) return 'exhausted';
    if (isActive) return 'active';
    if (isLocked) return 'locked';
    return 'available';
  };

  const state = getState();

  // Icon based on state
  const getIcon = () => {
    switch (state) {
      case 'won': return <Trophy className="w-5 h-5 text-yellow-400" />;
      case 'exhausted': return <AlertCircle className="w-5 h-5 text-gray-400" />;
      case 'active': return <Target className="w-5 h-5 text-red-400" />;
      case 'locked': return <Lock className="w-5 h-5 text-gray-400" />;
      default: return <Crosshair className="w-5 h-5 text-cyan-400" />;
    }
  };

  const handleClick = () => {
    if (state === 'won' || state === 'exhausted') return;
    if (state === 'active') {
      deactivateFinalShoot();
    } else if (state === 'locked') {
      setShowInfoModal(true);
    } else {
      // State è 'available' - mostra video briefing se non dismissato
      if (shouldShowVideo()) {
        setShowVideoModal(true);
      } else {
        activateFinalShoot();
      }
    }
  };

  // 🎬 Video Modal Content - renderizzato con createPortal
  const videoModalContent = (
    <AnimatePresence>
      {showVideoModal && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            style={{ zIndex: 999998 }}
            onClick={handleCloseVideo}
          />
          
          {/* Modal Container Espandibile */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 overflow-hidden"
            style={{
              zIndex: 999999,
              top: 'calc(50px + env(safe-area-inset-top, 0px))',
              paddingBottom: 'env(safe-area-inset-bottom, 0px)',
            }}
          >
            <div 
              className="h-full rounded-t-3xl bg-[#0a0a0f]/95 backdrop-blur-xl border-t border-x overflow-hidden flex flex-col"
              style={{
                borderColor: 'rgba(239, 68, 68, 0.3)',
                boxShadow: '0 -10px 40px rgba(239, 68, 68, 0.15), 0 0 0 1px rgba(239, 68, 68, 0.1)',
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
                    className="w-2 h-2 rounded-full animate-pulse"
                    style={{ background: '#EF4444', boxShadow: '0 0 10px #EF4444' }}
                  />
                  <h3 className="font-orbitron font-bold text-white text-[15px]">FINAL SHOT</h3>
                </div>
                <button
                  onClick={handleCloseVideo}
                  className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center"
                >
                  <X className="w-4 h-4 text-white/70" />
                </button>
              </div>
              
              <p className="text-xs text-white/50 px-4 pt-2 flex-shrink-0">Briefing: La tua ultima possibilità di vincere</p>

              {/* Video Container */}
              <div 
                className="flex-1 px-3 py-2 overflow-hidden"
                onClick={handleVideoTapForAudio}
                onTouchStart={handleVideoTapForAudio}
              >
                <div className="relative rounded-2xl overflow-hidden bg-black h-full">
                  <video
                    ref={videoRef}
                    src={FINALSHOT_VIDEO}
                    className="w-full h-full object-contain"
                    playsInline
                    muted={!videoAudioEnabled}
                    onEnded={handleVideoEnd}
                    onError={handleSkipVideo}
                    // 🛡️ Impedisce attivazione Dynamic Island su iOS
                    disablePictureInPicture
                    disableRemotePlayback
                    controlsList="nodownload noremoteplayback"
                  />
                  
                  {/* Audio hint */}
                  {!videoAudioEnabled && (
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
                  
                  {/* Audio indicator */}
                  <div className="absolute bottom-3 left-3">
                    <div className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center">
                      {videoAudioEnabled ? (
                        <Volume2 className="w-5 h-5 text-red-400" />
                      ) : (
                        <VolumeX className="w-5 h-5 text-white/60" />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="px-4 pb-4 flex-shrink-0">
                <motion.button
                  className="w-full py-4 px-6 rounded-xl font-orbitron font-bold text-sm uppercase tracking-wider"
                  style={{
                    background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                    color: 'white',
                    boxShadow: '0 0 20px rgba(239, 68, 68, 0.5)',
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSkipVideo();
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  ATTIVA FINAL SHOT →
                </motion.button>
                
                <button
                  className="w-full mt-2 text-xs text-white/40 hover:text-white/60 transition-colors py-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDismissVideo();
                  }}
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

  // 📋 Info Modal Content - renderizzato con createPortal
  const infoModalContent = (
    <AnimatePresence>
      {showInfoModal && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
            style={{ zIndex: 999998 }}
            onClick={() => setShowInfoModal(false)}
          />
          
          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed left-4 right-4 overflow-hidden"
            style={{ 
              zIndex: 999999,
              top: 'calc(60px + env(safe-area-inset-top, 0px))',
              bottom: 'calc(90px + env(safe-area-inset-bottom, 0px))',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div 
              className="h-full w-full max-w-lg mx-auto rounded-2xl bg-gradient-to-b from-gray-900 via-gray-900 to-black border border-cyan-500/30 shadow-2xl overflow-hidden flex flex-col"
              style={{ boxShadow: '0 0 60px rgba(0, 209, 255, 0.3), 0 25px 50px rgba(0, 0, 0, 0.5)' }}
            >
              {/* Header fisso */}
              <div className="flex-shrink-0 p-4 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-400/30">
                      <Crosshair className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white font-orbitron">
                        FINAL SHOT
                      </h2>
                      <p className="text-xs text-cyan-400">{t('mapPills.finalShot.subtitle')}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowInfoModal(false)}
                    className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <X className="w-5 h-5 text-white/60" />
                  </button>
                </div>
              </div>

              {/* Contenuto scrollabile */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <h3 className="font-bold text-white mb-2 flex items-center gap-2 text-sm">
                    <Target className="w-4 h-4 text-pink-400" />
                    {t('mapPills.finalShot.whatIs')}
                  </h3>
                  <p className="text-xs text-white/70 leading-relaxed">
                    {t('mapPills.finalShot.whatIsDesc')}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <h3 className="font-bold text-white mb-2 flex items-center gap-2 text-sm">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    {t('mapPills.finalShot.howItWorks')}
                  </h3>
                  <ul className="text-xs text-white/70 space-y-1.5">
                    <li className="flex items-start gap-2">
                      <span className="text-cyan-400 font-bold">1.</span>
                      {t('mapPills.finalShot.bullet1')}
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-cyan-400 font-bold">2.</span>
                      {t('mapPills.finalShot.bullet2')}
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-cyan-400 font-bold">3.</span>
                      {t('mapPills.finalShot.bullet3')}
                    </li>
                  </ul>
                </div>

                {/* 🎯 PLUS/ELITE: Updated pricing info */}
                <div className="p-3 rounded-xl bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-400/20">
                  <h3 className="font-bold text-red-300 mb-2 flex items-center gap-2 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {t('mapPills.finalShot.attemptsAvailable')}
                  </h3>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between text-white/80">
                      <span>🆓 {t('mapPills.finalShot.free')}</span>
                      <span className="font-bold text-green-400">{t('mapPills.finalShot.freeValue')}</span>
                    </div>
                    <div className="flex justify-between text-white/80">
                      <span>⭐ {t('mapPills.finalShot.plus')}</span>
                      <span className="font-bold text-amber-400">{t('mapPills.finalShot.plusValue')}</span>
                    </div>
                    <div className="flex justify-between text-white/80">
                      <span>💎 {t('mapPills.finalShot.elite')}</span>
                      <span className="font-bold text-purple-400">{t('mapPills.finalShot.eliteValue')}</span>
                    </div>
                    <div className="pt-1 border-t border-white/10 flex justify-between text-white/60">
                      <span>{t('mapPills.finalShot.totalMax')}</span>
                      <span className="font-bold text-cyan-400">{t('mapPills.finalShot.totalValue')}</span>
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div className="p-3 rounded-xl bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-400/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-white/60">{t('mapPills.finalShot.activatesIn')}</div>
                      <div className="text-xl font-bold text-cyan-400 font-orbitron">
                        {daysUntilAvailable} {t('mapPills.finalShot.days')}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-white/60">{t('mapPills.finalShot.missionDays')}</div>
                      <div className="text-base font-bold text-white">
                        {totalMissionDays - daysRemaining}/{totalMissionDays}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer fisso */}
              <div className="flex-shrink-0 p-4 border-t border-white/10">
                <button
                  onClick={() => setShowInfoModal(false)}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-400/30 text-white font-bold hover:border-cyan-400/50 transition-colors text-sm"
                >
                  {t('mapPills.finalShot.gotIt')}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return (
    <>
      {/* Final Shoot Pill - IDENTICAL to other pills (pill-orb class) */}
      <motion.button
        className={`pill-orb final-shoot-pill final-shoot-pill--${state}`}
        onClick={handleClick}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        aria-label="Final Shoot"
      >
        {/* Main Icon */}
        {getIcon()}
        
        {/* Single orbiting dot - SAME as other pills */}
        <span className="dot" />

        {/* TEST badge */}
        {isTestMode && (
          <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-[8px] bg-yellow-500 rounded-full text-black font-bold">
            TEST
          </span>
        )}

        {/* Won crown */}
        {state === 'won' && (
          <span className="absolute -top-3 text-sm">👑</span>
        )}
      </motion.button>

      {/* 🎬 Video Briefing Modal - renderizzato nel body con createPortal */}
      {createPortal(videoModalContent, document.body)}
      
      {/* 📋 Info Modal - renderizzato nel body con createPortal */}
      {createPortal(infoModalContent, document.body)}
    </>
  );
};

export default FinalShootPill;
