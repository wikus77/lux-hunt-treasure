// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// FINAL SHOOT PILL - IDENTICAL to other pills, 1 cyan orbiting dot
// NOTA: Componente COMPLETAMENTE INDIPENDENTE dalla logica Buzz Map

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { MapPillFlipOverlay } from '@/components/map/MapPillFlipOverlay';
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

  const [originRect, setOriginRect] = useState<DOMRect | null>(null);
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

  const handleClick = (e?: React.MouseEvent) => {
    if (state === 'won' || state === 'exhausted') return;
    if (e) setOriginRect(e.currentTarget.getBoundingClientRect());
    if (state === 'active') {
      deactivateFinalShoot();
    } else if (state === 'locked') {
      setShowInfoModal(true);
    } else {
      if (shouldShowVideo()) {
        setShowVideoModal(true);
      } else {
        activateFinalShoot();
      }
    }
  };

  // 🎬 Video Modal - MapPillFlipOverlay (NOTE-style)
  const videoModalContent = (
    <MapPillFlipOverlay open={showVideoModal} originRect={originRect} onClose={handleCloseVideo}>
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'transparent' }}>
        <div style={{
          flexShrink: 0,
          background: 'linear-gradient(180deg, rgba(239, 68, 68, 0.8) 0%, rgba(180, 50, 50, 0.6) 100%)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          paddingTop: 'calc(env(safe-area-inset-top, 47px) + 12px)',
          paddingBottom: '20px',
          paddingLeft: '16px',
          paddingRight: '16px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <button onClick={handleCloseVideo} style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <X style={{ width: '20px', height: '20px', color: '#FFFFFF' }} />
            </button>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <h1 style={{ color: '#FFFFFF', fontSize: '18px', fontWeight: 700, letterSpacing: '1px' }}>FINAL SHOT</h1>
            </div>
            <div style={{ width: '40px' }} />
          </div>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', textAlign: 'center' }}>Briefing: La tua ultima possibilità di vincere</p>
        </div>
        <div
          style={{ flex: 1, overflow: 'hidden', padding: '16px', display: 'flex', flexDirection: 'column' }}
          onClick={handleVideoTapForAudio}
          onTouchStart={handleVideoTapForAudio}
        >
          <div className="relative rounded-2xl overflow-hidden bg-black" style={{ flex: 1, minHeight: 0 }}>
            <video
              ref={videoRef}
              src={FINALSHOT_VIDEO}
              className="w-full h-full object-contain"
              playsInline
              muted={!videoAudioEnabled}
              onEnded={handleVideoEnd}
              onError={handleSkipVideo}
              disablePictureInPicture
              disableRemotePlayback
              controlsList="nodownload noremoteplayback"
            />
            {!videoAudioEnabled && (
              <motion.div className="absolute inset-0 flex items-center justify-center bg-black/30" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <motion.div className="flex flex-col items-center gap-2 px-4 py-3 rounded-xl bg-black/60 backdrop-blur-sm" animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
                  <VolumeX className="w-8 h-8 text-white/80" />
                  <span className="text-white/80 text-xs font-medium">Tocca per l&apos;audio</span>
                </motion.div>
              </motion.div>
            )}
            <div className="absolute bottom-3 left-3 w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center">
              {videoAudioEnabled ? <Volume2 className="w-5 h-5 text-red-400" /> : <VolumeX className="w-5 h-5 text-white/60" />}
            </div>
          </div>
        </div>
        <div style={{ flexShrink: 0, padding: '16px', paddingBottom: 'calc(env(safe-area-inset-bottom, 34px) + 16px)' }}>
          <motion.button
            className="w-full py-4 px-6 rounded-xl font-orbitron font-bold text-sm uppercase tracking-wider"
            style={{ background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)', color: 'white', boxShadow: '0 0 20px rgba(239, 68, 68, 0.5)', border: 'none', cursor: 'pointer' }}
            onClick={(e) => { e.stopPropagation(); handleSkipVideo(); }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            ATTIVA FINAL SHOT →
          </motion.button>
          <button className="w-full mt-2 text-xs text-white/40 hover:text-white/60 transition-colors py-2" style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); handleDismissVideo(); }}>
            Non mostrare più questo video
          </button>
        </div>
      </div>
    </MapPillFlipOverlay>
  );

  // 📋 Info Modal - MapPillFlipOverlay (NOTE-style)
  const infoModalContent = (
    <MapPillFlipOverlay open={showInfoModal} originRect={originRect} onClose={() => setShowInfoModal(false)}>
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'transparent' }}>
        <div style={{
          flexShrink: 0,
          background: 'linear-gradient(180deg, rgba(0, 209, 255, 0.8) 0%, rgba(0, 100, 150, 0.6) 100%)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          paddingTop: 'calc(env(safe-area-inset-top, 47px) + 12px)',
          paddingBottom: '20px',
          paddingLeft: '16px',
          paddingRight: '16px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <button onClick={() => setShowInfoModal(false)} style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.15)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <X style={{ width: '20px', height: '20px', color: '#FFFFFF' }} />
            </button>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <h1 style={{ color: '#FFFFFF', fontSize: '18px', fontWeight: 700, letterSpacing: '1px' }}>FINAL SHOT</h1>
            </div>
            <div style={{ width: '40px' }} />
          </div>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', textAlign: 'center' }}>{t('mapPills.finalShot.subtitle')}</p>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px', paddingBottom: 'calc(env(safe-area-inset-bottom, 34px) + 20px)', WebkitOverflowScrolling: 'touch' }} className="space-y-3">
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
        <div style={{ flexShrink: 0, padding: '16px', paddingBottom: 'calc(env(safe-area-inset-bottom, 34px) + 16px)', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <button onClick={() => setShowInfoModal(false)} style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', background: 'linear-gradient(135deg, rgba(0,209,255,0.2), rgba(139,92,246,0.2))', border: '1px solid rgba(0,209,255,0.3)', color: '#fff', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
            {t('mapPills.finalShot.gotIt')}
          </button>
        </div>
      </div>
    </MapPillFlipOverlay>
  );

  return (
    <>
      {/* Final Shoot Pill - IDENTICAL to other pills (pill-orb class) */}
      <motion.button
        className={`pill-orb final-shoot-pill final-shoot-pill--${state}`}
        onClick={(e) => handleClick(e)}
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

      {videoModalContent}
      {infoModalContent}
    </>
  );
};

export default FinalShootPill;
