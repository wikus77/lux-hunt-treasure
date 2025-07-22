// © 2025 Joseph MULÉ – CEO di NIYVORA KFT™
// M1SSION™ - BUZZ Action Button Container Component
import React from 'react';
import { useBuzzHandler } from '@/hooks/buzz/useBuzzHandler';
import { useUniversalStripePayment } from '@/hooks/useUniversalStripePayment';
import { BuzzButton } from './BuzzButton';
import { ShockwaveAnimation } from './ShockwaveAnimation';
import UniversalStripeCheckout from '@/components/stripe/UniversalStripeCheckout';

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
  const { buzzing, showShockwave, handleBuzz, handlePaymentSuccess } = useBuzzHandler({
    currentPrice,
    onSuccess
  });

  const { 
    isCheckoutOpen, 
    currentPaymentConfig, 
    closeCheckout 
  } = useUniversalStripePayment();

  return (
    <div className="relative flex flex-col items-center space-y-6">
      <BuzzButton
        currentPrice={currentPrice}
        isBlocked={isBlocked}
        buzzing={buzzing}
        onClick={handleBuzz}
      />
      
      <ShockwaveAnimation show={showShockwave} />

      {/* Universal Stripe Checkout Modal */}
      {currentPaymentConfig && (
        <UniversalStripeCheckout
          isOpen={isCheckoutOpen}
          onClose={closeCheckout}
          paymentType={currentPaymentConfig.paymentType}
          planName={currentPaymentConfig.planName}
          amount={currentPaymentConfig.amount}
          description={currentPaymentConfig.description}
          isBuzzMap={currentPaymentConfig.isBuzzMap}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
};