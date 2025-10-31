// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface EvolutionOverlayProps {
  theme: string;
  level: number;
  message: string;
}

export function EvolutionOverlay({ theme, level, message }: EvolutionOverlayProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 2500);
    return () => clearTimeout(timer);
  }, [theme, level]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none z-50"
        >
          <div className="bg-background/90 backdrop-blur-sm border border-primary/30 rounded-2xl p-8 shadow-2xl max-w-md text-center">
            <motion.div
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{ duration: 1, ease: "easeInOut" }}
              className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-cyan-400 to-violet-600 flex items-center justify-center"
            >
              <span className="text-3xl font-bold text-white">{level}</span>
            </motion.div>
            <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-violet-600 bg-clip-text text-transparent">
              DNA Evolutivo
            </h2>
            <p className="text-lg text-muted-foreground mb-1">
              {theme} • Livello {level}
            </p>
            <p className="text-sm text-foreground/80">
              {message}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
