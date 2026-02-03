/**
 * COMMIT NODES CONTAINER — 3→1 Merge on Slow Scroll
 * Gate modal only in "one" mode + iOS proximity + M1SSION haptic signature
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { CommitNodeTrigger } from './CommitNodeTrigger';
import { CommitNodeSide } from './CommitNodeSide';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

type MergeMode = 'three' | 'one';

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

const SLOW_SCROLL_THRESHOLD = 0.25;    // px/ms - below this = slow
const FAST_SCROLL_THRESHOLD = 0.9;     // px/ms - above this = fast (force three)
const SLOW_ACCUM_THRESHOLD = 120;      // px accumulated slow scroll before merge
const EMA_ALPHA = 0.15;                // EMA smoothing factor
const SCROLL_IDLE_TIMEOUT = 120;       // ms before considering scroll stopped

// Proximity zones (px from center)
const PROXIMITY_ZONE_1 = 45;           // Very near → intensity 1.0
const PROXIMITY_ZONE_2 = 90;           // Near → intensity 0.6
const PROXIMITY_ZONE_3 = 140;          // Far → intensity 0.25

// ═══════════════════════════════════════════════════════════════════════════════
// M1SSION HAPTIC SIGNATURE — Unique pattern for 3→1 fusion
// ═══════════════════════════════════════════════════════════════════════════════

async function m1ssionHapticSignatureFuse(): Promise<void> {
  try {
    // Lazy import Capacitor Haptics (doesn't break web build)
    const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
    
    // T=0ms → light (⚡ "ti ho sentito")
    await Haptics.impact({ style: ImpactStyle.Light });
    
    // T=90ms → medium (🧠 "lock-in")
    await new Promise(r => setTimeout(r, 90));
    await Haptics.impact({ style: ImpactStyle.Medium });
    
    // T=210ms → light (🔒 "sigillo")
    await new Promise(r => setTimeout(r, 120));
    await Haptics.impact({ style: ImpactStyle.Light });
    
    // T=330ms → vibrate brief (🌐 "energia")
    await new Promise(r => setTimeout(r, 120));
    try {
      await Haptics.vibrate({ duration: 45 });
    } catch {
      // iOS may not support vibrate - fallback to impact
      await Haptics.impact({ style: ImpactStyle.Light });
    }
    
    // T=430ms → heavy (⚫ "implosione" — final)
    await new Promise(r => setTimeout(r, 100));
    await Haptics.impact({ style: ImpactStyle.Heavy });
    
  } catch {
    // Haptics not available (web/unsupported device) - silent no-op
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export const CommitNodesContainer: React.FC = () => {
  const [mode, setMode] = useState<MergeMode>('three');
  const [proximityIntensity, setProximityIntensity] = useState(0);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const centerRef = useRef<HTMLDivElement>(null);
  
  // Scroll tracking refs (avoid state updates on every frame)
  const lastScrollY = useRef(0);
  const lastTime = useRef(performance.now());
  const emaVelocity = useRef(0);
  const slowAccum = useRef(0);
  const rafId = useRef<number | null>(null);
  const pendingModeChange = useRef<MergeMode | null>(null);
  
  // Anti-scroll gating for proximity
  const isScrollingRef = useRef(false);
  const scrollIdleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Haptic debounce - only fire once per fusion
  const didFuseHapticRef = useRef(false);
  const prevModeRef = useRef<MergeMode>('three');

  // ═══════════════════════════════════════════════════════════════════════════
  // HAPTIC TRIGGER ON MODE CHANGE (3→1 only)
  // ═══════════════════════════════════════════════════════════════════════════

  useEffect(() => {
    // Detect transition: three → one
    if (prevModeRef.current === 'three' && mode === 'one') {
      if (!didFuseHapticRef.current) {
        didFuseHapticRef.current = true;
        m1ssionHapticSignatureFuse();
      }
    }
    
    // Reset haptic flag when going back to three
    if (mode === 'three') {
      didFuseHapticRef.current = false;
    }
    
    prevModeRef.current = mode;
  }, [mode]);

  // ═══════════════════════════════════════════════════════════════════════════
  // SCROLL DETECTION LOGIC
  // ═══════════════════════════════════════════════════════════════════════════

  const processScroll = useCallback(() => {
    const now = performance.now();
    const currentScrollY = window.scrollY;
    const dt = now - lastTime.current;
    
    if (dt < 16) {
      rafId.current = requestAnimationFrame(processScroll);
      return;
    }
    
    const dy = currentScrollY - lastScrollY.current;
    const velocity = Math.abs(dy) / dt;
    
    // EMA smoothing
    emaVelocity.current = emaVelocity.current * (1 - EMA_ALPHA) + velocity * EMA_ALPHA;
    
    // Update refs
    lastScrollY.current = currentScrollY;
    lastTime.current = now;
    
    // Mark as scrolling (for proximity anti-scroll gating)
    isScrollingRef.current = true;
    if (scrollIdleTimer.current) {
      clearTimeout(scrollIdleTimer.current);
    }
    scrollIdleTimer.current = setTimeout(() => {
      isScrollingRef.current = false;
    }, SCROLL_IDLE_TIMEOUT);
    
    // Determine mode based on scroll behavior
    let newMode: MergeMode = pendingModeChange.current || mode;
    
    // Scroll UP → force three
    if (dy < -2) {
      slowAccum.current = 0;
      newMode = 'three';
    }
    // Fast scroll → force three
    else if (emaVelocity.current > FAST_SCROLL_THRESHOLD) {
      slowAccum.current = 0;
      newMode = 'three';
    }
    // Slow scroll DOWN → accumulate toward merge
    else if (dy > 0 && emaVelocity.current < SLOW_SCROLL_THRESHOLD) {
      slowAccum.current += dy;
      if (slowAccum.current > SLOW_ACCUM_THRESHOLD) {
        newMode = 'one';
      }
    }
    // Medium speed or stopped
    else if (Math.abs(dy) < 1) {
      // Stopped - keep current mode
    } else {
      slowAccum.current = Math.max(0, slowAccum.current - 5);
    }
    
    // Only update state if mode actually changed
    if (newMode !== mode && pendingModeChange.current !== newMode) {
      pendingModeChange.current = newMode;
      setMode(newMode);
    }
    
    rafId.current = requestAnimationFrame(processScroll);
  }, [mode]);

  // ═══════════════════════════════════════════════════════════════════════════
  // SCROLL LISTENER SETUP
  // ═══════════════════════════════════════════════════════════════════════════

  useEffect(() => {
    lastScrollY.current = window.scrollY;
    lastTime.current = performance.now();
    
    const handleScroll = () => {
      if (rafId.current === null) {
        rafId.current = requestAnimationFrame(processScroll);
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
        rafId.current = null;
      }
      if (scrollIdleTimer.current) {
        clearTimeout(scrollIdleTimer.current);
      }
    };
  }, [processScroll]);

  // Reset pending mode change after state update
  useEffect(() => {
    pendingModeChange.current = null;
  }, [mode]);

  // ═══════════════════════════════════════════════════════════════════════════
  // iOS PROXIMITY DETECTION (touchstart + touchmove + anti-scroll gating)
  // ═══════════════════════════════════════════════════════════════════════════

  useEffect(() => {
    let proximityRafId: number | null = null;
    let pendingIntensity = 0;
    
    const calculateIntensity = (distance: number): number => {
      if (distance < PROXIMITY_ZONE_1) return 1.0;
      if (distance < PROXIMITY_ZONE_2) return 0.6;
      if (distance < PROXIMITY_ZONE_3) return 0.25;
      return 0;
    };
    
    const updateProximity = (touch: Touch) => {
      if (!centerRef.current) return;
      if (mode !== 'one') return;
      if (isScrollingRef.current) {
        // Anti-scroll gating: ease intensity to 0 during scroll
        if (proximityIntensity > 0) {
          pendingIntensity = 0;
          if (proximityRafId === null) {
            proximityRafId = requestAnimationFrame(() => {
              setProximityIntensity(0);
              proximityRafId = null;
            });
          }
        }
        return;
      }
      
      const rect = centerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const distance = Math.sqrt(
        Math.pow(touch.clientX - centerX, 2) + 
        Math.pow(touch.clientY - centerY, 2)
      );
      
      const newIntensity = calculateIntensity(distance);
      
      // Only update if intensity changed significantly
      if (Math.abs(newIntensity - pendingIntensity) > 0.05) {
        pendingIntensity = newIntensity;
        if (proximityRafId === null) {
          proximityRafId = requestAnimationFrame(() => {
            setProximityIntensity(pendingIntensity);
            proximityRafId = null;
          });
        }
      }
    };
    
    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (touch) updateProximity(touch);
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (touch) updateProximity(touch);
    };
    
    const handleTouchEnd = () => {
      // Ease back to 0 on touch end
      pendingIntensity = 0;
      if (proximityRafId === null) {
        proximityRafId = requestAnimationFrame(() => {
          setProximityIntensity(0);
          proximityRafId = null;
        });
      }
    };
    
    // Use passive listeners where possible
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });
    document.addEventListener('touchcancel', handleTouchEnd, { passive: true });
    
    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('touchcancel', handleTouchEnd);
      if (proximityRafId !== null) {
        cancelAnimationFrame(proximityRafId);
      }
    };
  }, [mode, proximityIntensity]);

  // Reset proximity when mode changes to three
  useEffect(() => {
    if (mode === 'three') {
      setProximityIntensity(0);
    }
  }, [mode]);

  // ═══════════════════════════════════════════════════════════════════════════
  // COMPUTED STYLES FROM PROXIMITY
  // ═══════════════════════════════════════════════════════════════════════════

  const proximityScale = 1 + (proximityIntensity * 0.06); // Max 1.06
  const proximityGlow = proximityIntensity * 0.5; // Max 0.5 opacity
  const proximityBreathSpeed = 3 - (proximityIntensity * 1.5); // Faster when closer

  // ═══════════════════════════════════════════════════════════════════════════
  // ANIMATION VARIANTS
  // ═══════════════════════════════════════════════════════════════════════════

  const leftVariants = {
    three: {
      x: 0,
      scale: 1,
      opacity: 1,
      transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
    },
    one: {
      x: 63,
      scale: 0.1,
      opacity: 0,
      transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] }
    }
  };

  const rightVariants = {
    three: {
      x: 0,
      scale: 1,
      opacity: 1,
      transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
    },
    one: {
      x: -63,
      scale: 0.1,
      opacity: 0,
      transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] }
    }
  };

  const centerVariants = {
    three: {
      scale: 1,
      transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] }
    },
    one: {
      scale: 1.15,
      transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════

  return (
    <div 
      ref={containerRef}
      className="commit-node-slot"
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '16px',
        marginTop: '-46px',
        marginBottom: '8px',
        position: 'relative',
      }}
    >
      {/* Left AION - Collapses to center on merge */}
      <motion.div
        variants={leftVariants}
        animate={mode}
        style={{
          pointerEvents: mode === 'one' ? 'none' : 'auto',
          willChange: 'transform, opacity',
        }}
      >
        <CommitNodeSide />
      </motion.div>
      
      {/* Center AION — GATE: clickable ONLY in "one" mode */}
      <motion.div
        ref={centerRef}
        variants={centerVariants}
        animate={mode}
        style={{
          willChange: 'transform',
          zIndex: 10,
          position: 'relative',
        }}
      >
        {/* Proximity glow effect (only in "one" mode) */}
        {mode === 'one' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: 0.3 + proximityGlow,
              scale: [1, 1.05, 1],
            }}
            transition={{
              opacity: { duration: 0.2 },
              scale: { 
                duration: proximityBreathSpeed, 
                repeat: Infinity, 
                ease: 'easeInOut' 
              }
            }}
            style={{
              position: 'absolute',
              inset: '-20px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(0,209,255,0.4) 0%, transparent 70%)',
              filter: `blur(${15 + proximityIntensity * 10}px)`,
              pointerEvents: 'none',
              zIndex: -1,
            }}
          />
        )}
        
        {/* 
          GATE WRAPPER: 
          - mode="three" → pointerEvents: none (no click, no modal)
          - mode="one" → pointerEvents: auto (click opens modal)
        */}
        <div
          style={{
            pointerEvents: mode === 'one' ? 'auto' : 'none',
            transform: mode === 'one' ? `scale(${proximityScale})` : 'scale(1)',
            transition: 'transform 0.15s ease-out',
          }}
        >
          <CommitNodeTrigger />
        </div>
        
        {/* Micro visual feedback in "three" mode (pulse on tap area) */}
        {mode === 'three' && (
          <motion.div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              border: '2px solid rgba(0,209,255,0.15)',
              pointerEvents: 'none',
            }}
            animate={{
              opacity: [0.3, 0.6, 0.3],
              scale: [1, 1.02, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        )}
      </motion.div>
      
      {/* Right AION - Collapses to center on merge */}
      <motion.div
        variants={rightVariants}
        animate={mode}
        style={{
          pointerEvents: mode === 'one' ? 'none' : 'auto',
          willChange: 'transform, opacity',
        }}
      >
        <CommitNodeSide />
      </motion.div>
    </div>
  );
};

export default CommitNodesContainer;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
