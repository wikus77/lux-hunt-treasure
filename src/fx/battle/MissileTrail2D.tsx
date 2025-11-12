// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import { motion } from 'framer-motion';
import { useEffect } from 'react';

interface MissileTrail2DProps {
  fromLatLng: [number, number];
  toLatLng: [number, number];
  onEnd?: () => void;
}

export function MissileTrail2D({ fromLatLng, toLatLng, onEnd }: MissileTrail2DProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onEnd?.();
    }, 1500);

    return () => clearTimeout(timer);
  }, [onEnd]);

  // Simple line animation from point A to B
  // In real integration, you'd convert lat/lng to screen coordinates
  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      style={{ width: '100%', height: '100%', zIndex: 1000 }}
    >
      <motion.line
        x1="30%"
        y1="30%"
        x2="70%"
        y2="70%"
        stroke="hsl(var(--destructive))"
        strokeWidth="3"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: [0, 1, 0.5, 0] }}
        transition={{ duration: 1.5, ease: 'easeInOut' }}
      />
      <motion.circle
        cx="70%"
        cy="70%"
        r="4"
        fill="hsl(var(--destructive))"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [0, 1.5, 0], opacity: [0, 1, 0] }}
        transition={{ duration: 0.5, delay: 1, ease: 'easeOut' }}
      />
    </svg>
  );
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
