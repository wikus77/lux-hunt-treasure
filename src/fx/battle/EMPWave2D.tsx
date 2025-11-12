// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import { motion } from 'framer-motion';
import { useEffect } from 'react';

interface EMPWave2DProps {
  centerLatLng: [number, number];
  onEnd?: () => void;
}

export function EMPWave2D({ centerLatLng, onEnd }: EMPWave2DProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onEnd?.();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onEnd]);

  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center" style={{ zIndex: 1000 }}>
      <motion.div
        className="absolute rounded-full border-4 border-primary"
        initial={{ width: 0, height: 0, opacity: 0.8 }}
        animate={{
          width: ['0px', '200px', '400px'],
          height: ['0px', '200px', '400px'],
          opacity: [0.8, 0.5, 0],
        }}
        transition={{ duration: 2, ease: 'easeOut' }}
      />
      <motion.div
        className="absolute rounded-full border-2 border-primary"
        initial={{ width: 0, height: 0, opacity: 0.6 }}
        animate={{
          width: ['0px', '150px', '300px'],
          height: ['0px', '150px', '300px'],
          opacity: [0.6, 0.3, 0],
        }}
        transition={{ duration: 2, delay: 0.2, ease: 'easeOut' }}
      />
    </div>
  );
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
