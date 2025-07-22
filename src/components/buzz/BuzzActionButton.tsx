// © 2025 Joseph MULÉ – CEO di NIYVORA KFT™
// M1SSION™ - BUZZ Action Button Container Component
import React, { useEffect } from 'react';
import { useBuzzHandler } from '@/hooks/buzz/useBuzzHandler';
import { useUniversalStripePayment } from '@/hooks/useUniversalStripePayment';
import { BuzzButton } from './BuzzButton';
import { ShockwaveAnimation } from './ShockwaveAnimation';
import UniversalStripeCheckout from '@/components/stripe/UniversalStripeCheckout';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';

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
  const { user } = useAuth();
  
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
          Type: {currentPaymentConfig?.paymentType}<br/>
          Amount: {currentPaymentConfig?.amount}
        </div>
      )}

      {/* 🚨 SAFARI PWA BYPASS - FORCE RENDER SEMPRE */}
      {isCheckoutOpen && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999999,
            transform: 'translateZ(0)',
            WebkitTransform: 'translateZ(0)',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              console.log('🚨 SAFARI PWA: Closing modal by backdrop click');
              handlePaymentCancel();
              closeCheckout();
            }
          }}
        >
          {/* 🚨 SAFARI PWA CARD DEFINITIVA */}
          <div 
            style={{
              backgroundColor: '#1f2937',
              borderRadius: '12px',
              padding: '24px',
              maxWidth: '400px',
              width: '90%',
              maxHeight: '80vh',
              overflowY: 'auto',
              position: 'relative',
              transform: 'translateZ(0)',
              WebkitTransform: 'translateZ(0)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              color: 'white'
            }}
          >
            {/* 🚨 HEADER */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>
                {currentPaymentConfig?.planName || 'BUZZ Payment'}
              </h2>
              <button
                onClick={() => {
                  console.log('🚨 SAFARI PWA: X button clicked');
                  handlePaymentCancel();
                  closeCheckout();
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'white',
                  fontSize: '24px',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                ×
              </button>
            </div>

            {/* 🚨 CONTENT */}
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '24px',
                fontWeight: 'bold',
                marginBottom: '20px'
              }}>
                €{currentPaymentConfig ? (currentPaymentConfig.amount / 100).toFixed(2) : '0.00'}
              </div>
              
              <div style={{
                color: '#9ca3af',
                marginBottom: '20px',
                fontSize: '14px'
              }}>
                {currentPaymentConfig?.description || 'Indizio extra per la missione'}
              </div>

              <div style={{
                color: '#9ca3af',
                marginBottom: '30px',
                fontSize: '14px'
              }}>
                🔄 Apertura Stripe Checkout in corso...<br/>
                Ti reindirizzeremo alla pagina di pagamento sicura.
              </div>

              {/* 🚨 FORCE REDIRECT BUTTON */}
              <button
                onClick={async () => {
                  console.log('🚨 SAFARI PWA: Force opening Stripe checkout');
                  
                  try {
                    const { data, error } = await supabase.functions.invoke('process-buzz-purchase', {
                      body: {
                        user_id: user?.id,
                        amount: currentPaymentConfig ? currentPaymentConfig.amount / 100 : 1.99,
                        is_buzz_map: currentPaymentConfig?.isBuzzMap || false,
                        currency: 'eur',
                        mode: 'payment'
                      }
                    });

                    if (error) {
                      console.error('🚨 Stripe creation error:', error);
                      toast.error('Errore nella creazione del pagamento');
                      return;
                    }

                    if (data?.url) {
                      console.log('🚨 Opening Stripe URL:', data.url);
                      window.open(data.url, '_blank');
                      handlePaymentCancel();
                      closeCheckout();
                    } else {
                      console.error('🚨 No URL returned');
                      toast.error('Errore nel checkout Stripe');
                    }
                  } catch (err) {
                    console.error('🚨 Checkout error:', err);
                    toast.error('Errore imprevisto');
                  }
                }}
                style={{
                  backgroundColor: '#8b5cf6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 24px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  marginRight: '12px'
                }}
              >
                Apri Stripe Checkout
              </button>

              <button
                onClick={() => {
                  console.log('🚨 SAFARI PWA: Cancel button clicked');
                  handlePaymentCancel();
                  closeCheckout();
                }}
                style={{
                  backgroundColor: '#374151',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 24px',
                  fontSize: '16px',
                  cursor: 'pointer'
                }}
              >
                Annulla
              </button>
            </div>

            <div style={{
              textAlign: 'center',
              fontSize: '12px',
              color: '#6b7280',
              marginTop: '20px'
            }}>
              🔒 Pagamento sicuro elaborato da Stripe
            </div>
          </div>
        </div>
      )}

      {/* 🚨 OLD SYSTEM - KEPT AS FALLBACK */}
      {currentPaymentConfig && false && (
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