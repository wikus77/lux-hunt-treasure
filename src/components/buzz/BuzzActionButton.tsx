// by Joseph Mulé – M1SSION™ – BUZZ Action Button Container Component
import React from 'react';
import { useBuzzHandler } from '@/hooks/buzz/useBuzzHandler';
import { BuzzButton } from './BuzzButton';
import { ShockwaveAnimation } from './ShockwaveAnimation';

interface BuzzActionButtonProps {
  currentPrice: number;
  isBlocked: boolean;
  todayCount: number;
  onSuccess: () => void;
}

export const BuzzActionButton: React.FC<BuzzActionButtonProps> = ({
  currentPrice,
  isBlocked,
  todayCount,
  onSuccess
}) => {
  const { buzzing, showShockwave, handleBuzz } = useBuzzHandler({
    currentPrice,
    onSuccess
  });

  return (
    <div className="relative flex flex-col items-center space-y-6">
      <BuzzButton
        currentPrice={currentPrice}
        isBlocked={isBlocked}
        buzzing={buzzing}
        onClick={handleBuzz}
      />
      
      <ShockwaveAnimation show={showShockwave} />
    </div>
  );
};