// © 2025 Joseph MULÉ – CEO di NIYVORA KFT™
// M1SSION™ - BUZZ Button UI Component - TRON Disc Skin
import React from 'react';
import { motion } from 'framer-motion';
import { useXpSystem } from '@/hooks/useXpSystem';
import { TronBuzzSkin } from './TronBuzzSkin';

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
      style={{
        cursor: isBlocked || buzzing ? 'not-allowed' : 'pointer'
      }}
    >
      <TronBuzzSkin
        priceDisplay={priceDisplay}
        isLoading={buzzing}
        isBlocked={isBlocked}
      />
    </motion.button>
  );
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™