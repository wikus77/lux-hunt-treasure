/**
 * M1SSION™ Celebration Toast
 * Minor celebration popup for quick feedback
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight } from 'lucide-react';
import { GameEvent, getEventCopy, cancelAutoDismiss, startAutoDismiss } from '@/gameplay/events';

interface CelebrationToastProps {
  event: GameEvent;
  onDismiss: () => void;
  onCtaClick: (path: string) => void;
}

export const CelebrationToast: React.FC<CelebrationToastProps> = ({
  event,
  onDismiss,
  onCtaClick,
}) => {
  const copy = getEventCopy(event);
  
  // Light haptic feedback
  useEffect(() => {
    if (navigator.vibrate) {
      navigator.vibrate(30);
    }
  }, []);
  
  // Handle click on toast
  const handleClick = () => {
    if (copy.cta) {
      onCtaClick(copy.cta.path);
    }
  };
  
  return (
    <AnimatePresence>
      <motion.div
        className="fixed top-0 left-0 right-0 z-[9998] flex justify-center pointer-events-none"
        style={{
          paddingTop: 'calc(env(safe-area-inset-top, 0px) + 80px)', // Below header
        }}
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      >
        <motion.div
          className="mx-4 max-w-md w-full rounded-xl overflow-hidden pointer-events-auto cursor-pointer"
          style={{
            background: getToastBackground(event.type),
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 4px 30px rgba(0, 0, 0, 0.3), 0 0 20px ' + getGlowColor(event.type),
          }}
          onClick={handleClick}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onMouseEnter={() => {
            // Pause auto-dismiss on hover (top-level import, no dynamic)
            cancelAutoDismiss();
          }}
          onMouseLeave={() => {
            // Resume auto-dismiss (top-level import, no dynamic)
            startAutoDismiss();
          }}
        >
          <div className="flex items-center p-4 gap-3">
            {/* Icon */}
            <motion.div
              className="text-3xl flex-shrink-0"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', delay: 0.1 }}
            >
              {copy.icon}
            </motion.div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <motion.p
                className="text-white font-bold text-sm truncate"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.15 }}
              >
                {copy.title}
              </motion.p>
              <motion.p
                className="text-white/80 text-xs truncate"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {copy.effect}
              </motion.p>
            </div>
            
            {/* CTA indicator or close */}
            <div className="flex-shrink-0">
              {copy.cta ? (
                <motion.div
                  className="flex items-center text-white/60 text-xs"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <ChevronRight className="w-4 h-4" />
                </motion.div>
              ) : (
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDismiss();
                  }}
                  className="p-1 rounded-full hover:bg-white/10 transition-colors"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <X className="w-4 h-4 text-white/60" />
                </motion.button>
              )}
            </div>
          </div>
          
          {/* Progress bar for auto-dismiss */}
          <motion.div
            className="h-1 bg-white/30"
            initial={{ scaleX: 1, originX: 0 }}
            animate={{ scaleX: 0 }}
            transition={{ duration: 3, ease: 'linear' }}
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Helper: Get toast background based on event type
function getToastBackground(type: string): string {
  switch (type) {
    case 'BUZZ_SUCCESS':
      return 'linear-gradient(135deg, rgba(0, 229, 255, 0.9) 0%, rgba(0, 132, 255, 0.9) 100%)';
    case 'BUZZ_INSUFFICIENT_M1U':
    case 'BUZZ_FAIL':
      return 'linear-gradient(135deg, rgba(255, 68, 68, 0.9) 0%, rgba(255, 136, 0, 0.9) 100%)';
    case 'M1U_CREDITED':
    case 'CASHBACK_ACCRUED':
      return 'linear-gradient(135deg, rgba(255, 215, 0, 0.9) 0%, rgba(255, 165, 0, 0.9) 100%)';
    case 'PE_GAINED':
      return 'linear-gradient(135deg, rgba(123, 92, 255, 0.9) 0%, rgba(0, 229, 255, 0.9) 100%)';
    case 'LEADERBOARD_POSITION_UP':
      return 'linear-gradient(135deg, rgba(0, 255, 136, 0.9) 0%, rgba(0, 229, 255, 0.9) 100%)';
    case 'LEADERBOARD_POSITION_DOWN':
      return 'linear-gradient(135deg, rgba(255, 136, 0, 0.9) 0%, rgba(255, 68, 68, 0.9) 100%)';
    default:
      return 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)';
  }
}

// Helper: Get glow color based on event type
function getGlowColor(type: string): string {
  switch (type) {
    case 'BUZZ_SUCCESS':
      return 'rgba(0, 229, 255, 0.4)';
    case 'BUZZ_INSUFFICIENT_M1U':
    case 'BUZZ_FAIL':
      return 'rgba(255, 68, 68, 0.4)';
    case 'M1U_CREDITED':
    case 'CASHBACK_ACCRUED':
      return 'rgba(255, 215, 0, 0.4)';
    case 'PE_GAINED':
      return 'rgba(123, 92, 255, 0.4)';
    default:
      return 'rgba(0, 229, 255, 0.3)';
  }
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

