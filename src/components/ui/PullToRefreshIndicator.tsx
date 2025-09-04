// © 2025 M1SSION™ - Pull to Refresh Visual Indicator
import React from 'react';
import { motion } from 'framer-motion';
import { RotateCcw } from 'lucide-react';

interface PullToRefreshIndicatorProps {
  visible: boolean;
  progress: number;
  triggered: boolean;
}

export const PullToRefreshIndicator: React.FC<PullToRefreshIndicatorProps> = ({
  visible,
  progress,
  triggered
}) => {
  if (!visible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="pwa-pull-to-refresh visible"
    >
      <div className="flex items-center gap-2">
        <motion.div
          animate={{ 
            rotate: triggered ? [0, 360] : 0,
            scale: triggered ? [1, 1.1, 1] : Math.min(progress / 70, 1)
          }}
          transition={{ 
            rotate: { duration: 0.5, ease: "easeInOut" },
            scale: { duration: 0.2 }
          }}
        >
          <RotateCcw className="w-4 h-4" />
        </motion.div>
        <span>
          {triggered ? 'Rilascia per aggiornare' : 'Trascina per aggiornare'}
        </span>
      </div>
    </motion.div>
  );
};