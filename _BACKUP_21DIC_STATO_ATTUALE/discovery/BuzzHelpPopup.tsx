/**
 * BUZZ HELP POPUP — M1SSION™
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 * 
 * Modal popup that appears when user is stuck or inactive.
 * Shows max 1 time per first session.
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'wouter';
import {
  DISCOVERY_MODE_ENABLED,
  BUZZ_HELP_CONFIG,
  isDiscoveryActive,
  canShowBuzzHelp,
  markBuzzHelpShown,
  getMicroMissionStep,
  getTimeSinceFirstInteraction,
} from '@/config/firstSessionDiscovery';

export default function BuzzHelpPopup() {
  const [visible, setVisible] = useState(false);
  const [, navigate] = useLocation();

  // Check conditions to show popup
  useEffect(() => {
    if (!DISCOVERY_MODE_ENABLED || !isDiscoveryActive() || !canShowBuzzHelp()) return;

    const checkShowCondition = () => {
      const step = getMicroMissionStep();
      const timeSinceInteraction = getTimeSinceFirstInteraction();

      // Condition 1: Stuck at step 0 for too long
      if (step === 0 && timeSinceInteraction === null) {
        // No interaction yet, wait for showAfterInactiveSeconds
        return true;
      }

      // Condition 2: Has interacted but stuck at step 0
      if (step === 0 && timeSinceInteraction && timeSinceInteraction > BUZZ_HELP_CONFIG.showIfStuckAtStep0AfterMs) {
        return true;
      }

      return false;
    };

    // Delayed check
    const timer = setTimeout(() => {
      if (checkShowCondition()) {
        setVisible(true);
        markBuzzHelpShown();
        console.log('[BuzzHelp] 💡 Popup shown');
      }
    }, BUZZ_HELP_CONFIG.showAfterInactiveSeconds * 1000);

    // Also listen for step completions to cancel showing
    const handleStepComplete = () => {
      clearTimeout(timer);
    };

    window.addEventListener('discovery-step-complete', handleStepComplete);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('discovery-step-complete', handleStepComplete);
    };
  }, []);

  const handleOpenBuzz = useCallback(() => {
    setVisible(false);
    navigate(BUZZ_HELP_CONFIG.buzzRoute);
  }, [navigate]);

  const handleDismiss = useCallback(() => {
    setVisible(false);
  }, []);

  if (!DISCOVERY_MODE_ENABLED) return null;

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleDismiss}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
              zIndex: 9998,
            }}
          />

          {/* Modal - Responsive */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="fixed z-[9999] w-[calc(100%-32px)] max-w-[320px] sm:max-w-[340px]"
            style={{
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div
              className="relative rounded-2xl sm:rounded-3xl text-center"
              style={{
                background: 'linear-gradient(145deg, rgba(10, 20, 40, 0.98), rgba(15, 30, 60, 0.95))',
                padding: 'clamp(20px, 5vw, 28px) clamp(18px, 5vw, 24px)',
                border: '1px solid rgba(0, 209, 255, 0.3)',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(0, 209, 255, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
              }}
            >
              {/* Decorative top glow */}
              <div
                className="absolute -top-px left-[30%] right-[30%] h-[3px] rounded"
                style={{
                  background: 'linear-gradient(90deg, transparent, rgba(0, 209, 255, 0.8), transparent)',
                }}
              />

              {/* Icon - responsive */}
              <motion.div
                animate={{ 
                  y: [0, -5, 0],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="text-4xl sm:text-5xl mb-3 sm:mb-4"
                style={{
                  filter: 'drop-shadow(0 0 12px rgba(0, 209, 255, 0.5))',
                }}
              >
                🎯
              </motion.div>

              {/* Title - responsive */}
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2"
                style={{ textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)' }}
              >
                {BUZZ_HELP_CONFIG.title}
              </h3>

              {/* Body - responsive */}
              <p className="text-sm sm:text-base text-white/80 mb-5 sm:mb-6 leading-relaxed">
                {BUZZ_HELP_CONFIG.body}
              </p>

              {/* CTA Button - responsive */}
              <motion.button
                onClick={handleOpenBuzz}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 sm:py-3.5 px-5 rounded-xl sm:rounded-2xl border-none text-white text-sm sm:text-base font-semibold cursor-pointer mb-2.5 sm:mb-3"
                style={{
                  background: 'linear-gradient(135deg, #00D1FF, #0099CC)',
                  boxShadow: '0 4px 20px rgba(0, 209, 255, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                }}
              >
                {BUZZ_HELP_CONFIG.ctaText}
              </motion.button>

              {/* Dismiss Button - responsive */}
              <motion.button
                onClick={handleDismiss}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-2.5 sm:py-3 px-5 rounded-lg sm:rounded-xl bg-transparent text-white/60 text-xs sm:text-sm font-medium cursor-pointer"
                style={{
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                }}
              >
                {BUZZ_HELP_CONFIG.dismissText}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

