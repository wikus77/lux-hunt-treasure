/**
 * THE PULSE™ — Contribution Toast
 * Toast animato che mostra la contribuzione al Pulse
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap } from 'lucide-react';
import { PulseContributionResult } from '../hooks/usePulseContribute';

interface PulseContributionToastProps {
  contribution: PulseContributionResult | null;
  duration?: number; // ms
}

export const PulseContributionToast = ({ 
  contribution, 
  duration = 3000 
}: PulseContributionToastProps) => {
  const [visible, setVisible] = useState(false);
  const [currentContribution, setCurrentContribution] = useState<PulseContributionResult | null>(null);

  useEffect(() => {
    if (contribution?.accepted && contribution?.displayInfo) {
      setCurrentContribution(contribution);
      setVisible(true);
      
      const timer = setTimeout(() => {
        setVisible(false);
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [contribution, duration]);

  return (
    <AnimatePresence>
      {visible && currentContribution?.displayInfo && (
        <motion.div
          className="fixed z-[9999] pointer-events-none"
          style={{
            top: 'calc(env(safe-area-inset-top, 0px) + 60px)',
            left: '50%',
            transform: 'translateX(-50%)'
          }}
          initial={{ opacity: 0, y: -20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ 
            type: 'spring', 
            stiffness: 400, 
            damping: 25 
          }}
        >
          <div 
            className="relative px-4 py-3 rounded-2xl overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(0, 231, 255, 0.15) 0%, rgba(255, 77, 240, 0.15) 100%)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(0, 231, 255, 0.3)',
              boxShadow: '0 8px 32px rgba(0, 231, 255, 0.2), 0 0 60px rgba(255, 77, 240, 0.1)'
            }}
          >
            {/* Glow effect */}
            <motion.div
              className="absolute inset-0 rounded-2xl pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.5, 0] }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
              style={{
                background: 'radial-gradient(circle at center, rgba(0, 231, 255, 0.4) 0%, transparent 70%)'
              }}
            />
            
            <div className="relative flex items-center gap-3">
              {/* Icon with pulse */}
              <motion.div
                className="flex items-center justify-center w-10 h-10 rounded-full"
                style={{
                  background: 'linear-gradient(135deg, #00e7ff 0%, #ff4df0 100%)',
                  boxShadow: '0 0 20px rgba(0, 231, 255, 0.5)'
                }}
                animate={{ 
                  scale: [1, 1.1, 1],
                  boxShadow: [
                    '0 0 20px rgba(0, 231, 255, 0.5)',
                    '0 0 40px rgba(255, 77, 240, 0.7)',
                    '0 0 20px rgba(0, 231, 255, 0.5)'
                  ]
                }}
                transition={{ duration: 0.8, ease: 'easeInOut' }}
              >
                <Zap className="w-5 h-5 text-white" fill="white" />
              </motion.div>
              
              {/* Content */}
              <div className="flex flex-col">
                <motion.span
                  className="text-lg font-bold font-mono tracking-wider"
                  style={{
                    background: 'linear-gradient(90deg, #00e7ff 0%, #ff4df0 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textShadow: '0 0 20px rgba(0, 231, 255, 0.5)'
                  }}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  +{currentContribution.displayInfo.deltaPercent.toFixed(2)}% PULSE
                </motion.span>
                
                <motion.span
                  className="text-sm text-white/80"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  {currentContribution.displayInfo.emoji} {currentContribution.displayInfo.label}
                </motion.span>
              </div>
            </div>
            
            {/* Threshold notification */}
            {currentContribution.thresholdTriggered && (
              <motion.div
                className="mt-2 pt-2 border-t border-white/10 text-center"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ delay: 0.3 }}
              >
                <span className="text-xs font-bold text-yellow-400">
                  🎉 SOGLIA {currentContribution.thresholdTriggered}% RAGGIUNTA!
                </span>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™


