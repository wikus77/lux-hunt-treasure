// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// M1SSION™ - BUZZ Action Button with Universal Stripe In-App Payment
import React from 'react';
import { useBuzzHandler } from '@/hooks/buzz/useBuzzHandler';
import { BuzzButton } from './BuzzButton';
import { ShockwaveAnimation } from './ShockwaveAnimation';
import { useStripeInAppPayment } from '@/hooks/useStripeInAppPayment';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { toast } from 'sonner';
import StripeInAppCheckout from '@/components/subscription/StripeInAppCheckout';

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
  const { user } = useUnifiedAuth();
  const { 
    processBuzzPayment, 
    showCheckout, 
    paymentConfig, 
    closeCheckout, 
    handlePaymentSuccess 
  } = useStripeInAppPayment();
  
  const { buzzing, showShockwave, handleBuzz } = useBuzzHandler({
    currentPrice,
    onSuccess
  });

  // © 2025 Joseph MULÉ – M1SSION™ – Universal Stripe In-App Payment Handler
  const handleStripePayment = async () => {
    console.log('🔥 M1SSION™ STRIPE IN-APP: Initiating BUZZ payment', { 
      currentPrice, 
      todayCount,
      timestamp: new Date().toISOString()
    });
    
    if (!user) {
      toast.error('Devi essere loggato per utilizzare BUZZ!');
      return;
    }

    // Convert price to cents for Stripe
    const priceInCents = Math.round(currentPrice * 100);
    
    console.log('💳 M1SSION™ BUZZ: Opening in-app checkout', { 
      priceInCents, 
      currentPrice,
      userId: user.id 
    });
    
    // Open in-app checkout modal
    await processBuzzPayment(priceInCents, false);
  };

  const handlePaymentComplete = async (paymentIntentId: string) => {
    console.log('✅ M1SSION™ BUZZ: Payment completed, processing BUZZ action', { paymentIntentId });
    
    try {
      // First handle payment success via hook
      await handlePaymentSuccess(paymentIntentId);
      
      // Then execute the BUZZ logic
      await handleBuzz();
      
      // Finally call parent success callback
      onSuccess();
    } catch (error) {
      console.error('❌ M1SSION™ BUZZ: Error in post-payment processing', error);
      toast.error('Errore nella finalizzazione BUZZ');
    }
  };

  return (
    <div className="relative flex flex-col items-center space-y-6">
      <BuzzButton
        currentPrice={currentPrice}
        isBlocked={isBlocked}
        buzzing={buzzing}
        onClick={handleStripePayment}
      />
      
      <ShockwaveAnimation show={showShockwave} />
      
      {/* Universal Stripe In-App Checkout - © 2025 Joseph MULÉ – M1SSION™ */}
      {showCheckout && paymentConfig && (
        <StripeInAppCheckout
          config={paymentConfig}
          onSuccess={handlePaymentComplete}
          onCancel={closeCheckout}
        />
      )}
    </div>
  );
};