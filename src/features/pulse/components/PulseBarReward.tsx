/**
 * THE PULSE™ — Reward Pulse Bar (Energy Injection)
 * Fullscreen reward: animation based on DELTA so +5 / +10 are always visibly impactful.
 * Phases: orb emerge → inject beam → fill bar → final pulse → CTA.
 * © 2025 Joseph MULÉ – M1SSION™ – NIYVORA KFT™
 */

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { peSyncLog } from '@/utils/victoryRewardSounds';

const PE_EASE = [0.22, 1, 0.36, 1] as const;

const REWARD_COLOR = '#00e7ff';
const BAR_WIDTH = 320;
const SPHERE_SIZE = 40;
/** Framer delay (s) for +N PE scale pop when phase === 'pulse'. */
const PE_NUMBER_POP_DELAY_S = 0.3;

/**
 * Must match `HOLD_MS` in `GlobalPERewardOverlay.tsx` — ms after bar `onAnimationComplete` before `uiPhase === 'cta'`.
 * Used only to pull PE SFX earlier so perceived impact does not line up with CTA (barEnd + hold).
 */
const PE_UI_HOLD_BEFORE_CTA_MS = 1700;

export interface PulseBarRewardProps {
  amount: number;
  source: string;
  preValue?: number;
  postValue?: number;
  onAnimationComplete?: () => void;
  /** Shorter path for accessibility. */
  reducedMotion?: boolean;
  /** Fired once when bar-timeline PE SFX schedule fires (`PE_BAR_ANIMATION_END_MS`, not CTA). */
  onBurstPeak?: () => void;
  /** Light CSS particles toward the bar (no canvas). */
  showFlowParticles?: boolean;
}

function formatPE(pe: number): string {
  if (pe >= 1000000) return `${(pe / 1000000).toFixed(1)}M`;
  if (pe >= 1000) return `${(pe / 1000).toFixed(1)}K`;
  return pe.toString();
}

type Phase = 'orb' | 'inject' | 'fill' | 'pulse' | 'done';

export const PulseBarReward: React.FC<PulseBarRewardProps> = ({
  amount,
  source,
  preValue = 0,
  postValue,
  onAnimationComplete,
  reducedMotion = false,
  onBurstPeak,
  showFlowParticles = false,
}) => {
  const { t } = useTranslation();
  const [displayAmount, setDisplayAmount] = useState(0);
  const [phase, setPhase] = useState<Phase>('orb');

  const postDisplay = postValue ?? preValue + amount;

  // Display amount steps 0 → amount (for +N PE text)
  useEffect(() => {
    if (reducedMotion) {
      setDisplayAmount(amount);
      return;
    }
    let cancelled = false;
    const steps = Math.min(Math.max(amount, 1), 40);
    const stepValue = amount / steps;
    const interval = 320 / steps;
    let current = 0;
    const id = setInterval(() => {
      if (cancelled) return;
      current += stepValue;
      if (current >= amount) {
        setDisplayAmount(amount);
        clearInterval(id);
      } else {
        setDisplayAmount(Math.round(current));
      }
    }, interval);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [amount, reducedMotion]);

  // Phase sequence: orb (0–400ms) → inject (400–900ms) → fill (900–2200ms) → pulse (2200–2600ms) → done
  /** When `phase === 'pulse'`, the +N block uses `delay: PE_NUMBER_POP_DELAY_S`. */
  const PULSE_PHASE_AT_MS = 2200;
  const DONE_PHASE_AT_MS = 2600;

  /**
   * END-ANCHORED PE audio on **bar timeline only** (ms from PulseBar mount).
   *
   * Anchor = **end of bar JS sequence** (`done` @ `DONE_PHASE_AT_MS`), **not** CTA.
   * CTA appears ≈ `PE_UI_HOLD_BEFORE_CTA_MS` after `onAnimationComplete` (see overlay).
   *
   * If tuning matched perceived SFX to CTA, subtract that hold gap so impact lands at bar end / climax:
   *
   *   raw = barEnd - effectiveWindow - iosComp - pullbackBeforeCta
   *   computedPlayAt = max(PE_SOUND_MIN_BAR_MS, raw)
   */
  const PE_BAR_ANIMATION_END_MS = DONE_PHASE_AT_MS;
  const PE_EFFECTIVE_SOUND_WINDOW_MS = 860;
  const PE_IOS_OUTPUT_LATENCY_COMP_MS = 130;
  /** Corrects perceived “late” SFX that lined up with CTA (barEnd + hold), not bar end. */
  const PE_SYNC_PULLBACK_BEFORE_CTA_MS = PE_UI_HOLD_BEFORE_CTA_MS;
  /** Earliest bar time for SFX (after inject) so warm/metadata can win on iOS. */
  const PE_SOUND_MIN_BAR_MS = 400;
  /**
   * iPhone (WKWebView): shift PE SFX earlier vs the computed bar anchor without new formulas.
   * Applied after `max(MIN_BAR, raw)` so baseline stays reward/bar-anchored.
   */
  const PE_SOUND_DEVICE_ADVANCE_MS = 500;

  useEffect(() => {
    if (reducedMotion) {
      setPhase('done');
      onBurstPeak?.();
      const t = setTimeout(() => onAnimationComplete?.(), 80);
      return () => clearTimeout(t);
    }
    const t1 = setTimeout(() => setPhase('inject'), 400);
    const t2 = setTimeout(() => setPhase('fill'), 900);
    const ctaApproxBarTimelineMs =
      PE_BAR_ANIMATION_END_MS + PE_UI_HOLD_BEFORE_CTA_MS;
    const rawPlayAt =
      PE_BAR_ANIMATION_END_MS -
      PE_EFFECTIVE_SOUND_WINDOW_MS -
      PE_IOS_OUTPUT_LATENCY_COMP_MS -
      PE_SYNC_PULLBACK_BEFORE_CTA_MS;
    const basePlayAt = Math.max(PE_SOUND_MIN_BAR_MS, rawPlayAt);
    const peSoundAtMs = Math.max(0, basePlayAt - PE_SOUND_DEVICE_ADVANCE_MS);
    const tSound = setTimeout(() => {
      peSyncLog('end-anchored trigger onBurstPeak (bar end anchor, not CTA)', {
        strategy: 'end-anchored-bar-end',
        barEndAnchorMs: PE_BAR_ANIMATION_END_MS,
        ctaApproxBarTimelineMs,
        holdBeforeCtaMs: PE_UI_HOLD_BEFORE_CTA_MS,
        effectiveSoundWindow: PE_EFFECTIVE_SOUND_WINDOW_MS,
        iosCompensation: PE_IOS_OUTPUT_LATENCY_COMP_MS,
        pullbackBeforeCtaMs: PE_SYNC_PULLBACK_BEFORE_CTA_MS,
        rawComputedPlayAt: rawPlayAt,
        basePlayAtBeforeAdvanceMs: basePlayAt,
        deviceAdvanceMs: PE_SOUND_DEVICE_ADVANCE_MS,
        computedPlayAt: peSoundAtMs,
        performanceNow:
          typeof performance !== 'undefined' ? performance.now() : undefined,
      });
      onBurstPeak?.();
    }, peSoundAtMs);
    const t3 = setTimeout(() => {
      setPhase('pulse');
    }, PULSE_PHASE_AT_MS);
    const t4 = setTimeout(() => {
      setPhase('done');
      onAnimationComplete?.();
    }, DONE_PHASE_AT_MS);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(tSound);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onAnimationComplete, onBurstPeak, reducedMotion]);

  // Fill is based on DELTA only: 0% → 100% as displayAmount goes 0 → amount. Always visually full for any +N.
  const rewardFillPercent = amount <= 0 ? 0 : Math.min(100, (displayAmount / amount) * 100);

  return (
    <div className="flex flex-col items-center gap-8 w-full relative">
      {showFlowParticles && phase !== 'done' && !reducedMotion && (
        <div className="pointer-events-none absolute inset-0 overflow-visible" aria-hidden>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <motion.span
              key={i}
              className="absolute rounded-full"
              style={{
                width: 6,
                height: 6,
                left: `${12 + i * 14}%`,
                top: '18%',
                background: REWARD_COLOR,
                boxShadow: `0 0 10px ${REWARD_COLOR}`,
                opacity: 0.55,
              }}
              initial={{ y: 40, opacity: 0, scale: 0.5 }}
              animate={{ y: [40, 0, -8], opacity: [0, 0.8, 0.2], scale: [0.5, 1, 0.6] }}
              transition={{
                duration: 1.4,
                delay: 0.15 * i,
                repeat: phase === 'fill' ? 3 : 0,
                repeatDelay: 0.2,
                ease: 'easeOut',
              }}
            />
          ))}
        </div>
      )}
      <motion.div
        className="text-lg font-medium text-white/90 uppercase tracking-wider text-center"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reducedMotion ? 0.12 : 0.3 }}
      >
        {t('pe_reward.title')}
      </motion.div>

      {/* Bar container with beam sweep + glow */}
      <div className="relative w-full flex flex-col items-center" style={{ width: BAR_WIDTH }}>
        {/* Light sweep / beam (during fill phase) */}
        {phase !== 'orb' && phase !== 'done' && (
          <motion.div
            className="absolute inset-0 rounded-full pointer-events-none overflow-hidden"
            style={{ width: BAR_WIDTH, height: 36 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: phase === 'pulse' ? 0 : 0.4 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="absolute top-0 bottom-0 w-24"
              style={{
                background: `linear-gradient(90deg, transparent, ${REWARD_COLOR}55, transparent)`,
                boxShadow: `0 0 40px ${REWARD_COLOR}80`,
              }}
              animate={{ x: [0, BAR_WIDTH + 48] }}
              transition={{
                duration: 1.05,
                ease: PE_EASE,
                repeat: phase === 'fill' ? 1 : 0,
                repeatDelay: 0.15,
              }}
            />
          </motion.div>
        )}

        <div className="relative w-full" style={{ width: BAR_WIDTH, height: 32 }}>
          {/* Track */}
          <div
            className="absolute inset-0 rounded-full overflow-hidden"
            style={{
              background: 'rgba(0,0,0,0.6)',
              border: `2px solid ${REWARD_COLOR}40`,
              boxShadow: `inset 0 0 28px ${REWARD_COLOR}14`,
            }}
          >
            {/* Fill — delta-only: 0 to 100% of bar for the reward */}
            <motion.div
              className="absolute left-0 top-0 bottom-0 rounded-full origin-left"
              style={{
                width: '100%',
                background: `linear-gradient(90deg, ${REWARD_COLOR}92, ${REWARD_COLOR})`,
                boxShadow: `0 0 32px ${REWARD_COLOR}aa, 0 0 64px ${REWARD_COLOR}50`,
              }}
              initial={{ scaleX: reducedMotion ? 1 : 0 }}
              animate={{ scaleX: rewardFillPercent / 100 }}
              transition={{
                duration: reducedMotion ? 0.15 : 1.05,
                ease: reducedMotion ? 'linear' : PE_EASE,
              }}
            />
          </div>

          {/* Orb — enters from right, travels with fill */}
          <motion.div
            className="absolute rounded-full pointer-events-none"
            style={{
              width: SPHERE_SIZE,
              height: SPHERE_SIZE,
              left: 0,
              top: '50%',
              marginTop: -SPHERE_SIZE / 2,
              background: `radial-gradient(circle at 30% 30%, #fff, ${REWARD_COLOR})`,
              boxShadow: `0 0 32px ${REWARD_COLOR}, 0 0 64px ${REWARD_COLOR}70`,
            }}
            initial={{ x: BAR_WIDTH + SPHERE_SIZE, opacity: 0.6, scale: 0.8 }}
            animate={{
              x: (rewardFillPercent / 100) * BAR_WIDTH - SPHERE_SIZE / 2,
              opacity: phase === 'done' ? 0.4 : 1,
              scale: phase === 'pulse' ? 1.2 : phase === 'done' ? 0.9 : 1.1,
            }}
            transition={{
              x: { duration: 1, ease: PE_EASE },
              opacity: { duration: 0.25 },
              scale: { duration: 0.22, ease: PE_EASE },
            }}
          />

          {/* Final pulse glow */}
          {phase === 'pulse' && (
            <motion.div
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{
                boxShadow: `0 0 48px ${REWARD_COLOR}60, 0 0 96px ${REWARD_COLOR}30`,
                background: 'transparent',
              }}
              initial={{ opacity: 0.8, scale: 1 }}
              animate={{ opacity: 0, scale: 1.3 }}
              transition={{ duration: 0.52, ease: PE_EASE }}
            />
          )}
          {phase === 'done' && (
            <motion.div
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{ boxShadow: `0 0 32px ${REWARD_COLOR}30` }}
              initial={{ opacity: 0.5 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            />
          )}
        </div>
      </div>

      {/* +N PE — primary message */}
      <motion.div
        className="flex flex-col items-center gap-2"
        initial={{ opacity: 0, scale: 0.88 }}
        animate={
          phase === 'pulse'
            ? { opacity: 1, scale: [1, 1.16, 1.05] }
            : { opacity: 1, scale: 1 }
        }
        transition={{
          delay: reducedMotion ? 0 : PE_NUMBER_POP_DELAY_S,
          duration: phase === 'pulse' ? 0.35 : reducedMotion ? 0.15 : 0.35,
        }}
      >
        <motion.span
          className="text-4xl sm:text-5xl font-black tabular-nums"
          style={{
            color: REWARD_COLOR,
            textShadow: `0 0 32px ${REWARD_COLOR}99, 0 0 64px ${REWARD_COLOR}66, 0 2px 4px rgba(0,0,0,0.8)`,
          }}
          animate={
            phase === 'pulse' && !reducedMotion
              ? {
                  filter: ['brightness(1)', 'brightness(1.35)', 'brightness(1)'],
                }
              : {}
          }
          transition={{ duration: 0.28 }}
        >
          +{formatPE(displayAmount)} PE
        </motion.span>
        {postValue != null && (
          <span className="text-sm text-white/60 font-mono tabular-nums">
            {t('pe_reward.new_total')} {formatPE(postDisplay)} PE
          </span>
        )}
      </motion.div>

      {/* Source label */}
      {source && (
        <motion.span
          className="text-xs text-white/50 uppercase tracking-widest"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.25 }}
        >
          {t(`pe_reward.source_${source}`) || source}
        </motion.span>
      )}
    </div>
  );
};
