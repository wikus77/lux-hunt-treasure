/**
 * Commit radial hub — 7 slots, daily word puzzle (28 words, no repeat).
 * Tap center toggles; tap slots in correct order → green/red feedback; full word → openCommit().
 * With Home floating pills V3: rendered inside FloatingPillLayerV3 (same left rail as Prossima azione; no second portal / synthetic top).
 * Else: legacy own portal, top-right.
 */

import React, { useCallback, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Check, Sparkles } from 'lucide-react';
import { useTodayDailyState } from '@/hooks/useTodayDailyState';
import { useMissionStatus } from '@/hooks/useMissionStatus';
import { useDclLauncher } from '@/contexts/DclLauncherContext';
import { buttonClickFeedback } from '@/utils/buttonClickFeedback';
import {
  COMMIT_PILL_V3_PORTAL_ID,
  COMMIT_PILL_V3_Z_INDEX,
  COMMIT_RADIAL_DAILY_WORDS_28,
} from './commitPillV3.config';
import { ENABLE_HOME_FLOATING_PILLS_V3 } from '@/components/home/floatingPillsV3/floating-pills-v3';
import { useFloatingPillsV3 } from '@/components/home/floatingPillsV3/useFloatingPillsV3';

/** 7 positions on circle, radius 70px (hub center = pill center; slots unchanged). */
const RADIAL_7: { x: number; y: number }[] = [
  { x: 70, y: 0 },
  { x: 44, y: -55 },
  { x: -15, y: -68 },
  { x: -63, y: -35 },
  { x: -63, y: 35 },
  { x: -15, y: 68 },
  { x: 44, y: 55 },
];

const SAT_SIZE = 44;
const HALF = SAT_SIZE / 2;

/** Seeded shuffle (reproducible per day). */
function shuffleWithSeed<T>(arr: T[], seed: number): T[] {
  const out = [...arr];
  let s = seed;
  for (let i = out.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const j = s % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export const CommitRadialHubPill: React.FC = () => {
  const embedInHomeFloatingLayer = ENABLE_HOME_FLOATING_PILLS_V3;
  const { leftRailRadialSatelliteBiasXPx } = useFloatingPillsV3();
  /** Legacy portal: bias 0. Embedded left rail: same X offset as Prossima azione (viewport-safe). */
  const radialSlotBiasX = embedInHomeFloatingLayer ? leftRailRadialSatelliteBiasXPx : 0;
  const { t } = useTranslation();
  const { commit_done } = useTodayDailyState();
  const { missionStatus } = useMissionStatus();
  const { openCommit } = useDclLauncher();
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [sequence, setSequence] = useState('');
  const [feedbackSlot, setFeedbackSlot] = useState<number | null>(null);
  const [feedbackType, setFeedbackType] = useState<'correct' | 'wrong' | null>(null);

  // Calculate mission day from start date (reliable, independent of daysRemaining updates)
  const missionDay = useMemo(() => {
    if (!missionStatus?.startDate) {
      // Fallback: use totalDays - daysRemaining if startDate not available
      const total = missionStatus?.totalDays ?? 30;
      const rem = missionStatus?.daysRemaining ?? 30;
      return Math.max(1, total - rem + 1);
    }
    const now = new Date();
    const start = new Date(missionStatus.startDate);
    const diffMs = now.getTime() - start.getTime();
    const daysElapsed = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    return Math.max(1, daysElapsed + 1); // Day 1 = first day
  }, [missionStatus?.startDate, missionStatus?.totalDays, missionStatus?.daysRemaining]);

  const wordIndex = useMemo(() => (missionDay - 1) % 28, [missionDay]);
  const word = useMemo(
    () => COMMIT_RADIAL_DAILY_WORDS_28[wordIndex] ?? COMMIT_RADIAL_DAILY_WORDS_28[0],
    [wordIndex]
  );
  const slotsLetters = useMemo(
    () => shuffleWithSeed(word.split(''), missionDay),
    [word, missionDay]
  );

  const toggleHub = useCallback(() => {
    buttonClickFeedback();
    setOpen((v) => !v);
    setSequence('');
    setFeedbackSlot(null);
    setFeedbackType(null);
  }, []);

  const closeHub = useCallback(() => {
    setOpen(false);
    setSequence('');
    setFeedbackSlot(null);
    setFeedbackType(null);
  }, []);

  const onSlotTap = useCallback(
    (index: number) => {
      buttonClickFeedback();
      const letter = slotsLetters[index];
      const expected = word[sequence.length];
      const correct = letter === expected;

      setFeedbackSlot(index);
      setFeedbackType(correct ? 'correct' : 'wrong');

      if (correct) {
        const next = sequence + letter;
        setSequence(next);
        if (next.length === 7) {
          try {
            openCommit();
          } catch {
            /* no-op */
          }
          window.setTimeout(() => {
            closeHub();
          }, 400);
        }
      } else {
        setSequence('');
        window.setTimeout(() => {
          setFeedbackSlot(null);
          setFeedbackType(null);
        }, 500);
      }
    },
    [sequence, word, slotsLetters, openCommit, closeHub]
  );

  const backdrop = (
    <AnimatePresence>
      {open && (
        <motion.button
          type="button"
          aria-label={t('home_radial_hub_dismiss')}
          className="pointer-events-auto fixed inset-0 cursor-default border-0 bg-black/35 backdrop-blur-[2px]"
          style={{ WebkitTapHighlightColor: 'transparent' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={closeHub}
        />
      )}
    </AnimatePresence>
  );

  const hubCore = (
    <div className="relative h-full w-full" style={{ pointerEvents: 'none' }}>
      <AnimatePresence>
        {open &&
          RADIAL_7.map((off, i) => {
            const isCorrect = feedbackSlot === i && feedbackType === 'correct';
            const isWrong = feedbackSlot === i && feedbackType === 'wrong';
            const borderColor = isCorrect
              ? 'rgba(52, 211, 153, 0.7)'
              : isWrong
                ? 'rgba(248, 113, 113, 0.7)'
                : 'rgba(0, 209, 255, 0.35)';
            const bg = isCorrect
              ? 'rgba(52, 211, 153, 0.25)'
              : isWrong
                ? 'rgba(248, 113, 113, 0.2)'
                : 'rgba(8, 14, 24, 0.92)';
            const shadow = isCorrect
              ? '0 0 16px rgba(52, 211, 153, 0.4)'
              : isWrong
                ? '0 0 16px rgba(248, 113, 113, 0.4)'
                : '0 0 14px rgba(0, 209, 255, 0.25), inset 0 1px 0 rgba(255,255,255,0.08)';
            return (
              <motion.button
                key={i}
                type="button"
                aria-label={`${t('home_side_pill_commit')} · ${slotsLetters[i]}`}
                className="pointer-events-auto absolute flex items-center justify-center rounded-full border text-lg font-black uppercase"
                style={{
                  width: SAT_SIZE,
                  height: SAT_SIZE,
                  left: '50%',
                  top: '50%',
                  marginLeft: -HALF,
                  marginTop: -HALF,
                  zIndex: 10, // Above center button (z-index implicit 0)
                  borderColor,
                  background: bg,
                  color: isCorrect ? 'rgb(52, 211, 153)' : isWrong ? 'rgb(248, 113, 113)' : 'rgba(200, 230, 255, 0.95)',
                  boxShadow: shadow,
                  WebkitBackdropFilter: 'blur(12px)',
                  backdropFilter: 'blur(12px)',
                }}
                initial={
                  reduce
                    ? { x: 0, y: 0, scale: 0, opacity: 0 }
                    : { x: 0, y: 0, scale: 0.4, opacity: 0 }
                }
                animate={{ x: off.x + radialSlotBiasX, y: off.y, scale: 1, opacity: 1 }}
                exit={
                  reduce
                    ? { x: 0, y: 0, scale: 0, opacity: 0 }
                    : { x: 0, y: 0, scale: 0.4, opacity: 0 }
                }
                transition={{
                  type: 'spring',
                  stiffness: 420,
                  damping: 28,
                  delay: reduce ? 0 : i * 0.028,
                }}
                whileTap={{ scale: 0.92 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onSlotTap(i);
                }}
              >
                {slotsLetters[i]}
              </motion.button>
            );
          })}
      </AnimatePresence>

      <motion.button
        type="button"
        aria-expanded={open}
        aria-label={t('home_side_pill_commit')}
        onClick={(e) => {
          e.stopPropagation();
          toggleHub();
        }}
        className="pointer-events-auto absolute left-1/2 top-1/2 flex h-[72px] w-[72px] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border"
        style={{
          borderColor: commit_done ? 'rgba(52, 211, 153, 0.45)' : 'rgba(0, 209, 255, 0.4)',
          background: commit_done
            ? 'radial-gradient(ellipse at 45% 32%, rgba(52, 211, 153, 0.22) 0%, rgba(6, 20, 16, 0.96) 58%)'
            : 'radial-gradient(ellipse at 45% 32%, rgba(0, 209, 255, 0.22) 0%, rgba(6, 14, 26, 0.96) 58%)',
          boxShadow: open
            ? '0 0 28px rgba(0, 209, 255, 0.45), inset 0 1px 0 rgba(255,255,255,0.1)'
            : commit_done
              ? '0 0 20px rgba(52, 211, 153, 0.28), inset 0 1px 0 rgba(255,255,255,0.08)'
              : '0 0 20px rgba(0, 209, 255, 0.32), inset 0 1px 0 rgba(255,255,255,0.08)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
        }}
        whileTap={{ scale: 0.94 }}
        animate={open ? { scale: 1.02 } : { scale: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 24 }}
      >
        <span
          className={`absolute -top-1 left-1/2 z-10 max-w-[120px] -translate-x-1/2 truncate rounded-full border px-2 py-0.5 text-[7px] font-bold shadow-md ${
            commit_done
              ? 'border-emerald-400/40 bg-emerald-950/90 text-emerald-100'
              : 'border-cyan-400/40 bg-black/75 text-cyan-100'
          }`}
        >
          {commit_done ? t('home_side_pill_commit_done') : t('home_float_badge_pending')}
        </span>
        {commit_done ? (
          <Check
            className="mt-2 h-7 w-7 text-emerald-300"
            style={{ filter: 'drop-shadow(0 0 8px rgba(52,211,153,0.45))' }}
          />
        ) : (
          <Sparkles
            className="mt-2 h-7 w-7 text-cyan-300"
            style={{ filter: 'drop-shadow(0 0 8px rgba(0,209,255,0.45))' }}
          />
        )}
        <span
          className="mt-1 max-w-[100px] px-1 text-center text-[8px] font-extrabold uppercase tracking-wide text-white/92"
          style={{ textShadow: '0 1px 3px rgba(0,0,0,0.65)' }}
        >
          {t('home_side_pill_commit')}
        </span>
      </motion.button>
    </div>
  );

  if (embedInHomeFloatingLayer) {
    return (
      <>
        {backdrop}
        <div
          id={COMMIT_PILL_V3_PORTAL_ID}
          className="relative shrink-0 self-start overflow-visible"
          style={{
            width: 72,
            height: 72,
            pointerEvents: 'none',
          }}
        >
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 overflow-visible"
            style={{ width: 200, height: 200 }}
          >
            {hubCore}
          </div>
        </div>
      </>
    );
  }

  const layer = (
    <div
      id={COMMIT_PILL_V3_PORTAL_ID}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: COMMIT_PILL_V3_Z_INDEX,
        paddingTop: 'env(safe-area-inset-top, 0px)',
        paddingRight: 'env(safe-area-inset-right, 0px)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        paddingLeft: 'env(safe-area-inset-left, 0px)',
        pointerEvents: 'none',
      }}
    >
      {backdrop}
      <div
        className="absolute"
        style={{
          top: 'calc(env(safe-area-inset-top, 0px) + 4px)',
          right: 'max(16px, env(safe-area-inset-right, 0px))',
          width: 200,
          height: 200,
          pointerEvents: 'none',
        }}
      >
        {hubCore}
      </div>
    </div>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(layer, document.body);
};
