// © 2025 Joseph MULÉ – CEO di NIYVORA KFT™
// M1SSION™ - BUZZ Button UI Component
import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useXpSystem } from '@/hooks/useXpSystem';

interface BuzzButtonProps {
  currentPrice: number;
  isBlocked: boolean;
  buzzing: boolean;
  onClick: () => void;
  // Removed free properties
}

export const BuzzButton: React.FC<BuzzButtonProps> = ({
  currentPrice,
  isBlocked,
  buzzing,
  onClick,
  // All buzz actions are now paid
}) => {
  const { xpStatus } = useXpSystem();
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      disabled={isBlocked || buzzing}
      onClick={onClick}
      className="relative w-48 h-48 rounded-full text-lg font-semibold text-white tracking-wide z-20"
      style={{
        background: isBlocked 
          ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' 
          : 'linear-gradient(135deg, #F213A4 0%, #FF4D4D 100%)',
        boxShadow: isBlocked 
          ? '0 8px 30px rgba(239, 68, 68, 0.6), 0 4px 15px rgba(239, 68, 68, 0.4), inset 0 -8px 20px rgba(0, 0, 0, 0.3), inset 0 2px 10px rgba(255, 255, 255, 0.2)' 
          : '0 8px 30px rgba(242, 19, 164, 0.6), 0 4px 15px rgba(255, 77, 77, 0.4), inset 0 -8px 20px rgba(0, 0, 0, 0.3), inset 0 2px 10px rgba(255, 255, 255, 0.2)',
        transform: 'translateZ(0)',
        border: '2px solid rgba(255, 255, 255, 0.1)'
      }}
      animate={{
        scale: [1, 1.06, 1]
      }}
      transition={{
        scale: {
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        }
      }}
    >
      {buzzing ? (
        <div className="flex flex-col items-center space-y-3">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin" />
          <span className="text-lg font-semibold text-white">BUZZING...</span>
        </div>
      ) : isBlocked ? (
        <div className="flex flex-col items-center space-y-3">
          <X className="w-12 h-12 text-white" />
          <span className="text-lg font-semibold text-white">BLOCCATO</span>
        </div>
      ) : (
        <div className="flex flex-col items-center space-y-2">
          <h1 className="text-4xl font-orbitron font-bold">
            <span className="text-[#00ffff]">BU</span>
            <span className="text-white">ZZ</span>
          </h1>
          <div className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm text-white">
            PE: {xpStatus.buzz_xp_progress}/100
          </div>
          <div className="text-sm font-medium bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm text-white">
            €{currentPrice.toFixed(2)}
          </div>
        </div>
      )}
    </motion.button>
  );
};