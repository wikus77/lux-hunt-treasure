// © 2025 Joseph MULÉ – CEO di NIYVORA KFT™
// M1SSION™ - BUZZ Button UI Component - Legacy 3D Skin
import React from 'react';
import { motion } from 'framer-motion';
import { useXpSystem } from '@/hooks/useXpSystem';
import { LegacyBuzzSkin } from './LegacyBuzzSkin';

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
  
  // Format price for display
  const priceDisplay = `€${currentPrice.toFixed(2)}`;
  
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      disabled={isBlocked || buzzing}
      onClick={onClick}
      className="relative border-0 bg-transparent p-0 z-20"
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
      style={{
        cursor: isBlocked || buzzing ? 'not-allowed' : 'pointer'
      }}
    >
      <LegacyBuzzSkin
        priceDisplay={priceDisplay}
        peProgress={xpStatus.buzz_xp_progress}
        isLoading={buzzing}
        isBlocked={isBlocked}
      />
    </motion.button>
  );
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™