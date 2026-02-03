/**
 * COMMIT RITUAL — "THE COMMIT" (7s ritual)
 * Core ritual component: gesture engine, visual progression, haptics
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

interface CommitRitualProps {
  onComplete: (durationMs: number) => void;
  onFail: (durationMs: number) => void;
  disabled?: boolean;
  isFirstTime?: boolean;
}

type RitualPhase = 'idle' | 'phase1' | 'phase2' | 'phase3' | 'completing' | 'complete' | 'failed';

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

const TOTAL_DURATION_MS = 7000; // 7.0 seconds
const PHASE1_END = 2000;        // 0-2s: initial feedback
const PHASE2_END = 5000;        // 2-5s: silent growth
const PHASE3_END = 7000;        // 5-7s: tension

// ═══════════════════════════════════════════════════════════════════════════════
// HAPTICS HELPER (with fallback)
// ═══════════════════════════════════════════════════════════════════════════════

const triggerHaptic = async (type: 'tick' | 'deep' | 'success') => {
  try {
    if (typeof Haptics !== 'undefined' && Haptics.impact) {
      switch (type) {
        case 'tick':
          await Haptics.impact({ style: ImpactStyle.Light });
          break;
        case 'deep':
          await Haptics.impact({ style: ImpactStyle.Heavy });
          break;
        case 'success':
          await Haptics.notification({ type: NotificationType.Success });
          break;
      }
    } else if (typeof navigator !== 'undefined' && navigator.vibrate) {
      // Web fallback
      switch (type) {
        case 'tick':
          navigator.vibrate(10);
          break;
        case 'deep':
          navigator.vibrate([50, 30, 50]);
          break;
        case 'success':
          navigator.vibrate([100, 50, 100]);
          break;
      }
    }
  } catch {
    // Silent fallback - haptics not available
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// EASING FUNCTIONS (non-linear, micro-irregular)
// ═══════════════════════════════════════════════════════════════════════════════

const easeOutQuart = (t: number): number => 1 - Math.pow(1 - t, 4);
const easeInOutSine = (t: number): number => -(Math.cos(Math.PI * t) - 1) / 2;

// Add micro-irregularity for "alive" feeling
const addMicroNoise = (value: number, intensity: number = 0.02): number => {
  const noise = (Math.random() - 0.5) * intensity;
  return value + noise;
};

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export const CommitRitual: React.FC<CommitRitualProps> = ({
  onComplete,
  onFail,
  disabled = false,
  isFirstTime = false,
}) => {
  const [phase, setPhase] = useState<RitualPhase>('idle');
  const [progress, setProgress] = useState(0);
  const [showFirstTimeText, setShowFirstTimeText] = useState(isFirstTime);
  const [showCompletionText, setShowCompletionText] = useState(false);
  const [ringScale, setRingScale] = useState(1);
  const [glowIntensity, setGlowIntensity] = useState(0);
  const [secondRingOpacity, setSecondRingOpacity] = useState(0);
  const [centerGlow, setCenterGlow] = useState(0);

  const startTimeRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);
  const isPressing = useRef(false);
  const phase3HapticFired = useRef(false);

  // ─────────────────────────────────────────────────────────────────────────────
  // ANIMATION LOOP (RAF-based, performance.now())
  // ─────────────────────────────────────────────────────────────────────────────

  const animate = useCallback(() => {
    if (!isPressing.current) return;

    const elapsed = performance.now() - startTimeRef.current;
    const rawProgress = Math.min(elapsed / TOTAL_DURATION_MS, 1);

    // Determine phase
    let currentPhase: RitualPhase = 'phase1';
    if (elapsed >= PHASE3_END) {
      currentPhase = 'completing';
    } else if (elapsed >= PHASE2_END) {
      currentPhase = 'phase3';
    } else if (elapsed >= PHASE1_END) {
      currentPhase = 'phase2';
    }

    setPhase(currentPhase);

    // ═══════════════════════════════════════════════════════════════════════════
    // VISUAL PROGRESSION (non-linear, phase-dependent)
    // ═══════════════════════════════════════════════════════════════════════════

    if (currentPhase === 'phase1') {
      // 0-2s: Micro-resistance, slight ring growth
      const phaseProgress = elapsed / PHASE1_END;
      const easedProgress = easeOutQuart(phaseProgress) * 0.15;
      setProgress(addMicroNoise(easedProgress, 0.01));
      setRingScale(1 + easedProgress * 0.3);
      setGlowIntensity(easedProgress * 0.2);
    } else if (currentPhase === 'phase2') {
      // 2-5s: Silent, non-linear growth with micro-irregularity
      const phaseProgress = (elapsed - PHASE1_END) / (PHASE2_END - PHASE1_END);
      const easedProgress = 0.15 + easeInOutSine(phaseProgress) * 0.35;
      setProgress(addMicroNoise(easedProgress, 0.015));
      setRingScale(1 + easedProgress * 0.5);
      setGlowIntensity(easedProgress * 0.4);
    } else if (currentPhase === 'phase3') {
      // 5-7s: Tension builds, cyan glow, second ring appears
      const phaseProgress = (elapsed - PHASE2_END) / (PHASE3_END - PHASE2_END);
      const easedProgress = 0.5 + easeOutQuart(phaseProgress) * 0.5;
      
      // Fire deep haptic once at phase3 start
      if (!phase3HapticFired.current) {
        phase3HapticFired.current = true;
        triggerHaptic('deep');
      }

      setProgress(addMicroNoise(easedProgress, 0.01));
      setRingScale(1 + easedProgress * 0.8);
      setGlowIntensity(0.4 + phaseProgress * 0.6);
      setSecondRingOpacity(phaseProgress * 0.6);
    } else if (currentPhase === 'completing') {
      // 7s reached - SUCCESS
      isPressing.current = false;
      setPhase('complete');
      triggerHaptic('success');

      // Implosion animation
      setTimeout(() => setCenterGlow(1), 0);
      setTimeout(() => {
        setCenterGlow(0);
        setRingScale(1);
        setGlowIntensity(0);
        setSecondRingOpacity(0);
      }, 400);

      // "Noted." text after 1.2s
      setTimeout(() => setShowCompletionText(true), 1200);
      setTimeout(() => setShowCompletionText(false), 3000);

      onComplete(Math.round(elapsed));
      return;
    }

    rafRef.current = requestAnimationFrame(animate);
  }, [onComplete]);

  // ─────────────────────────────────────────────────────────────────────────────
  // GESTURE HANDLERS (Pointer Events for stability)
  // ─────────────────────────────────────────────────────────────────────────────

  const handlePressStart = useCallback((e: React.PointerEvent) => {
    if (disabled || phase === 'complete' || phase === 'completing') return;

    // Block multi-touch
    if (isPressing.current) return;

    // Capture pointer for reliable tracking
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    isPressing.current = true;
    startTimeRef.current = performance.now();
    phase3HapticFired.current = false;
    
    setShowFirstTimeText(false);
    setPhase('phase1');
    setProgress(0);
    setRingScale(1);
    setGlowIntensity(0);
    setSecondRingOpacity(0);
    setCenterGlow(0);

    // Initial haptic tick
    triggerHaptic('tick');

    rafRef.current = requestAnimationFrame(animate);
  }, [disabled, phase, animate]);

  const handlePressEnd = useCallback((e: React.PointerEvent) => {
    if (!isPressing.current) return;

    // Release pointer capture
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Ignore if already released
    }

    const elapsed = performance.now() - startTimeRef.current;
    isPressing.current = false;

    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    // Only process fail if not already complete
    if (phase !== 'complete' && phase !== 'completing') {
      setPhase('failed');
      
      // Reset visuals silently (no theatrical fail)
      setTimeout(() => {
        setProgress(0);
        setRingScale(1);
        setGlowIntensity(0);
        setSecondRingOpacity(0);
        setCenterGlow(0);
        setPhase('idle');
      }, 300);

      onFail(Math.round(elapsed));
    }
  }, [phase, onFail]);

  const handlePressCancel = useCallback((e: React.PointerEvent) => {
    handlePressEnd(e);
  }, [handlePressEnd]);

  // ─────────────────────────────────────────────────────────────────────────────
  // CLEANUP
  // ─────────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────────

  const isActive = phase !== 'idle' && phase !== 'complete' && phase !== 'failed';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        minHeight: '400px',
        background: '#000000',
        touchAction: 'none',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        WebkitTouchCallout: 'none',
      }}
    >
      {/* First time instruction (only shows once) */}
      <AnimatePresence>
        {showFirstTimeText && phase === 'idle' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            style={{
              position: 'absolute',
              top: '15%',
              color: 'rgba(255, 255, 255, 0.5)',
              fontSize: '14px',
              fontWeight: 300,
              letterSpacing: '2px',
              textTransform: 'uppercase',
            }}
          >
            Commit when ready.
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main ritual circle */}
      <div
        onPointerDown={handlePressStart}
        onPointerUp={handlePressEnd}
        onPointerCancel={handlePressCancel}
        onPointerLeave={handlePressCancel}
        style={{
          position: 'relative',
          width: '200px',
          height: '200px',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.5 : 1,
        }}
      >
        {/* Second ring (shadow, appears in phase 3) */}
        <motion.div
          animate={{
            scale: ringScale * 1.15,
            opacity: secondRingOpacity * 0.4,
          }}
          transition={{ duration: 0.1, ease: 'linear' }}
          style={{
            position: 'absolute',
            inset: '-20px',
            borderRadius: '50%',
            border: '2px solid rgba(0, 255, 255, 0.2)',
            boxShadow: `0 0 ${40 * secondRingOpacity}px rgba(0, 255, 255, 0.15)`,
          }}
        />

        {/* Main ring */}
        <motion.div
          animate={{
            scale: ringScale,
            boxShadow: `
              0 0 ${20 + glowIntensity * 60}px rgba(0, 255, 255, ${glowIntensity * 0.5}),
              0 0 ${40 + glowIntensity * 100}px rgba(0, 255, 255, ${glowIntensity * 0.3}),
              inset 0 0 ${10 + glowIntensity * 30}px rgba(0, 255, 255, ${glowIntensity * 0.2})
            `,
          }}
          transition={{ duration: 0.1, ease: 'linear' }}
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            border: `2px solid rgba(0, 255, 255, ${0.2 + glowIntensity * 0.6})`,
            background: 'transparent',
          }}
        />

        {/* Center (stays black, glows only on completion) */}
        <motion.div
          animate={{
            background: centerGlow > 0 
              ? `radial-gradient(circle, rgba(0, 255, 255, ${centerGlow * 0.8}) 0%, rgba(0, 0, 0, 1) 70%)`
              : 'radial-gradient(circle, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 1) 100%)',
          }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          style={{
            position: 'absolute',
            inset: '30px',
            borderRadius: '50%',
          }}
        />

        {/* Progress arc (subtle, non-linear) */}
        <svg
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            transform: 'rotate(-90deg)',
          }}
        >
          <circle
            cx="100"
            cy="100"
            r="95"
            fill="none"
            stroke="rgba(0, 255, 255, 0.1)"
            strokeWidth="2"
          />
          <motion.circle
            cx="100"
            cy="100"
            r="95"
            fill="none"
            stroke={`rgba(0, 255, 255, ${0.3 + glowIntensity * 0.5})`}
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 95}
            animate={{
              strokeDashoffset: 2 * Math.PI * 95 * (1 - progress),
            }}
            transition={{ duration: 0.1, ease: 'linear' }}
          />
        </svg>
      </div>

      {/* Completion text */}
      <AnimatePresence>
        {showCompletionText && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 0.7, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            style={{
              position: 'absolute',
              bottom: '20%',
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '16px',
              fontWeight: 300,
              letterSpacing: '3px',
              textTransform: 'uppercase',
            }}
          >
            Noted.
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CommitRitual;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
