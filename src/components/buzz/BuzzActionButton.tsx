// © 2025 Joseph MULÉ – CEO di NIYVORA KFT™
// M1SSION™ - BUZZ Action Button Container Component
import React, { useEffect } from 'react';
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
  // 🚨 CRITICAL: LOG BuzzActionButton MOUNT AND PROPS
  console.log('✅ BuzzActionButton MOUNTED - CRITICAL DEBUG', {
    currentPrice,
    isBlocked,
    todayCount,
    onSuccessType: typeof onSuccess,
    propsReceived: { currentPrice, isBlocked, todayCount, onSuccess: typeof onSuccess },
    timestamp: new Date().toISOString()
  });

  const { buzzing, showShockwave, handleBuzz, handlePaymentSuccess, handlePaymentCancel } = useBuzzHandler({
    currentPrice,
    onSuccess
  });

  // 🚨 CRITICAL: LOG handleBuzz FROM HOOK
  console.log('✅ useBuzzHandler RETURNED - CRITICAL DEBUG', {
    buzzingState: buzzing,
    showShockwaveState: showShockwave,
    handleBuzzType: typeof handleBuzz,
    handleBuzzExists: !!handleBuzz,
    handleBuzzName: handleBuzz?.name,
    handlePaymentSuccessType: typeof handlePaymentSuccess,
    handlePaymentCancelType: typeof handlePaymentCancel,
    hookReturnedAt: new Date().toISOString()
  });

  const { 
    isCheckoutOpen, 
    currentPaymentConfig, 
    closeCheckout 
  } = useUniversalStripePayment();

  // Debug log for checkout state
  useEffect(() => {
    console.log('🔥 BUZZ CHECKOUT MODAL STATE CHANGED:', { 
      isCheckoutOpen, 
      paymentType: currentPaymentConfig?.paymentType,
      amount: currentPaymentConfig?.amount,
      hasConfig: !!currentPaymentConfig,
      timestamp: new Date().toISOString()
    });
    
    if (currentPaymentConfig) {
      console.log('🔥 FULL currentPaymentConfig:', currentPaymentConfig);
    }
  }, [isCheckoutOpen, currentPaymentConfig]);

  return (
    <div className="relative flex flex-col items-center space-y-6">
      {/* 🚨 CRITICAL: LOG BEFORE RENDERING BuzzButton */}
      {(() => {
        console.log('🚨 ABOUT TO RENDER BuzzButton WITH PROPS:', {
          currentPrice,
          isBlocked,
          buzzing,
          handleBuzzType: typeof handleBuzz,
          handleBuzzExists: !!handleBuzz,
          handleBuzzFunction: handleBuzz?.toString?.().substring(0, 100) + '...',
          aboutToRenderAt: new Date().toISOString()
        });
        return null;
      })()}
      
      <BuzzButton
        currentPrice={currentPrice}
        isBlocked={isBlocked}
        buzzing={buzzing}
        onClick={handleBuzz}
      />
      
      {/* 🧪 DIRECT TEST IN BuzzActionButton */}
      <button 
        onClick={() => {
          console.log('🧪 DIRECT TEST FROM BuzzActionButton - handleBuzz call:');
          if (handleBuzz) {
            console.log('🧪 Calling handleBuzz directly...');
            handleBuzz();
          } else {
            console.error('🧪 handleBuzz is undefined!');
          }
        }}
        style={{
          marginTop: '10px',
          padding: '4px 8px',
          background: 'orange',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '12px'
        }}
      >
        TEST handleBuzz
      </button>
      
      <ShockwaveAnimation show={showShockwave} />

      {/* 🧪 CRITICAL: DEBUG FALLBACK SE STATO È CORRETTO MA MODALE INVISIBILE */}
      {isCheckoutOpen && (
        <div 
          style={{
            position: 'fixed',
            top: '50px',
            left: '10px',
            background: 'red',
            color: 'white',
            padding: '10px',
            zIndex: 9998,
            fontSize: '12px',
            borderRadius: '4px'
          }}
        >
          🚨 BUZZ ACTION: isCheckoutOpen=TRUE<br/>
          Config: {currentPaymentConfig ? 'EXISTS' : 'NULL'}<br/>
          Type: {currentPaymentConfig?.paymentType}
        </div>
      )}

      {/* Universal Stripe Checkout Modal */}
      {currentPaymentConfig && (
        <UniversalStripeCheckout
            isOpen={isCheckoutOpen}
            onClose={() => {
              console.log('❌ BUZZ CHECKOUT CLOSED by user');
              handlePaymentCancel();
              closeCheckout();
            }}
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