// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// M1SSION™ - BUZZ Action Button with Progressive Pricing & Universal Stripe In-App Payment
import React from 'react';
import { useBuzzHandler } from '@/hooks/buzz/useBuzzHandler';
import { BuzzButton } from './BuzzButton';
import { ShockwaveAnimation } from './ShockwaveAnimation';
import { useStripeInAppPayment } from '@/hooks/useStripeInAppPayment';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { useBuzzCounter } from '@/hooks/useBuzzCounter';
import { toast } from 'sonner';
import StripeInAppCheckout from '@/components/subscription/StripeInAppCheckout';
import { validateBuzzPrice } from '@/lib/constants/buzzPricing';

interface BuzzActionButtonProps {
  isBlocked: boolean;
  onSuccess: () => void;
}

export const BuzzActionButton: React.FC<BuzzActionButtonProps> = ({
  isBlocked,
  onSuccess
}) => {
  const { user } = useUnifiedAuth();
  
  // Enhanced BUZZ counter with progressive pricing
  const { 
    dailyBuzzCounter, 
    getCurrentBuzzPriceCents,
    getCurrentBuzzDisplayPrice,
    updateDailyBuzzCounter
  } = useBuzzCounter(user?.id);
  
  // Progressive pricing calculation
  const currentPriceCents = getCurrentBuzzPriceCents();
  const currentPriceEur = currentPriceCents / 100;
  const currentPriceDisplay = getCurrentBuzzDisplayPrice();
  
  const { 
    processBuzzPayment, 
    showCheckout, 
    paymentConfig, 
    closeCheckout, 
    handlePaymentSuccess 
  } = useStripeInAppPayment();
  
  const { buzzing, showShockwave, handleBuzz } = useBuzzHandler({
    currentPrice: currentPriceEur,
    onSuccess
  });

  // © 2025 Joseph MULÉ – M1SSION™ – Progressive BUZZ Pricing Handler
  const handleStripePayment = async () => {
    console.log('🔥 M1SSION™ PROGRESSIVE BUZZ: Initiating payment', { 
      dailyCount: dailyBuzzCounter,
      nextClick: dailyBuzzCounter + 1,
      priceCents: currentPriceCents,
      priceEur: currentPriceEur,
      timestamp: new Date().toISOString()
    });
    
    if (!user) {
      toast.error('Devi essere loggato per utilizzare BUZZ!');
      return;
    }

    // Validate pricing integrity
    if (!validateBuzzPrice(dailyBuzzCounter, currentPriceCents)) {
      console.error('❌ BUZZ PRICING VALIDATION FAILED');
      toast.error('Errore nel calcolo del prezzo. Riprova.');
      return;
    }
    
    console.log('💳 M1SSION™ PROGRESSIVE BUZZ: Opening in-app checkout', { 
      priceCents: currentPriceCents, 
      priceEur: currentPriceEur,
      dailyCount: dailyBuzzCounter,
      userId: user.id 
    });
    
    // Open in-app checkout modal with validated progressive pricing
    await processBuzzPayment(currentPriceCents, false);
  };

  const handlePaymentComplete = async (paymentIntentId: string) => {
    console.log('✅ M1SSION™ PROGRESSIVE BUZZ: Payment completed', { 
      paymentIntentId,
      dailyCount: dailyBuzzCounter,
      pricePaid: currentPriceEur
    });
    
    try {
      // First handle payment success via hook
      await handlePaymentSuccess(paymentIntentId);
      
      // Update BUZZ counter after successful payment
      await updateDailyBuzzCounter();
      
      // Then execute the BUZZ logic
      await handleBuzz();
      
      // Finally call parent success callback
      onSuccess();
    } catch (error) {
      console.error('❌ M1SSION™ PROGRESSIVE BUZZ: Error in post-payment processing', error);
      toast.error('Errore nella finalizzazione BUZZ');
    }
  };

  return (
    <div className="relative flex flex-col items-center space-y-6">
      <BuzzButton
        currentPrice={currentPriceEur}
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