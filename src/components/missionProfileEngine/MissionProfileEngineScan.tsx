/**
 * MISSION PROFILE ENGINE™ — Scan HUD (10–40s, steps, abort).
 * Progressive haptics on iOS: Light → Medium → Heavy by progress; step feedback; cleanup on abort/close.
 * © 2025 Joseph MULÉ – M1SSION™ – NIYVORA KFT™
 */

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';
import type { ScanStep } from '@/lib/missionProfileEngine/types';
import { buildScanSteps } from '@/lib/missionProfileEngine/scanTimings';

const DEV = typeof import.meta !== 'undefined' && import.meta.env?.DEV === true;

async function isIosNative(): Promise<boolean> {
  try {
    const { Capacitor } = await import('@capacitor/core');
    return Capacitor.isNativePlatform() === true && Capacitor.getPlatform() === 'ios';
  } catch {
    return false;
  }
}

function hapticForProgress(p: number): { style: 'Light' | 'Medium' | 'Heavy'; delayMs: number } {
  if (p < 0.34) return { style: 'Light', delayMs: 1500 };
  if (p < 0.67) return { style: 'Medium', delayMs: 1100 };
  return { style: 'Heavy', delayMs: 850 };
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
  const progress0to1 = totalDuration > 0 ? totalProgressMs / totalDuration : 0;

  const progressRef = useRef(0);
  const hapticsStoppedRef = useRef(false);
  const hapticsTickTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastStepHapticIndexRef = useRef(-1);

  useEffect(() => {
    progressRef.current = progress0to1;
  }, [progress0to1]);

  const stopHaptics = useCallback(() => {
    hapticsStoppedRef.current = true;
    if (hapticsTickTimeoutRef.current != null) {
      clearTimeout(hapticsTickTimeoutRef.current);
      hapticsTickTimeoutRef.current = null;
    }
  }, []);

  const fireImpact = useCallback(async (style: 'Light' | 'Medium' | 'Heavy') => {
    if (hapticsStoppedRef.current) return;
    if (!(await isIosNative())) return;
    try {
      const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
      const styleMap = { Light: ImpactStyle.Light, Medium: ImpactStyle.Medium, Heavy: ImpactStyle.Heavy };
      if (Haptics?.impact) await Haptics.impact({ style: styleMap[style] });
    } catch {
      // no-op
    }
  }, []);

  const scheduleTick = useCallback(() => {
    if (hapticsStoppedRef.current) return;
    const p = progressRef.current;
    if (p >= 0.99) return;
    const { style, delayMs } = hapticForProgress(p);
    if (DEV) console.log('[MPE][HAPTICS] tick p=%s style=%s', p.toFixed(2), style);
    fireImpact(style).then(() => {
      if (hapticsStoppedRef.current) return;
      hapticsTickTimeoutRef.current = setTimeout(scheduleTick, delayMs);
    });
  }, [fireImpact]);

  const startProgressiveHaptics = useCallback(() => {
    hapticsStoppedRef.current = false;
    lastStepHapticIndexRef.current = -1;
    isIosNative().then((ok) => {
      if (!ok || hapticsStoppedRef.current) return;
      (async () => {
        try {
          const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
          if (Haptics?.impact) await Haptics.impact({ style: ImpactStyle.Light });
          if (DEV) console.log('[MPE][HAPTICS] start');
        } catch {
          // no-op
        }
        if (hapticsStoppedRef.current) return;
        hapticsTickTimeoutRef.current = setTimeout(scheduleTick, 800);
      })();
    });
  }, [scheduleTick]);

  const fireStepCompleteHaptic = useCallback(async (stepIndex: number, totalSteps: number) => {
    if (hapticsStoppedRef.current) return;
    if (lastStepHapticIndexRef.current === stepIndex) return;
    lastStepHapticIndexRef.current = stepIndex;
    if (!(await isIosNative())) return;
    try {
      const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
      if (stepIndex < 2 && Haptics?.selectionChanged) {
        await Haptics.selectionChanged();
      } else if (stepIndex < totalSteps - 1 && Haptics?.impact) {
        await Haptics.impact({ style: ImpactStyle.Medium });
      }
      if (DEV) console.log('[MPE][HAPTICS] stepComplete idx=%s', stepIndex);
    } catch {
      // no-op
    }
  }, []);

  const advance = useCallback(() => {
    const completingIndex = currentIndex;
    setSteps((prev) =>
      prev.map((s, i) => (i === currentIndex ? { ...s, completed: true } : s))
    );
    fireStepCompleteHaptic(completingIndex, steps.length);
    if (currentIndex >= steps.length - 1) {
      if (!hapticsStoppedRef.current) {
        isIosNative().then((ok) => {
          if (!ok) return;
          import('@capacitor/haptics').then(({ Haptics, NotificationType }) => {
            if (Haptics?.notification) Haptics.notification({ type: NotificationType.Success });
            if (DEV) console.log('[MPE][HAPTICS] end success');
          }).catch(() => {});
        });
      }
      onComplete();
      return;
    }
    setCurrentIndex((i) => i + 1);
    setStepProgress(0);
  }, [currentIndex, steps.length, onComplete, fireStepCompleteHaptic]);

  useEffect(() => {
    startProgressiveHaptics();
    return () => stopHaptics();
  }, [startProgressiveHaptics, stopHaptics]);

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

  const handleAbort = useCallback(() => {
    stopHaptics();
    isIosNative().then((ok) => {
      if (!ok) return;
      import('@capacitor/haptics').then(({ Haptics, ImpactStyle }) => {
        if (Haptics?.impact) Haptics.impact({ style: ImpactStyle.Medium });
        if (DEV) console.log('[MPE][HAPTICS] abort');
      }).catch(() => {});
    });
    onAbort();
  }, [onAbort, stopHaptics]);

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
        onClick={handleAbort}
        className="text-sm text-white/85 underline hover:text-white"
      >
        {t('mission_profile_engine_abort_scan')}
      </button>
    </div>
  );
};
