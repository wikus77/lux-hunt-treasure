/**
 * Action radial hub — 4 slots (MAP, BUZZ, AION, Missione del giorno).
 * Tap center toggles; tap slots navigates to respective pages.
 * Position: below M1U pill (left side), fixed on scroll.
 * Pulses if not tapped today (urgency indicator).
 * Rendered inline (no separate portal) — part of FloatingPillLayerV3.
 */

import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Target, Map, Zap, Brain, Calendar } from 'lucide-react';
import { useDclLauncher } from '@/contexts/DclLauncherContext';
import { buttonClickFeedback } from '@/utils/buttonClickFeedback';
import { useFloatingPillsV3 } from './useFloatingPillsV3';

/** 4 positions on circle, radius 70px. */
const RADIAL_4: { x: number; y: number; icon: React.ReactNode; label: string; path?: string; action?: () => void }[] = [
  { x: 70, y: 0, icon: <Map className="h-5 w-5" />, label: 'MAP', path: '/map-3d-tiler' },
  { x: 0, y: -70, icon: <Zap className="h-5 w-5" />, label: 'BUZZ', path: '/buzz' },
  { x: -70, y: 0, icon: <Brain className="h-5 w-5" />, label: 'AION', path: '/intelligence' },
  { x: 0, y: 70, icon: <Calendar className="h-5 w-5" />, label: 'MISSION', action: undefined }, // Will use openMission()
];

const SAT_SIZE = 52;
const HALF = SAT_SIZE / 2;

const ACTION_PILL_TAPPED_KEY = 'm1-action-pill-tapped-today';

function getTodayKey(): string {
  return new Date().toISOString().split('T')[0];
}

function wasTappedToday(): boolean {
  if (typeof window === 'undefined') return false;
  const stored = localStorage.getItem(ACTION_PILL_TAPPED_KEY);
  return stored === getTodayKey();
}

function markTappedToday(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ACTION_PILL_TAPPED_KEY, getTodayKey());
}

export const ActionRadialHubPill: React.FC = () => {
  const { leftRailRadialSatelliteBiasXPx } = useFloatingPillsV3();
  const { t } = useTranslation();
  const [, navigate] = useLocation();
  const { openMission } = useDclLauncher();
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [tappedToday, setTappedToday] = useState(wasTappedToday());

  useEffect(() => {
    setTappedToday(wasTappedToday());
  }, []);

  const shouldPulse = !tappedToday;
  const pulseIntensity = 0.8;

  const toggleHub = useCallback(() => {
    buttonClickFeedback();
    setOpen((v) => !v);
    if (!tappedToday) {
      markTappedToday();
      setTappedToday(true);
    }
  }, [tappedToday]);

  const closeHub = useCallback(() => {
    setOpen(false);
  }, []);

  const onSlotTap = useCallback(
    (slot: typeof RADIAL_4[0]) => {
      buttonClickFeedback();
      closeHub();
      if (slot.path) {
        window.setTimeout(() => {
          navigate(slot.path!);
        }, 200);
      } else if (slot.action) {
        slot.action();
      } else {
        // Missione del giorno
        try {
          openMission();
        } catch {
          /* no-op */
        }
      }
    },
    [navigate, openMission, closeHub]
  );

  /** Flex footprint = visible pill (72×72); radial hit-area 200×200 is centered so rail axis matches Tempo/Battle. */
  return (
    <div
      className="relative shrink-0 self-start overflow-visible"
      style={{
        width: 72,
        height: 72,
        pointerEvents: 'none',
      }}
    >
      <AnimatePresence>
        {open && (
          <motion.button
            type="button"
            aria-label={t('home_radial_hub_dismiss')}
            className="pointer-events-auto fixed inset-0 cursor-default border-0 bg-black/35 backdrop-blur-[2px]"
            style={{
              WebkitTapHighlightColor: 'transparent',
              zIndex: -1,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeHub}
          />
        )}
      </AnimatePresence>

      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 overflow-visible"
        style={{ width: 200, height: 200 }}
      >
        <div className="relative h-full w-full" style={{ pointerEvents: 'none' }}>
        <AnimatePresence>
          {open &&
            RADIAL_4.map((slot, i) => {
              const isMap = slot.path === '/map-3d-tiler';
              const isBuzz = slot.path === '/buzz';
              const isAion = slot.path === '/intelligence';
              const isMission = !slot.path && !slot.action;
              const borderColor = isMap
                ? 'rgba(239, 68, 68, 0.5)'
                : isBuzz
                  ? 'rgba(167, 139, 250, 0.5)'
                  : isAion
                    ? 'rgba(0, 209, 255, 0.5)'
                    : 'rgba(251, 191, 36, 0.5)';
              const bg = isMap
                ? 'rgba(239, 68, 68, 0.15)'
                : isBuzz
                  ? 'rgba(167, 139, 250, 0.15)'
                  : isAion
                    ? 'rgba(0, 209, 255, 0.15)'
                    : 'rgba(251, 191, 36, 0.15)';
              const shadow = isMap
                ? '0 0 14px rgba(239, 68, 68, 0.3)'
                : isBuzz
                  ? '0 0 14px rgba(167, 139, 250, 0.3)'
                  : isAion
                    ? '0 0 14px rgba(0, 209, 255, 0.3)'
                    : '0 0 14px rgba(251, 191, 36, 0.3)';
              return (
                <motion.button
                  key={i}
                  type="button"
                  aria-label={`${t('home_side_pill_next_action')} · ${slot.label}`}
                  className="pointer-events-auto absolute flex flex-col items-center justify-center gap-1 rounded-full border text-xs font-bold uppercase"
                  style={{
                    width: SAT_SIZE,
                    height: SAT_SIZE,
                    left: '50%',
                    top: '50%',
                    marginLeft: -HALF,
                    marginTop: -HALF,
                    zIndex: 10,
                    borderColor,
                    background: bg,
                    color: 'rgba(255, 255, 255, 0.95)',
                    boxShadow: shadow,
                    WebkitBackdropFilter: 'blur(12px)',
                    backdropFilter: 'blur(12px)',
                  }}
                  initial={
                    reduce
                      ? { x: 0, y: 0, scale: 0, opacity: 0 }
                      : { x: 0, y: 0, scale: 0.4, opacity: 0 }
                  }
                  animate={{
                    x: slot.x + leftRailRadialSatelliteBiasXPx,
                    y: slot.y,
                    scale: 1,
                    opacity: 1,
                  }}
                  exit={
                    reduce
                      ? { x: 0, y: 0, scale: 0, opacity: 0 }
                      : { x: 0, y: 0, scale: 0.4, opacity: 0 }
                  }
                  transition={{
                    type: 'spring',
                    stiffness: 420,
                    damping: 28,
                    delay: reduce ? 0 : i * 0.04,
                  }}
                  whileTap={{ scale: 0.92 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSlotTap(slot);
                  }}
                >
                  <span className="text-[10px]">{slot.icon}</span>
                  <span className="text-[8px] leading-none">{slot.label}</span>
                </motion.button>
              );
            })}
        </AnimatePresence>

        <motion.button
          type="button"
          aria-expanded={open}
          aria-label={t('home_side_pill_next_action')}
          onClick={(e) => {
            e.stopPropagation();
            toggleHub();
          }}
          className="pointer-events-auto absolute left-1/2 top-1/2 flex h-[72px] w-[72px] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border border-cyan-400/40"
          style={{
            background:
              'linear-gradient(165deg, rgba(0, 40, 55, 0.92) 0%, rgba(4, 14, 26, 0.96) 45%, rgba(2, 8, 18, 0.98) 100%)',
            boxShadow: shouldPulse
              ? [
                  '0 0 28px rgba(0, 209, 255, 0.5)',
                  '0 0 48px rgba(0, 209, 255, 0.8)',
                  '0 0 28px rgba(0, 209, 255, 0.5)',
                ]
              : open
                ? '0 0 28px rgba(0, 209, 255, 0.45), 0 0 48px rgba(0, 120, 200, 0.12), inset 0 1px 0 rgba(255,255,255,0.1)'
                : '0 0 16px rgba(0, 209, 255, 0.22), inset 0 1px 0 rgba(255,255,255,0.06)',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
          }}
          animate={
            shouldPulse && !reduce && !open
              ? {
                  boxShadow: [
                    '0 0 28px rgba(0, 209, 255, 0.5)',
                    '0 0 48px rgba(0, 209, 255, 0.8)',
                    '0 0 28px rgba(0, 209, 255, 0.5)',
                  ],
                  scale: [1, 1.05, 1],
                }
              : open
                ? { scale: 1.02 }
                : { scale: 1 }
          }
          transition={
            shouldPulse && !reduce && !open
              ? {
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }
              : { type: 'spring', stiffness: 400, damping: 24 }
          }
          whileTap={{ scale: 0.94 }}
        >
          <span className="absolute -right-1 -top-1 z-10 max-w-[58px] truncate rounded-full border border-cyan-400/35 bg-black/70 px-1.5 py-0.5 text-[7px] font-bold text-cyan-100 shadow-md">
            {t('home_float_badge_ready')}
          </span>
          <Target
            className="h-5 w-5 text-cyan-300"
            style={{ filter: 'drop-shadow(0 0 6px rgba(0,209,255,0.55))' }}
          />
          <span
            className="mt-0.5 max-w-[68px] px-1 text-center text-[8px] font-extrabold leading-tight text-white/95"
            style={{ textShadow: '0 1px 3px rgba(0,0,0,0.65)' }}
          >
            {t('home_side_pill_next_action')}
          </span>
        </motion.button>
        </div>
      </div>
    </div>
  );
};
