/**
 * COMMIT RITUAL — Core ritual component
 * Gesture engine, visual progression, haptics, copy text
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import './commit-node.css';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

interface CommitRitualProps {
  onComplete: (durationMs: number) => void;
  onFail: (durationMs: number) => void;
  disabled?: boolean;
}

type RitualPhase = 'idle' | 'phase1' | 'phase2' | 'phase3' | 'completing' | 'complete' | 'failed';

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

const TOTAL_DURATION_MS = 7000;
const PHASE1_END = 2000;
const PHASE2_END = 5000;
const PHASE3_END = 7000;

// ═══════════════════════════════════════════════════════════════════════════════
// HAPTICS (Capacitor with fallback)
// ═══════════════════════════════════════════════════════════════════════════════

const triggerHaptic = async (style: ImpactStyle) => {
  try {
    if (typeof Haptics !== 'undefined' && Haptics.impact) {
      await Haptics.impact({ style });
    }
  } catch {
    // Silent fallback - haptics not available
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// EASING FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

const easeOutQuart = (t: number): number => 1 - Math.pow(1 - t, 4);
const easeInOutSine = (t: number): number => -(Math.cos(Math.PI * t) - 1) / 2;

const addMicroJitter = (value: number, intensity: number = 0.015): number => {
  const noise = (Math.random() - 0.5) * intensity;
  return value + noise;
};

// ═══════════════════════════════════════════════════════════════════════════════
// FINGERPRINT SVG (Large, for ritual)
// ═══════════════════════════════════════════════════════════════════════════════

const FingerprintLargeSVG: React.FC<{ opacity: number; scale: number }> = ({ opacity, scale }) => (
  <svg
    viewBox="0 0 64 64"
    width="120"
    height="120"
    style={{ 
      opacity, 
      transform: `scale(${scale})`,
      transition: 'opacity 0.3s ease, transform 0.3s ease',
    }}
  >
    <g fill="none" stroke="rgba(0, 255, 255, 0.6)" strokeWidth="1" strokeLinecap="round">
      <path d="M32 28c0 4 2 8 0 12" />
      <path d="M28 26c-2 6 0 14 4 16" />
      <path d="M36 26c2 6 0 14 -4 16" />
      <path d="M24 24c-4 8 -2 18 8 22" />
      <path d="M40 24c4 8 2 18 -8 22" />
      <path d="M20 22c-6 10 -2 22 12 26" />
      <path d="M44 22c6 10 2 22 -12 26" />
      <path d="M18 20c-4 6 -4 16 2 24" opacity="0.5" />
      <path d="M46 20c4 6 4 16 -2 24" opacity="0.5" />
      <path d="M16 18c-5 8 -4 20 4 28" opacity="0.3" />
      <path d="M48 18c5 8 4 20 -4 28" opacity="0.3" />
    </g>
  </svg>
);

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export const CommitRitual: React.FC<CommitRitualProps> = ({
  onComplete,
  onFail,
  disabled = false,
}) => {
  const [phase, setPhase] = useState<RitualPhase>('idle');
  const [progress, setProgress] = useState(0);
  const [ringScale, setRingScale] = useState(1);
  const [glowIntensity, setGlowIntensity] = useState(0);
  const [secondRingOpacity, setSecondRingOpacity] = useState(0);
  const [fingerprintOpacity, setFingerprintOpacity] = useState(0.15);
  const [fingerprintScale, setFingerprintScale] = useState(0.9);
  const [showHoldText, setShowHoldText] = useState(false);
  const [resultText, setResultText] = useState<'success' | 'fail' | null>(null);
  const [showFlash, setShowFlash] = useState(false);

  const startTimeRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);
  const isPressing = useRef(false);
  const phase3HapticFired = useRef(false);
  const holdTextTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ─────────────────────────────────────────────────────────────────────────────
  // ANIMATION LOOP
  // ─────────────────────────────────────────────────────────────────────────────

  const animate = useCallback(() => {
    if (!isPressing.current) return;

    const elapsed = performance.now() - startTimeRef.current;
    const rawProgress = Math.min(elapsed / TOTAL_DURATION_MS, 1);

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
    // PHASE-DEPENDENT VISUALS
    // ═══════════════════════════════════════════════════════════════════════════

    if (currentPhase === 'phase1') {
      // 0-2s: Ring accensione, fingerprint emerge
      const phaseProgress = elapsed / PHASE1_END;
      const easedProgress = easeOutQuart(phaseProgress) * 0.2;
      setProgress(addMicroJitter(easedProgress));
      setRingScale(1 + easedProgress * 0.3);
      setGlowIntensity(easedProgress * 0.3);
      setFingerprintOpacity(0.15 + phaseProgress * 0.25);
      setFingerprintScale(0.9 + phaseProgress * 0.1);
    } else if (currentPhase === 'phase2') {
      // 2-5s: Non-linear progression, micro-jitter
      const phaseProgress = (elapsed - PHASE1_END) / (PHASE2_END - PHASE1_END);
      const easedProgress = 0.2 + easeInOutSine(phaseProgress) * 0.35;
      setProgress(addMicroJitter(easedProgress, 0.02));
      setRingScale(1 + easedProgress * 0.5);
      setGlowIntensity(easedProgress * 0.5);
      setFingerprintOpacity(0.4 + phaseProgress * 0.1);
      setFingerprintScale(1 + phaseProgress * 0.05);
    } else if (currentPhase === 'phase3') {
      // 5-7s: Cyan → cyan+white shift, second ring, tension
      const phaseProgress = (elapsed - PHASE2_END) / (PHASE3_END - PHASE2_END);
      const easedProgress = 0.55 + easeOutQuart(phaseProgress) * 0.45;

      // Fire haptic at phase3 start
      if (!phase3HapticFired.current) {
        phase3HapticFired.current = true;
        triggerHaptic(ImpactStyle.Light);
      }

      setProgress(addMicroJitter(easedProgress, 0.01));
      setRingScale(1 + easedProgress * 0.8);
      setGlowIntensity(0.5 + phaseProgress * 0.5);
      setSecondRingOpacity(phaseProgress * 0.7);
      setFingerprintOpacity(0.5 + phaseProgress * 0.3);
      setFingerprintScale(1.05 + phaseProgress * 0.1);
    } else if (currentPhase === 'completing') {
      // 7s reached - SUCCESS
      isPressing.current = false;
      setPhase('complete');
      triggerHaptic(ImpactStyle.Medium);

      // Clear hold text
      setShowHoldText(false);
      if (holdTextTimeoutRef.current) {
        clearTimeout(holdTextTimeoutRef.current);
      }

      // Implosion + flash
      setShowFlash(true);
      setTimeout(() => {
        setShowFlash(false);
        setRingScale(1);
        setGlowIntensity(0.2);
        setSecondRingOpacity(0);
        setFingerprintOpacity(0.6);
        setFingerprintScale(1);
      }, 350);

      // Show result
      setTimeout(() => setResultText('success'), 400);

      onComplete(Math.round(elapsed));
      return;
    }

    rafRef.current = requestAnimationFrame(animate);
  }, [onComplete]);

  // ─────────────────────────────────────────────────────────────────────────────
  // GESTURE HANDLERS
  // ─────────────────────────────────────────────────────────────────────────────

  const handlePressStart = useCallback((e: React.PointerEvent) => {
    if (disabled || phase === 'complete' || phase === 'completing') return;
    if (isPressing.current) return;

    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    isPressing.current = true;
    startTimeRef.current = performance.now();
    phase3HapticFired.current = false;

    setPhase('phase1');
    setProgress(0);
    setRingScale(1);
    setGlowIntensity(0);
    setSecondRingOpacity(0);
    setResultText(null);
    setShowFlash(false);

    // Haptic at T=0
    triggerHaptic(ImpactStyle.Light);

    // Show "Non rilasciare." after 1s
    holdTextTimeoutRef.current = setTimeout(() => {
      if (isPressing.current) {
        setShowHoldText(true);
      }
    }, 1000);

    rafRef.current = requestAnimationFrame(animate);
  }, [disabled, phase, animate]);

  const handlePressEnd = useCallback((e: React.PointerEvent) => {
    if (!isPressing.current) return;

    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}

    const elapsed = performance.now() - startTimeRef.current;
    isPressing.current = false;

    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    // Clear hold text timeout
    if (holdTextTimeoutRef.current) {
      clearTimeout(holdTextTimeoutRef.current);
      holdTextTimeoutRef.current = null;
    }
    setShowHoldText(false);

    if (phase !== 'complete' && phase !== 'completing') {
      setPhase('failed');
      triggerHaptic(ImpactStyle.Light);

      // Show fail result
      setResultText('fail');

      // Reset visuals softly
      setTimeout(() => {
        setProgress(0);
        setRingScale(1);
        setGlowIntensity(0);
        setSecondRingOpacity(0);
        setFingerprintOpacity(0.15);
        setFingerprintScale(0.9);
        setPhase('idle');
      }, 1500);

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
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (holdTextTimeoutRef.current) clearTimeout(holdTextTimeoutRef.current);
    };
  }, []);

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────────

  const isActive = phase !== 'idle' && phase !== 'complete' && phase !== 'failed';
  const glowColor = glowIntensity > 0.5 
    ? `rgba(${180 + glowIntensity * 75}, 255, 255, ${glowIntensity})` // cyan → cyan+white
    : `rgba(0, 255, 255, ${glowIntensity})`;

  return (
    <div
      className="commit-node-container"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        minHeight: '450px',
        background: '#000000',
      }}
    >
      {/* Title */}
      <motion.div
        animate={{ opacity: phase === 'idle' || phase === 'failed' ? 0.8 : 0.4 }}
        style={{
          position: 'absolute',
          top: '12%',
          color: 'rgba(255, 255, 255, 0.8)',
          fontSize: '18px',
          fontWeight: 600,
          letterSpacing: '4px',
          textTransform: 'uppercase',
        }}
      >
        COMMIT
      </motion.div>

      {/* Main ritual node */}
      <div
        onPointerDown={handlePressStart}
        onPointerUp={handlePressEnd}
        onPointerCancel={handlePressCancel}
        onPointerLeave={handlePressCancel}
        className={showFlash ? 'commit-implosion' : ''}
        style={{
          position: 'relative',
          width: '200px',
          height: '200px',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.5 : 1,
        }}
      >
        {/* Second ring (shadow, phase 3) */}
        <motion.div
          animate={{
            scale: ringScale * 1.2,
            opacity: secondRingOpacity * 0.4,
          }}
          transition={{ duration: 0.1, ease: 'linear' }}
          style={{
            position: 'absolute',
            inset: '-25px',
            borderRadius: '50%',
            border: '2px solid rgba(0, 255, 255, 0.15)',
            boxShadow: `0 0 ${50 * secondRingOpacity}px rgba(0, 255, 255, 0.1)`,
          }}
        />

        {/* Main ring */}
        <motion.div
          animate={{
            scale: ringScale,
            boxShadow: `
              0 0 ${20 + glowIntensity * 80}px ${glowColor},
              0 0 ${40 + glowIntensity * 120}px rgba(0, 255, 255, ${glowIntensity * 0.4}),
              inset 0 0 ${15 + glowIntensity * 40}px rgba(0, 255, 255, ${glowIntensity * 0.25})
            `,
          }}
          transition={{ duration: 0.1, ease: 'linear' }}
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            border: `2px solid rgba(0, 255, 255, ${0.3 + glowIntensity * 0.5})`,
            background: 'radial-gradient(circle at 30% 30%, #0a1520 0%, #000000 100%)',
          }}
        />

        {/* Fingerprint */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          <FingerprintLargeSVG opacity={fingerprintOpacity} scale={fingerprintScale} />
        </div>

        {/* Center flash (success) */}
        {showFlash && (
          <div
            className="commit-flash"
            style={{
              position: 'absolute',
              inset: '20px',
              borderRadius: '50%',
              pointerEvents: 'none',
            }}
          />
        )}

        {/* Progress arc */}
        <svg
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            transform: 'rotate(-90deg)',
            pointerEvents: 'none',
          }}
        >
          <circle
            cx="100"
            cy="100"
            r="95"
            fill="none"
            stroke="rgba(0, 255, 255, 0.08)"
            strokeWidth="2"
          />
          <motion.circle
            cx="100"
            cy="100"
            r="95"
            fill="none"
            stroke={glowColor}
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

      {/* Hold instruction */}
      <AnimatePresence>
        {showHoldText && !resultText && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 0.6, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            style={{
              position: 'absolute',
              bottom: '22%',
              color: 'rgba(255, 255, 255, 0.6)',
              fontSize: '14px',
              fontWeight: 400,
              letterSpacing: '2px',
            }}
          >
            Non rilasciare.
          </motion.div>
        )}
      </AnimatePresence>

      {/* Result text */}
      <AnimatePresence>
        {resultText && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            style={{
              position: 'absolute',
              bottom: '20%',
              color: resultText === 'success' 
                ? 'rgba(0, 255, 255, 0.9)' 
                : 'rgba(255, 100, 100, 0.7)',
              fontSize: '16px',
              fontWeight: 600,
              letterSpacing: '3px',
              textTransform: 'uppercase',
            }}
          >
            {resultText === 'success' ? 'ACCETTATO.' : 'RIFIUTATO.'}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CommitRitual;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
