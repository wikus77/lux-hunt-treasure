// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// M1SSION™ - BUZZ Action Button with Safari PWA Compatible Stripe Modal
import React, { useState } from 'react';
import { useBuzzHandler } from '@/hooks/buzz/useBuzzHandler';
import { BuzzButton } from './BuzzButton';
import { ShockwaveAnimation } from './ShockwaveAnimation';
import { useStripePayment } from '@/hooks/useStripePayment';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';

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
  const [showStripeModal, setShowStripeModal] = useState(false);
  const [stripeProcessing, setStripeProcessing] = useState(false);
  const { user } = useAuth();
  const { processBuzzPurchase } = useStripePayment();
  const { buzzing, showShockwave, handleBuzz } = useBuzzHandler({
    currentPrice,
    onSuccess
  });

  // © 2025 Joseph MULÉ – M1SSION™ – Safari PWA Compatible Stripe Modal Handler
  const handleStripePayment = async () => {
    console.log('🔥 STRIPE MODAL: Opening Safari PWA compatible modal', { 
      currentPrice, 
      todayCount,
      timestamp: new Date().toISOString()
    });
    
    if (!user) {
      toast.error('Devi essere loggato per utilizzare BUZZ!');
      return;
    }

    setStripeProcessing(true);
    setShowStripeModal(true);
    
    try {
      // Convert price to cents for Stripe
      const priceInCents = Math.round(currentPrice * 100);
      
      console.log('💳 BUZZ STRIPE: Processing payment', { 
        priceInCents, 
        currentPrice,
        userId: user.id 
      });
      
      const success = await processBuzzPurchase(false, priceInCents);
      
      if (success) {
        console.log('✅ STRIPE SUCCESS: Closing modal and proceeding with BUZZ');
        setShowStripeModal(false);
        // Continue with BUZZ logic after successful payment
        await handleBuzz();
      } else {
        console.log('❌ STRIPE FAILED: Payment unsuccessful');
        toast.error('Pagamento non completato');
      }
    } catch (error) {
      console.error('💥 STRIPE ERROR:', error);
      toast.error('Errore durante il pagamento');
    } finally {
      setStripeProcessing(false);
      setShowStripeModal(false);
    }
  };

  const closeStripeModal = () => {
    if (!stripeProcessing) {
      setShowStripeModal(false);
      setStripeProcessing(false);
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
      
      {/* Safari PWA Compatible Stripe Modal - © 2025 Joseph MULÉ – M1SSION™ */}
      {showStripeModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.95)',
            zIndex: 999999,
            transform: 'translateZ(0)',
            WebkitTransform: 'translateZ(0)',
            WebkitBackfaceVisibility: 'hidden',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={closeStripeModal}
        >
          <div
            style={{
              backgroundColor: '#1a1a2e',
              borderRadius: '16px',
              padding: '32px',
              maxWidth: '400px',
              width: '100%',
              border: '2px solid #F213A4',
              boxShadow: '0 20px 40px rgba(242, 19, 164, 0.3)',
              transform: 'translateZ(0)',
              WebkitTransform: 'translateZ(0)',
              color: 'white',
              textAlign: 'center'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{ 
                fontSize: '24px', 
                fontWeight: 'bold', 
                color: '#00ffff',
                marginBottom: '8px',
                fontFamily: 'Orbitron, monospace'
              }}>
                BUZZ Payment
              </h2>
              <p style={{ 
                fontSize: '18px', 
                color: '#F213A4',
                fontWeight: 'bold',
                marginBottom: '12px'
              }}>
                €{currentPrice.toFixed(2)}
              </p>
              <p style={{ 
                color: '#ffffff99', 
                fontSize: '14px',
                lineHeight: '1.4'
              }}>
                {stripeProcessing ? 
                  '🔄 Reindirizzamento a Stripe in corso...' : 
                  'Il pagamento verrà elaborato tramite Stripe Checkout sicuro.'
                }
              </p>
            </div>
            
            {!stripeProcessing && (
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={closeStripeModal}
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    backgroundColor: 'transparent',
                    border: '2px solid #666',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  Annulla
                </button>
                <button
                  onClick={() => {
                    // Re-trigger payment if needed
                    handleStripePayment();
                  }}
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    background: 'linear-gradient(135deg, #F213A4 0%, #00ffff 100%)',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  Paga ora
                </button>
              </div>
            )}
            
            {stripeProcessing && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '12px'
              }}>
                <div style={{
                  width: '20px',
                  height: '20px',
                  border: '2px solid #F213A4',
                  borderTop: '2px solid transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                <span style={{ color: '#00ffff', fontSize: '14px' }}>
                  Elaborazione...
                </span>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* CSS Animation for spinner */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};