// by Joseph Mulé – M1SSION™ – BUZZ Button UI Component
import React from 'react';
import { motion } from 'framer-motion';
import { Zap, X } from 'lucide-react';

interface BuzzButtonProps {
  currentPrice: number;
  isBlocked: boolean;
  buzzing: boolean;
  onClick: () => void;
}

export const BuzzButton: React.FC<BuzzButtonProps> = ({
  currentPrice,
  isBlocked,
  buzzing,
  onClick
}) => {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      disabled={isBlocked || buzzing}
      onClick={onClick}
      className="relative w-48 h-48 rounded-full text-lg font-semibold text-white tracking-wide shadow-lg z-20"
      style={{
        background: isBlocked 
          ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' 
          : 'linear-gradient(135deg, #F213A4 0%, #FF4D4D 100%)',
        boxShadow: isBlocked 
          ? '0 0 15px rgba(239, 68, 68, 0.4)' 
          : '0 0 15px rgba(242, 19, 164, 0.4)'
      }}
    >
      {buzzing ? (
        <div className="flex flex-col items-center space-y-3">
          <Zap className="w-12 h-12 text-white" />
          <span className="text-lg font-semibold text-white">BUZZING...</span>
        </div>
      ) : isBlocked ? (
        <div className="flex flex-col items-center space-y-3">
          <X className="w-12 h-12 text-white" />
          <span className="text-lg font-semibold text-white">BLOCCATO</span>
        </div>
      ) : (
        <div className="flex flex-col items-center space-y-2">
          <Zap className="w-16 h-16 text-white" />
          <span className="text-3xl font-bold text-white">BUZZ</span>
          <div className="text-sm font-medium bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm text-white">
            €{currentPrice.toFixed(2)}
          </div>
        </div>
      )}
    </motion.button>
  );
};