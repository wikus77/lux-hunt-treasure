// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import { motion } from 'framer-motion';
import { useEffect } from 'react';

interface ShieldBubble2DProps {
  targetLatLng: [number, number];
  onEnd?: () => void;
}

export function ShieldBubble2D({ targetLatLng, onEnd }: ShieldBubble2DProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onEnd?.();
    }, 2500);

    return () => clearTimeout(timer);
  }, [onEnd]);

  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center" style={{ zIndex: 1000 }}>
      <motion.div
        className="absolute rounded-full border-4 border-primary bg-primary/10"
        style={{ width: 120, height: 120 }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{
          scale: [0, 1.2, 1, 1.1, 1],
          opacity: [0, 0.8, 0.6, 0.4, 0],
        }}
        transition={{ duration: 2.5, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute rounded-full bg-primary/20"
        style={{ width: 100, height: 100 }}
        animate={{
          scale: [1, 1.05, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 1, repeat: 2, ease: 'easeInOut' }}
      />
    </div>
  );
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
