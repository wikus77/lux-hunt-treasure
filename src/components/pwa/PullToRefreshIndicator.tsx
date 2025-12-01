// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Pull to Refresh Visual Indicator

import React from 'react';
import { motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';

interface PullToRefreshIndicatorProps {
  pullDistance: number;
  isRefreshing: boolean;
  progress: number;
  threshold?: number;
}

const PullToRefreshIndicator: React.FC<PullToRefreshIndicatorProps> = ({
  pullDistance,
  isRefreshing,
  progress,
  threshold = 150
}) => {
  if (pullDistance <= 0 && !isRefreshing) return null;

  return (
    <motion.div
      className="fixed left-0 right-0 flex justify-center pointer-events-none z-[9999]"
      style={{
        top: `calc(env(safe-area-inset-top, 0px) + ${Math.min(pullDistance, threshold)}px - 60px)`,
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: pullDistance > 20 ? 1 : 0 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        className="flex items-center justify-center w-12 h-12 rounded-full"
        style={{
          background: 'linear-gradient(180deg, #2A3441 0%, #1E2630 100%)',
          boxShadow: '0 4px 20px rgba(0, 209, 255, 0.3)',
          border: '1px solid rgba(0, 209, 255, 0.3)',
        }}
        animate={{
          scale: isRefreshing ? 1 : 0.8 + progress * 0.2,
          rotate: isRefreshing ? 360 : progress * 180,
        }}
        transition={{
          rotate: isRefreshing 
            ? { duration: 1, repeat: Infinity, ease: 'linear' }
            : { duration: 0 },
          scale: { duration: 0.2 }
        }}
      >
        <RefreshCw 
          className="w-6 h-6"
          style={{
            color: progress >= 1 || isRefreshing ? '#00D1FF' : '#8B9CAF',
            filter: progress >= 1 || isRefreshing 
              ? 'drop-shadow(0 0 8px rgba(0, 209, 255, 0.8))' 
              : 'none'
          }}
        />
      </motion.div>
      
      {/* Progress ring */}
      <svg
        className="absolute w-14 h-14"
        style={{ transform: 'rotate(-90deg)' }}
      >
        <circle
          cx="28"
          cy="28"
          r="24"
          fill="none"
          stroke="rgba(0, 209, 255, 0.2)"
          strokeWidth="2"
        />
        <motion.circle
          cx="28"
          cy="28"
          r="24"
          fill="none"
          stroke="#00D1FF"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray={150}
          animate={{
            strokeDashoffset: isRefreshing ? 0 : 150 - (progress * 150)
          }}
          style={{
            filter: 'drop-shadow(0 0 4px rgba(0, 209, 255, 0.6))'
          }}
        />
      </svg>
    </motion.div>
  );
};

export default PullToRefreshIndicator;
