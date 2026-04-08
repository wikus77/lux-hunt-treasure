/**
 * M1SSION™ — Rank Up Video Modal
 * Status / ascension moment — presentation only (logic unchanged).
 * © 2026 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Play } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { HierarchyLevel } from '@/config/hierarchyConfig';
import { isHapticsAvailable, hapticLight, hapticHeavy } from '@/utils/haptics';
import { playRankUpSound } from '@/utils/victoryRewardSounds';
import { V3_EASE, V3_ENTER_S } from '@/features/victoryPresentation/victoryMotionV3';

interface RankUpVideoModalProps {
  isOpen: boolean;
  newRank: HierarchyLevel;
  onComplete: () => void;
}

const ENTRY_DURATION = 0.55;
const HOLD_BEFORE_CTA_MS = 1850;
const BURST_DELAY_MS = 400;
const POST_ANIM_HOLD_MS = 5500;

function readReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;
  } catch {
    return false;
  }
}

export const RankUpVideoModal: React.FC<RankUpVideoModalProps> = ({
  isOpen,
  newRank,
  onComplete,
}) => {
  const { t, i18n } = useTranslation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoEnded, setVideoEnded] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [videoStarted, setVideoStarted] = useState(false);
  const [reducedMotion] = useState(readReducedMotion);
  const [ctaUnlocked, setCtaUnlocked] = useState(false);
  const [showBurst, setShowBurst] = useState(false);

  const rankDisplayName = i18n.language?.startsWith('it') ? newRank.nameIt : newRank.name;

  useEffect(() => {
    if (isOpen && videoStarted) {
      document.body.style.overflow = 'hidden';

      const preventScroll = (e: Event) => {
        e.preventDefault();
      };

      document.addEventListener('touchmove', preventScroll, { passive: false });
      document.addEventListener('wheel', preventScroll, { passive: false });

      return () => {
        document.body.style.overflow = '';
        document.removeEventListener('touchmove', preventScroll);
        document.removeEventListener('wheel', preventScroll);
      };
    }
  }, [isOpen, videoStarted]);

  useEffect(() => {
    if (!isOpen) return;
    setVideoEnded(false);
    setShowAnimation(false);
    setFadeOut(false);
    setVideoError(false);
    setVideoStarted(false);
    setCtaUnlocked(false);
    setShowBurst(false);
  }, [isOpen]);

  // Entry: light haptic → burst: medium + flash (one sequence per open)
  useEffect(() => {
    if (!isOpen || videoStarted) return;
    let cancelled = false;

    if (!reducedMotion && isHapticsAvailable()) {
      try {
        hapticLight();
      } catch {
        /* dev web */
      }
    }

    if (reducedMotion) {
      playRankUpSound();
    }

    const burstTimer = window.setTimeout(() => {
      if (cancelled || reducedMotion) return;
      setShowBurst(true);
      playRankUpSound();
      if (isHapticsAvailable()) {
        try {
          hapticHeavy();
        } catch {
          /* dev web */
        }
      }
      window.setTimeout(() => {
        if (!cancelled) setShowBurst(false);
      }, 180);
    }, BURST_DELAY_MS);

    const unlockTimer = window.setTimeout(() => {
      if (!cancelled) setCtaUnlocked(true);
    }, HOLD_BEFORE_CTA_MS);

    return () => {
      cancelled = true;
      clearTimeout(burstTimer);
      clearTimeout(unlockTimer);
    };
  }, [isOpen, videoStarted, reducedMotion]);

  const handleRankUp = useCallback(() => {
    if (!ctaUnlocked) return;
    setVideoStarted(true);

    setTimeout(() => {
      if (videoRef.current && newRank.videoPath) {
        videoRef.current.muted = false;
        videoRef.current.volume = 1;
        videoRef.current.play().catch(() => {
          setVideoError(true);
        });
      } else if (!newRank.videoPath) {
        setVideoError(true);
      }
    }, 100);
  }, [newRank.videoPath, ctaUnlocked]);

  const handleVideoEnd = useCallback(() => {
    setVideoEnded(true);
    setShowAnimation(true);

    setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => {
        onComplete();
      }, 1000);
    }, POST_ANIM_HOLD_MS);
  }, [onComplete]);

  useEffect(() => {
    if (isOpen && videoStarted && (!newRank.videoPath || videoError)) {
      setVideoEnded(true);
      setShowAnimation(true);

      setTimeout(() => {
        setFadeOut(true);
        setTimeout(() => {
          onComplete();
        }, 1000);
      }, POST_ANIM_HOLD_MS);
    }
  }, [isOpen, videoStarted, newRank.videoPath, videoError, onComplete]);

  if (!isOpen) return null;

  const entryTransition = reducedMotion
    ? { duration: 0.2 }
    : { duration: Math.max(ENTRY_DURATION, V3_ENTER_S), ease: V3_EASE };

  const modalContent = (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 flex items-center justify-center overflow-hidden"
        style={{
          zIndex: 999999999,
          background: 'radial-gradient(ellipse 120% 80% at 50% 40%, rgba(20,20,28,0.97) 0%, #000 75%)',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: fadeOut ? 0 : 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: fadeOut ? 0.92 : 0.4, ease: V3_EASE }}
      >
        {/* Ambient rank glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(circle at 50% 42%, ${newRank.color}22 0%, transparent 55%)`,
            opacity: 0.9,
          }}
        />

        {showBurst && !reducedMotion && (
          <motion.div
            className="absolute inset-0 pointer-events-none z-[60]"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.35, 0] }}
            transition={{ duration: 0.22 }}
            style={{
              background: `radial-gradient(circle at 50% 45%, ${newRank.color} 0%, transparent 50%)`,
            }}
          />
        )}

        {!videoStarted && (
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center z-50 px-6"
            initial={{ opacity: 0, scale: reducedMotion ? 1 : 0.88 }}
            animate={{ opacity: 1, scale: reducedMotion ? 1 : [0.88, 1.06, 1] }}
            transition={entryTransition}
          >
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `radial-gradient(circle at center, ${newRank.color}32 0%, #000 78%)`,
              }}
            />

            {!reducedMotion && (
              <motion.div
                className="absolute inset-0 z-[4] pointer-events-none backdrop-blur-md bg-black/25"
                initial={{ opacity: 1 }}
                animate={{ opacity: 0 }}
                transition={{ duration: ENTRY_DURATION, ease: [0.22, 1, 0.36, 1] }}
              />
            )}

            <motion.div
              className="absolute w-[min(92vw,440px)] h-[min(92vw,440px)] rounded-full pointer-events-none z-[5]"
              style={{
                border: `2px solid ${newRank.color}50`,
                boxShadow: `0 0 100px ${newRank.color}44, inset 0 0 80px ${newRank.color}18`,
              }}
              initial={{ opacity: 0, scale: 0.82 }}
              animate={
                reducedMotion
                  ? { opacity: 0.45, scale: 1 }
                  : {
                      opacity: [0.4, 0.75, 0.5],
                      scale: [0.88, 1.08, 1],
                    }
              }
              transition={{
                duration: reducedMotion ? 0.2 : 2.8,
                repeat: reducedMotion ? 0 : Infinity,
                repeatType: 'reverse',
                ease: 'easeInOut',
              }}
            />

            <motion.div
              className="text-[min(22vw,96px)] sm:text-[96px] mb-5 relative z-10 leading-none"
              initial={reducedMotion ? { scale: 1 } : { scale: 0.8, opacity: 0.9 }}
              animate={
                reducedMotion
                  ? { scale: 1 }
                  : {
                      scale: [0.85, 1.1, 1],
                      opacity: 1,
                    }
              }
              transition={{
                duration: reducedMotion ? 0.15 : 1.6,
                repeat: reducedMotion ? 0 : Infinity,
                repeatType: 'reverse',
                ease: 'easeInOut',
              }}
              style={{
                filter: `drop-shadow(0 0 28px ${newRank.color}) drop-shadow(0 0 64px ${newRank.color}99)`,
              }}
            >
              {newRank.icon}
            </motion.div>

            <motion.p
              className="relative z-10 text-center text-[10px] sm:text-[11px] font-bold tracking-[0.5em] uppercase text-white/45 mb-3 px-2"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: reducedMotion ? 0 : 0.06, duration: 0.38, ease: V3_EASE }}
            >
              {t('rank_up_modal.ascension_kicker', { defaultValue: 'ELITE CLEARANCE' })}
            </motion.p>

            <motion.h1
              className="relative z-10 text-center font-black uppercase tracking-[0.28em] text-white mb-2 px-2"
              style={{
                fontSize: 'clamp(1.35rem, 5vw, 1.85rem)',
                textShadow: `0 0 40px ${newRank.color}66`,
              }}
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: reducedMotion ? 0 : 0.14, duration: 0.44, ease: V3_EASE }}
            >
              {t('rank_up_modal.title')}
            </motion.h1>

            <motion.p
              className="relative z-10 text-center text-white/88 font-semibold tracking-wide mb-3 px-2 max-w-md"
              style={{ fontSize: 'clamp(1rem, 3.8vw, 1.2rem)' }}
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: reducedMotion ? 0 : 0.2, duration: 0.4 }}
            >
              {t('rank_up_modal.subtitle_now', { rank: rankDisplayName })}
            </motion.p>

            <motion.p
              className="relative z-10 text-center text-white/55 text-sm sm:text-base max-w-sm mb-10 px-4 leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: reducedMotion ? 0 : 0.32, duration: 0.45 }}
            >
              {t('rank_up_modal.body')}
            </motion.p>

            <motion.button
              type="button"
              onClick={handleRankUp}
              disabled={!ctaUnlocked}
              aria-disabled={!ctaUnlocked}
              className="relative z-50 flex items-center justify-center gap-3 min-w-[min(92vw,340px)] px-10 py-5 rounded-2xl font-black uppercase tracking-[0.12em] text-base sm:text-lg cursor-pointer disabled:cursor-not-allowed disabled:opacity-35"
              style={{
                background: `linear-gradient(145deg, ${newRank.color}, ${newRank.color}bb)`,
                color: '#0a0a0a',
                boxShadow: ctaUnlocked
                  ? `0 0 48px ${newRank.color}88, 0 0 96px ${newRank.color}44, 0 16px 40px rgba(0,0,0,0.5)`
                  : `0 0 20px ${newRank.color}33`,
                border: `1px solid ${newRank.color}cc`,
              }}
              initial={{ scale: 0.92, opacity: 0, y: 20 }}
              animate={{
                scale: ctaUnlocked ? 1 : 0.96,
                opacity: ctaUnlocked ? 1 : 0.4,
                y: ctaUnlocked ? 0 : 8,
              }}
              transition={{ type: 'spring', stiffness: 260, damping: 24 }}
              whileHover={ctaUnlocked && !reducedMotion ? { scale: 1.04 } : undefined}
              whileTap={ctaUnlocked ? { scale: 0.96 } : undefined}
            >
              <Play className="w-7 h-7 fill-current shrink-0" />
              <span>{t('rank_up_modal.cta_video')}</span>
            </motion.button>
          </motion.div>
        )}

        {videoStarted && newRank.videoPath && !videoError && !videoEnded && (
          <video
            ref={videoRef}
            src={newRank.videoPath}
            className="absolute inset-0 w-full h-full object-cover"
            playsInline
            muted={false}
            onEnded={handleVideoEnd}
            onError={() => {
              setVideoError(true);
            }}
            disablePictureInPicture
            disableRemotePlayback
            controlsList="nodownload noremoteplayback"
            style={{
              pointerEvents: 'none',
            }}
          />
        )}

        <AnimatePresence>
          {showAnimation && (
            <motion.div
              className="absolute inset-0 flex flex-col items-center justify-center bg-black/92 z-[70]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reducedMotion ? 0.2 : 0.45 }}
            >
              <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: `radial-gradient(circle at center, ${newRank.color}35 0%, transparent 58%)`,
                }}
                animate={
                  reducedMotion
                    ? { opacity: 0.5 }
                    : { opacity: [0.35, 0.55, 0.4], scale: [1, 1.06, 1] }
                }
                transition={{
                  duration: 3,
                  repeat: reducedMotion ? 0 : 2,
                  ease: 'easeInOut',
                }}
              />

              <motion.div
                className="relative z-10 text-center px-8 max-w-lg"
                initial={reducedMotion ? { opacity: 0 } : { scale: 0.92, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', damping: 18, stiffness: 200, delay: reducedMotion ? 0 : 0.15 }}
              >
                <p
                  className="text-white/75 text-sm sm:text-base font-bold tracking-[0.35em] uppercase mb-5"
                  style={{ textShadow: `0 0 24px ${newRank.color}55` }}
                >
                  {t('rank_up_modal.post_headline')}
                </p>

                <div
                  className="text-[min(28vw,120px)] leading-none mb-6 mx-auto"
                  style={{
                    filter: `drop-shadow(0 0 24px ${newRank.color}) drop-shadow(0 0 48px ${newRank.color}88)`,
                  }}
                >
                  {newRank.icon}
                </div>

                <h2
                  className="text-4xl sm:text-5xl font-black uppercase tracking-wider mb-3"
                  style={{
                    color: newRank.color,
                    textShadow: `0 0 28px ${newRank.color}, 0 0 56px ${newRank.color}66`,
                  }}
                >
                  {rankDisplayName}
                </h2>

                <p className="text-white/55 text-base mb-2">{t('rank_up_modal.post_sub')}</p>

                <p className="text-white/45 text-sm">{t('rank_up_modal.post_level', { level: newRank.level })}</p>

                <motion.div
                  className="mt-10 mx-auto h-1 rounded-full max-w-[200px]"
                  style={{ background: newRank.color }}
                  initial={{ scaleX: 0, opacity: 0.6 }}
                  animate={{ scaleX: 1, opacity: 1 }}
                  transition={{ delay: 0.35, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
};

export default RankUpVideoModal;

// © 2026 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
