// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// NORAH v6.3 Micro-Celebrations UI

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type CelebrationType = 'milestone' | 'streak' | 'discovery';

export interface CelebrationData {
  type: CelebrationType;
  message: string;
  icon?: string;
}

interface CelebrationsProps {
  celebration: CelebrationData | null;
  onComplete: () => void;
}

const CELEBRATION_MESSAGES: Record<CelebrationType, string[]> = {
  milestone: [
    '🎯 Ottimo passo!',
    '✨ Ben fatto!',
    '🚀 Prosegui così!',
    '💪 Continua!',
    '⭐ Grande!',
    '🎉 Perfetto!'
  ],
  streak: [
    '🔥 Striscia attiva!',
    '⚡ Ritmo perfetto!',
    '💫 Costanza al top!',
    '🌟 Serie vincente!',
    '🏆 Streak record!',
    '✨ Inarrestabile!'
  ],
  discovery: [
    '🔍 Indizio trovato!',
    '💡 Nuovo dato!',
    '🎁 Scoperta!',
    '📍 Info acquisita!',
    '🗺️ Pattern emerging!',
    '🎯 Connessione!'
  ]
};

export const Celebrations: React.FC<CelebrationsProps> = ({ celebration, onComplete }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (celebration) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onComplete, 300); // Wait for exit animation
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [celebration, onComplete]);

  if (!celebration) return null;

  const messages = CELEBRATION_MESSAGES[celebration.type];
  const randomMessage = messages[Math.floor(Math.random() * messages.length)];

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
        >
          <div className="bg-gradient-to-r from-[#F213A4]/90 to-[#0EA5E9]/90 backdrop-blur-md px-6 py-3 rounded-full shadow-lg border border-white/20">
            <div className="flex items-center gap-2 text-white font-medium">
              {celebration.icon && <span className="text-xl">{celebration.icon}</span>}
              <span>{celebration.message || randomMessage}</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Helper function to trigger celebrations
export function celebrateMilestone(type: CelebrationType, customMessage?: string): CelebrationData {
  return {
    type,
    message: customMessage || '',
    icon: type === 'milestone' ? '🎯' : type === 'streak' ? '🔥' : '🔍'
  };
}
