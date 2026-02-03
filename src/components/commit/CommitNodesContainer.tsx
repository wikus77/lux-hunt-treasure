/**
 * COMMIT NODES CONTAINER — 3→1 Merge on Slow Scroll
 * Handles scroll-based animation: 3 entities merge into 1 on slow downward scroll
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
const PROXIMITY_NEAR = 90;             // px - first proximity zone
const PROXIMITY_VERY_NEAR = 45;        // px - second proximity zone

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export const CommitNodesContainer: React.FC = () => {
  const [mode, setMode] = useState<MergeMode>('three');
  const [proximityScale, setProximityScale] = useState(1);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const centerRef = useRef<HTMLDivElement>(null);
  
  // Scroll tracking refs (avoid state updates on every frame)
  const lastScrollY = useRef(0);
  const lastTime = useRef(performance.now());
  const emaVelocity = useRef(0);
  const slowAccum = useRef(0);
  const rafId = useRef<number | null>(null);
  const pendingModeChange = useRef<MergeMode | null>(null);

  // ═══════════════════════════════════════════════════════════════════════════
  // SCROLL DETECTION LOGIC
  // ═══════════════════════════════════════════════════════════════════════════

  const processScroll = useCallback(() => {
    const now = performance.now();
    const currentScrollY = window.scrollY;
    const dt = now - lastTime.current;
    
    if (dt < 16) {
      // Skip if less than ~1 frame
      rafId.current = requestAnimationFrame(processScroll);
      return;
    }
    
    const dy = currentScrollY - lastScrollY.current;
    const velocity = Math.abs(dy) / dt; // px/ms
    
    // EMA smoothing
    emaVelocity.current = emaVelocity.current * (1 - EMA_ALPHA) + velocity * EMA_ALPHA;
    
    // Update refs
    lastScrollY.current = currentScrollY;
    lastTime.current = now;
    
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
    // Medium speed or stopped → decay accumulator slowly
    else if (Math.abs(dy) < 1) {
      // Stopped - keep current mode
    } else {
      // Medium speed - slight decay
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
    };
  }, [processScroll]);

  // Reset pending mode change after state update
  useEffect(() => {
    pendingModeChange.current = null;
  }, [mode]);

  // ═══════════════════════════════════════════════════════════════════════════
  // TOUCH PROXIMITY DETECTION (simulated hover for mobile)
  // ═══════════════════════════════════════════════════════════════════════════

  useEffect(() => {
    let proximityRafId: number | null = null;
    let resetTimeout: ReturnType<typeof setTimeout> | null = null;
    
    const handleTouchStart = (e: TouchEvent) => {
      if (!centerRef.current || mode !== 'one') return;
      
      const touch = e.touches[0];
      if (!touch) return;
      
      const rect = centerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const distance = Math.sqrt(
        Math.pow(touch.clientX - centerX, 2) + 
        Math.pow(touch.clientY - centerY, 2)
      );
      
      // Clear any existing reset timeout
      if (resetTimeout) {
        clearTimeout(resetTimeout);
        resetTimeout = null;
      }
      
      // Apply proximity scale via RAF
      if (proximityRafId === null) {
        proximityRafId = requestAnimationFrame(() => {
          if (distance < PROXIMITY_VERY_NEAR) {
            setProximityScale(1.06);
          } else if (distance < PROXIMITY_NEAR) {
            setProximityScale(1.03);
          }
          proximityRafId = null;
        });
      }
      
      // Reset after 600ms
      resetTimeout = setTimeout(() => {
        setProximityScale(1);
      }, 600);
    };
    
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      if (proximityRafId !== null) {
        cancelAnimationFrame(proximityRafId);
      }
      if (resetTimeout) {
        clearTimeout(resetTimeout);
      }
    };
  }, [mode]);

  // ═══════════════════════════════════════════════════════════════════════════
  // ANIMATION VARIANTS
  // ═══════════════════════════════════════════════════════════════════════════

  const sideVariants = {
    three: {
      x: 0,
      scale: 1,
      opacity: 1,
      transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
    },
    one: {
      x: 0,
      scale: 0.1,
      opacity: 0,
      transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] }
    }
  };

  const leftVariants = {
    three: {
      x: 0,
      scale: 1,
      opacity: 1,
      transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
    },
    one: {
      x: 63, // Move toward center (half of gap + half width adjustment)
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
      x: -63, // Move toward center
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
      
      {/* Center AION - Always clickable, grows on merge */}
      <motion.div
        ref={centerRef}
        variants={centerVariants}
        animate={mode}
        style={{
          transform: `scale(${proximityScale})`,
          willChange: 'transform',
          zIndex: 10,
        }}
      >
        {/* Glow effect when merged */}
        {mode === 'one' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'absolute',
              inset: '-20px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(0,209,255,0.3) 0%, transparent 70%)',
              filter: 'blur(15px)',
              pointerEvents: 'none',
              zIndex: -1,
            }}
          />
        )}
        <CommitNodeTrigger />
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
