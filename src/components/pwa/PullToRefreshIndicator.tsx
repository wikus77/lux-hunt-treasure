// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';

const PullToRefreshIndicator: React.FC = () => {
  const handleRefresh = async () => {
    // Reload the entire app
    window.location.reload();
  };

  const { isPulling, pullDistance, isRefreshing } = usePullToRefresh(handleRefresh);
  const isVisible = isPulling || isRefreshing;
  const progress = Math.min(pullDistance / 80, 1);

  console.log('🎨 PullToRefreshIndicator render:', { isPulling, pullDistance, isRefreshing, isVisible, progress });

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ 
            opacity: 1, 
            y: Math.max(0, pullDistance - 40)
          }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-0 left-1/2 -translate-x-1/2 z-[9999] pointer-events-none"
          style={{ willChange: 'transform, opacity' }}
        >
          <div className="relative mt-4">
            {/* Glow effect */}
            <div 
              className="absolute inset-0 rounded-full blur-xl opacity-60"
              style={{
                background: `radial-gradient(circle, rgba(0,209,255,${progress * 0.6}) 0%, rgba(123,46,255,${progress * 0.4}) 100%)`,
              }}
            />
            
            {/* Main container */}
            <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-[#00D1FF]/20 to-[#7B2EFF]/20 backdrop-blur-md border border-[#00D1FF]/30 flex items-center justify-center">
              {/* Animated icon */}
              <motion.div
                animate={{ 
                  rotate: isRefreshing ? 360 : progress * 180,
                  scale: isRefreshing ? [1, 1.1, 1] : 1
                }}
                transition={{ 
                  rotate: isRefreshing ? {
                    duration: 1,
                    repeat: Infinity,
                    ease: "linear"
                  } : {
                    duration: 0.3
                  },
                  scale: isRefreshing ? {
                    duration: 0.6,
                    repeat: Infinity,
                    ease: "easeInOut"
                  } : {}
                }}
              >
                <svg 
                  width="24" 
                  height="24" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                  className="drop-shadow-[0_0_8px_rgba(0,209,255,0.8)]"
                >
                  <path 
                    d="M12 2V6M12 18V22M4.93 4.93L7.76 7.76M16.24 16.24L19.07 19.07M2 12H6M18 12H22M4.93 19.07L7.76 16.24M16.24 7.76L19.07 4.93" 
                    stroke="url(#refreshGradient)" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    strokeOpacity={0.4 + progress * 0.6}
                  />
                  <defs>
                    <linearGradient id="refreshGradient" x1="2" y1="12" x2="22" y2="12" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#00D1FF" />
                      <stop offset="100%" stopColor="#7B2EFF" />
                    </linearGradient>
                  </defs>
                </svg>
              </motion.div>

              {/* Progress ring */}
              <svg 
                className="absolute inset-0 w-full h-full -rotate-90"
                viewBox="0 0 48 48"
              >
                <circle
                  cx="24"
                  cy="24"
                  r="22"
                  fill="none"
                  stroke="url(#progressGradient)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeDasharray={`${progress * 138.23} 138.23`}
                  opacity={0.6}
                />
                <defs>
                  <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00D1FF" />
                    <stop offset="100%" stopColor="#7B2EFF" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PullToRefreshIndicator;
