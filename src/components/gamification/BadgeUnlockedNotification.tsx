// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Award } from 'lucide-react';

interface BadgeUnlockedNotificationProps {
  badgeName: string;
  badgeDescription: string;
  badgeIcon?: string;
  onClose: () => void;
}

export function BadgeUnlockedNotification({
  badgeName,
  badgeDescription,
  badgeIcon,
  onClose
}: BadgeUnlockedNotificationProps) {
  
  useEffect(() => {
    // Trigger confetti animation
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    // Auto-dismiss after 5 seconds
    const timer = setTimeout(onClose, 5000);
    
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ scale: 0, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0, opacity: 0, y: -50 }}
        transition={{ type: 'spring', duration: 0.5 }}
        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[9999] pointer-events-none"
      >
        <div className="relative bg-gradient-to-br from-primary/20 via-background to-accent/20 p-8 rounded-2xl shadow-2xl border-2 border-primary/50 backdrop-blur-md">
          {/* Glow effect */}
          <div className="absolute inset-0 bg-primary/20 blur-xl rounded-2xl" />
          
          <div className="relative flex flex-col items-center text-center gap-4">
            {/* Badge Icon */}
            <motion.div
              initial={{ rotate: -180, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="bg-primary/20 p-6 rounded-full"
            >
              {badgeIcon ? (
                <span className="text-6xl">{badgeIcon}</span>
              ) : (
                <Award className="h-16 w-16 text-primary" />
              )}
            </motion.div>

            {/* Text */}
            <div className="space-y-2">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-2xl font-bold text-primary"
              >
                🎖️ BADGE SBLOCCATO!
              </motion.h2>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-xl font-semibold"
              >
                {badgeName}
              </motion.p>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-sm text-muted-foreground max-w-xs"
              >
                {badgeDescription}
              </motion.p>
            </div>

            {/* Sparkle effects */}
            <motion.div
              className="absolute top-0 right-0 text-4xl"
              animate={{
                rotate: [0, 360],
                scale: [1, 1.2, 1],
              }}
              transition={{ repeat: 2, duration: 0.8 }}
            >
              ✨
            </motion.div>
            <motion.div
              className="absolute bottom-0 left-0 text-3xl"
              animate={{
                rotate: [0, -360],
                scale: [1, 1.3, 1],
              }}
              transition={{ repeat: 2, duration: 0.9, delay: 0.1 }}
            >
              ⭐
            </motion.div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
