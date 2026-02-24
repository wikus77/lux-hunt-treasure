/**
 * MISSION PROFILE ENGINE™ — Scan HUD (10–40s, steps, abort).
 * Haptic: selectionChanged on each step completion (iOS native only).
 * © 2025 Joseph MULÉ – M1SSION™ – NIYVORA KFT™
 */

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';
import type { ScanStep } from '@/lib/missionProfileEngine/types';
import { buildScanSteps } from '@/lib/missionProfileEngine/scanTimings';

async function isIosNative(): Promise<boolean> {
  try {
    const { Capacitor } = await import('@capacitor/core');
    return Capacitor.isNativePlatform() === true && Capacitor.getPlatform() === 'ios';
  } catch {
    return false;
  }
}

const isDev = typeof import.meta !== 'undefined' && (import.meta as any).env?.DEV === true;

async function hapticStepComplete(stepIndex: number, totalSteps: number): Promise<void> {
  try {
    if (!(await isIosNative())) return;
    const { Haptics } = await import('@capacitor/haptics');
    const isLastStep = stepIndex >= totalSteps - 1;
    if (isLastStep && Haptics?.impact) {
      await Haptics.impact({ style: 'Medium' as any });
      if (isDev) console.log('[MPE][HAPTICS] stepComplete idx=' + stepIndex + ' (Medium)');
    } else if (Haptics?.selectionChanged) {
      await Haptics.selectionChanged();
      if (isDev) console.log('[MPE][HAPTICS] stepComplete idx=' + stepIndex);
    }
  } catch {
    // no-op
  }
}

async function hapticProgressTick(style: 'Light' | 'Medium' | 'Heavy', pct: number): Promise<void> {
  try {
    if (!(await isIosNative())) return;
    const { Haptics } = await import('@capacitor/haptics');
    if (Haptics?.impact) await Haptics.impact({ style });
    if (isDev) console.log('[MPE][HAPTICS] tick p=' + (pct * 100).toFixed(0) + '% style=' + style);
  } catch {
    // no-op
  }
}

interface MissionProfileEngineScanProps {
  dataComplexity: number;
  onComplete: () => void;
  onAbort: () => void;
}

export const MissionProfileEngineScan: React.FC<MissionProfileEngineScanProps> = ({
  dataComplexity,
  onComplete,
  onAbort,
}) => {
  const { t } = useTranslation();
  const [steps, setSteps] = useState<ScanStep[]>(() => buildScanSteps(dataComplexity));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [stepProgress, setStepProgress] = useState(0);
  const [totalElapsed, setTotalElapsed] = useState(0);
  const totalDuration = steps.reduce((s, x) => s + x.durationMs, 0);
  const currentStep = steps[currentIndex];
  const totalProgressMs = totalElapsed + (currentStep ? (stepProgress / 100) * currentStep.durationMs : 0);
  const progressPct = totalDuration > 0 ? (totalProgressMs / totalDuration) * 100 : 0;

  const lastHapticStepRef = useRef(-1);
  const progressPctRef = useRef(0);
  const progressiveTickTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  progressPctRef.current = progressPct / 100;

  const advance = useCallback(() => {
    if (currentIndex !== lastHapticStepRef.current) {
      lastHapticStepRef.current = currentIndex;
      void hapticStepComplete(currentIndex, steps.length);
    }
    setSteps((prev) =>
      prev.map((s, i) => (i === currentIndex ? { ...s, completed: true } : s))
    );
    if (currentIndex >= steps.length - 1) {
      onComplete();
      return;
    }
    setCurrentIndex((i) => i + 1);
    setStepProgress(0);
  }, [currentIndex, steps.length, onComplete]);

  // Progressive haptic tick: 0–33% Light/1400ms, 34–66% Medium/1100ms, 67–100% Heavy/850ms
  useEffect(() => {
    let cancelled = false;
    function scheduleNext() {
      if (cancelled) return;
      const p = progressPctRef.current;
      const interval = p < 0.34 ? 1400 : p < 0.67 ? 1100 : 850;
      progressiveTickTimeoutRef.current = setTimeout(() => {
        if (cancelled) return;
        const pNow = progressPctRef.current;
        const style: 'Light' | 'Medium' | 'Heavy' = pNow < 0.34 ? 'Light' : pNow < 0.67 ? 'Medium' : 'Heavy';
        void hapticProgressTick(style, pNow);
        scheduleNext();
      }, interval);
    }
    scheduleNext();
    return () => {
      cancelled = true;
      if (progressiveTickTimeoutRef.current) {
        clearTimeout(progressiveTickTimeoutRef.current);
        progressiveTickTimeoutRef.current = null;
      }
    };
  }, []);

  // DEV: self-test haptics from console
  useEffect(() => {
    if (!isDev || typeof window === 'undefined') return;
    (window as any).__m1_haptics_test__ = async () => {
      try {
        const { Haptics } = await import('@capacitor/haptics');
        if (Haptics?.notification) await Haptics.notification({ type: 'SUCCESS' as any });
        if (Haptics?.impact) await Haptics.impact({ style: 'Heavy' as any });
        if (Haptics?.selectionChanged) await Haptics.selectionChanged();
        console.log('[MPE][HAPTICS] self-test ran (Success + Heavy + selectionChanged)');
      } catch (e) {
        console.warn('[MPE][HAPTICS] self-test failed', e);
      }
    };
    return () => {
      (window as any).__m1_haptics_test__ = undefined;
    };
  }, []);

  useEffect(() => {
    const step = steps[currentIndex];
    if (!step) return;
    const stepDuration = step.durationMs;
    const interval = 100;
    const inc = (interval / stepDuration) * 100;
    const t1 = setInterval(() => {
      setStepProgress((p) => {
        const next = p + inc;
        if (next >= 100) {
          advance();
          return 0;
        }
        return next;
      });
      setTotalElapsed((e) => e + interval);
    }, interval);
    return () => clearInterval(t1);
  }, [currentIndex, steps, advance]);

  return (
    <div className="flex flex-col items-center gap-6 py-4">
      <div className="w-full max-w-sm space-y-2">
        <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
          <motion.div
            className="h-full bg-cyan-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.2 }}
          />
        </div>
        <AnimatePresence mode="wait">
          {steps.map((step, i) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: i <= currentIndex ? 1 : 0.5, x: 0 }}
              className="flex items-center gap-3 text-sm"
            >
              {step.completed ? (
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500/20 text-green-400">
                  <Check className="h-3.5 w-3.5" />
                </div>
              ) : (
                <div className="h-6 w-6 rounded-full border border-white/30 flex items-center justify-center">
                  {i === currentIndex && (
                    <motion.div
                      className="h-2 w-2 rounded-full bg-cyan-400"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 0.8, repeat: Infinity }}
                    />
                  )}
                </div>
              )}
              <span className="text-white/90">{t(step.labelKey)}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <button
        type="button"
        onClick={onAbort}
        className="text-sm text-white/85 underline hover:text-white"
      >
        {t('mission_profile_engine_abort_scan')}
      </button>
    </div>
  );
};
