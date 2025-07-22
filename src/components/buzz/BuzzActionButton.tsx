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

      {/* 🚨 SAFARI PWA BYPASS COMPLETO - FORCE RENDER STRIPE REDIRECT */}
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
            WebkitBackfaceVisibility: 'hidden',
            overflow: 'hidden'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              console.log('🚨 SAFARI PWA: Closing modal by backdrop click');
              handlePaymentCancel();
              closeCheckout();
            }
          }}
        >
          {/* 🚨 SAFARI PWA CARD NATIVA - ZERO STRIPE ELEMENTS */}
          <div 
            style={{
              backgroundColor: '#1f2937',
              borderRadius: '16px',
              padding: '32px',
              maxWidth: '420px',
              width: '90%',
              maxHeight: '80vh',
              overflowY: 'auto',
              position: 'relative',
              transform: 'translateZ(0)',
              WebkitTransform: 'translateZ(0)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
              color: 'white',
              textAlign: 'center'
            }}
          >
            {/* 🚨 HEADER CON X */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px'
            }}>
              <h2 style={{ 
                margin: 0, 
                fontSize: '24px', 
                fontWeight: 'bold',
                color: '#F213A4'
              }}>
                M1SSION™ BUZZ
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
                  fontSize: '28px',
                  cursor: 'pointer',
                  padding: '4px',
                  lineHeight: 1
                }}
              >
                ×
              </button>
            </div>

            {/* 🚨 PREZZO GRANDE */}
            <div style={{
              fontSize: '48px',
              fontWeight: 'bold',
              marginBottom: '16px',
              background: 'linear-gradient(135deg, #F213A4 0%, #FF4D4D 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              €{currentPaymentConfig ? (currentPaymentConfig.amount / 100).toFixed(2) : '1.99'}
            </div>
            
            {/* 🚨 DESCRIZIONE */}
            <div style={{
              color: '#9ca3af',
              marginBottom: '32px',
              fontSize: '16px',
              lineHeight: '1.5'
            }}>
              {currentPaymentConfig?.description || 'Indizio extra per la missione M1SSION™'}
            </div>

            {/* 🚨 STATUS REDIRECT */}
            <div style={{
              backgroundColor: '#374151',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '32px',
              border: '1px solid #4B5563'
            }}>
              <div style={{
                fontSize: '18px',
                fontWeight: 'bold',
                marginBottom: '8px',
                color: '#10B981'
              }}>
                🔄 Apertura Stripe Checkout
              </div>
              <div style={{
                color: '#9ca3af',
                fontSize: '14px'
              }}>
                Pagamento sicuro tramite Stripe.<br/>
                Ti reindirizzeremo alla pagina di checkout.
              </div>
            </div>

            {/* 🚨 BOTTONI AZIONE */}
            <div style={{
              display: 'flex',
              gap: '16px',
              marginBottom: '24px'
            }}>
              <button
                onClick={async () => {
                  console.log('🚨 SAFARI PWA: Opening Stripe checkout directly');
                  
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
                      
                      // Close modal after redirect
                      setTimeout(() => {
                        handlePaymentCancel();
                        closeCheckout();
                      }, 1000);
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
                  flex: 1,
                  backgroundColor: '#8b5cf6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '16px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                🚀 Apri Stripe Checkout
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
                  border: '1px solid #4B5563',
                  borderRadius: '12px',
                  padding: '16px',
                  fontSize: '16px',
                  cursor: 'pointer',
                  minWidth: '80px'
                }}
              >
                Annulla
              </button>
            </div>

            {/* 🚨 SICUREZZA FOOTER */}
            <div style={{
              fontSize: '12px',
              color: '#6b7280',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}>
              🔒 Pagamento sicuro elaborato da Stripe
            </div>
          </div>
        </div>
      )}

      {/* 🧪 DEBUG BOX SEMPRE VISIBILE */}
      {isCheckoutOpen && (
        <div 
          style={{
            position: 'fixed',
            top: '10px',
            left: '10px',
            background: 'lime',
            color: 'black',
            padding: '8px',
            zIndex: 9999999,
            fontSize: '11px',
            borderRadius: '4px',
            maxWidth: '200px'
          }}
        >
          ✅ SAFARI PWA BYPASS ATTIVO<br/>
          isCheckoutOpen: {String(isCheckoutOpen)}<br/>
          Config: {currentPaymentConfig ? 'OK' : 'NULL'}<br/>
          Amount: €{currentPaymentConfig ? (currentPaymentConfig.amount / 100).toFixed(2) : '0.00'}
        </div>
      )}
    </div>
  );
};