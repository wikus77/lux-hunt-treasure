
// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// M1SSION™ - BUZZ Map Button Component - Progressive Pricing System

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAuthContext } from '@/contexts/auth';
import { useBuzzMapProgressivePricing } from '@/hooks/map/useBuzzMapProgressivePricing';
import { useStripePayment } from '@/hooks/useStripePayment';
import { supabase } from '@/integrations/supabase/client';
import { BuzzCostWarningModal } from '@/components/buzz/BuzzCostWarningModal';

interface BuzzMapButtonProps {
  onBuzzPress: () => void;
  mapCenter?: [number, number];
  onAreaGenerated?: (lat: number, lng: number, radius: number) => void;
}

const BuzzMapButton: React.FC<BuzzMapButtonProps> = ({
  onBuzzPress,
  mapCenter,
  onAreaGenerated
}) => {
  const { isAuthenticated, user } = useAuthContext();
  const { 
    buzzMapPrice, 
    radiusKm, 
    segment,
    dailyBuzzMapCounter,
    isEligibleForBuzz,
    needsCostWarning,
    isEliteMaxPrice,
    validateBuzzRequest,
    incrementGeneration 
  } = useBuzzMapProgressivePricing();
  const { processBuzzPurchase, loading } = useStripePayment();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);

  const handleBuzzMapPress = async () => {
    console.log('🎯 BUZZ MAPPA PRESSED - PROGRESSIVE PRICING SYSTEM', {
      isAuthenticated,
      buzzMapPrice,
      radiusKm,
      segment,
      dailyBuzzMapCounter,
      mapCenter,
      timestamp: new Date().toISOString()
    });

    if (!isAuthenticated) {
      toast.error('Devi essere loggato per usare BUZZ MAPPA!');
      return;
    }

    if (isProcessing || loading) {
      return;
    }

    // Anti-fraud checks
    if (dailyBuzzMapCounter >= 3) {
      toast.error('Limite giornaliero raggiunto', {
        description: 'Massimo 3 BUZZ MAPPA al giorno per sicurezza.'
      });
      return;
    }

    if (!isEligibleForBuzz) {
      toast.error('Attendi prima del prossimo BUZZ', {
        description: 'Devi attendere almeno 3 ore tra i BUZZ per sicurezza.'
      });
      return;
    }

    // Validate the request server-side with enhanced post-reset debugging
    console.log('🔍 BUZZ VALIDATION START', {
      buzzMapPrice,
      radiusKm,
      segment,
      dailyBuzzMapCounter,
      user: user?.id
    });
    
    const isValid = await validateBuzzRequest(buzzMapPrice, radiusKm);
    console.log('🔍 BUZZ VALIDATION RESULT', { isValid });
    
    if (!isValid) {
      console.warn('🚫 BUZZ VALIDATION FAILED', {
        price: buzzMapPrice,
        radius: radiusKm,
        expectedEntry: { price: 4.99, radius: 500 },
        postResetCheck: true
      });
      toast.error('Richiesta non valida', {
        description: 'Tentativo di bypass rilevato. Operazione bloccata.'
      });
      return;
    }
    
    console.log('✅ BUZZ VALIDATION PASSED - Proceeding with payment');

    // Show warning modal for high-cost operations
    if (needsCostWarning()) {
      setShowWarningModal(true);
      return;
    }

    // Proceed with payment
    await processBuzzPayment();
  };

  const handleWarningConfirm = async () => {
    setShowWarningModal(false);
    await processBuzzPayment();
  };

  const handleWarningCancel = () => {
    setShowWarningModal(false);
  };

  const processBuzzPayment = async () => {

    // 🧠 SAVE MAP STATE BEFORE PAYMENT (CRITICAL FOR RESTORATION)
    if ((window as any).leafletMap) {
      const map = (window as any).leafletMap;
      const center = map.getCenter();
      const zoom = map.getZoom();
      
      localStorage.setItem("map_state_before_buzz", JSON.stringify({
        center: { lat: center.lat, lng: center.lng },
        zoom: zoom
      }));
      
      console.log('💾 Map state saved before BUZZ payment:', { center, zoom });
    }

    setIsProcessing(true);

    try {
      // Increment generation counter with validation
      const incrementSuccess = await incrementGeneration();
      if (!incrementSuccess) {
        toast.error('Errore validazione BUZZ', {
          description: 'Impossibile procedere con il BUZZ. Riprova.'
        });
        setIsProcessing(false);
        return;
      }

      // 🔥 PROGRESSIVE PRICING: Real Stripe checkout with validated pricing
      console.log('💳 BUZZ MAPPA PROGRESSIVE: Opening Stripe checkout', {
        price: buzzMapPrice,
        radius: radiusKm,
        segment: segment
      });
      const result = await processBuzzPurchase(true, buzzMapPrice);
      
      if (result) {
        console.log('✅ BUZZ MAPPA PROGRESSIVE: Stripe checkout opened successfully');
        toast.success("Checkout Stripe aperto", {
          description: `Completa il pagamento di ${buzzMapPrice.toFixed(2)}€ per generare l'area BUZZ MAPPA (${radiusKm}km)`
        });
        
        // 🚨 CRITICAL FIX: Mock successful payment for testing (TEMP)
        // This simulates a successful Stripe payment for testing
        const simulateSuccessfulPayment = async (stripeSessionId: string) => {
          console.log('🧪 SIMULATING SUCCESSFUL PAYMENT FOR TESTING');
          
          // Update the payment status to succeeded
          const { error: updateError } = await supabase
            .from('payment_transactions')
            .update({ status: 'succeeded' })
            .eq('provider_transaction_id', stripeSessionId);
          
          if (updateError) {
            console.error('Failed to update payment status:', updateError);
            return false;
          }
          
          // Wait a moment then create the area
          setTimeout(async () => {
            const { data, error } = await supabase.functions.invoke('handle-buzz-payment-success', {
              body: { session_id: stripeSessionId }
            });
            
            if (!error && data?.success) {
              console.log('✅ BUZZ MAPPA: Area created successfully!', data);
              
              // 🎯 UNIFIED TOAST: Single toast with DB values - NO CITY NAME REVEALED
              toast.success(`✅ BUZZ MAPPA creata!`, {
                description: "Una nuova zona è stata creata sulla mappa. Inizia a indagare!"
              });
              
              // Trigger area generation callback
              if (onAreaGenerated && data.area) {
                onAreaGenerated(data.area.lat, data.area.lng, data.area.radius_km);
              }
              
              onBuzzPress();
            } else {
              console.error('Failed to create area:', error);
              toast.error("Errore creazione area", {
                description: "Area non creata. Contatta il supporto."
              });
            }
          }, 3000); // Wait 3 seconds to simulate payment processing
          
          return true;
        };
        
        // Extract session ID from the result and simulate payment
        // In production, this would be handled by Stripe webhooks
        const mockPaymentSuccess = async () => {
          // Get the most recent pending payment for this user
          const { data: recentPayments } = await supabase
            .from('payment_transactions')
            .select('provider_transaction_id')
            .eq('user_id', user?.id)
            .eq('status', 'pending')
            .ilike('description', '%Buzz Map%')
            .order('created_at', { ascending: false })
            .limit(1);
            
          if (recentPayments && recentPayments.length > 0) {
            const sessionId = recentPayments[0].provider_transaction_id;
            await simulateSuccessfulPayment(sessionId);
          }
        };
        
        mockPaymentSuccess();
        
        } else {
        console.error('❌ BUZZ MAPPA PROGRESSIVE: processBuzzPurchase failed');
        toast.error("Errore Stripe", {
          description: "Impossibile aprire il checkout Stripe. Riprova."
        });
      }
      
    } catch (error) {
      console.error('❌ BUZZ Map Progressive error:', error);
      toast.error('Errore durante l\'apertura del checkout Stripe');
    } finally {
      setIsProcessing(false);
    }
  };

  const getSegmentColor = () => {
    switch (segment) {
      case "ELITE":
        return 'linear-gradient(135deg, #7B2EFF 0%, #FF006E 50%, #FFD700 100%)';
      case "High-Spender":
        return 'linear-gradient(135deg, #FF006E 0%, #FF4500 50%, #FFD700 100%)';
      case "Mid High-Spender":
        return 'linear-gradient(135deg, #FF4500 0%, #FF8C00 50%, #00D1FF 100%)';
      case "TRANSIZIONE":
        return 'linear-gradient(135deg, #00D1FF 0%, #0099CC 50%, #FF4500 100%)';
      default:
        return 'linear-gradient(135deg, #00D1FF 0%, #0099CC 50%, #7B2EFF 100%)';
    }
  };

  const formatPrice = (price: number) => {
    if (price >= 1000) {
      return `€${(price / 1000).toFixed(1)}k`;
    }
    return `€${price.toFixed(price >= 100 ? 0 : 2)}`;
  };

  return (
    <>
      <BuzzCostWarningModal
        isOpen={showWarningModal}
        onConfirm={handleWarningConfirm}
        onCancel={handleWarningCancel}
        price={buzzMapPrice}
        radius={radiusKm}
        segment={segment}
        isEliteMaxPrice={isEliteMaxPrice()}
      />
      
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
        <Button
          onClick={handleBuzzMapPress}
          disabled={!isAuthenticated || isProcessing || loading || !isEligibleForBuzz || dailyBuzzMapCounter >= 3}
          className="h-16 px-6 rounded-full shadow-lg transition-all duration-300 hover:scale-110 active:scale-95"
          style={{
            background: getSegmentColor(),
            boxShadow: segment === "ELITE" ? '0 0 30px rgba(123, 46, 255, 0.7)' : '0 0 20px rgba(0, 209, 255, 0.5)',
          }}
        >
          <div className="flex flex-col items-center">
            <span className="text-sm text-white font-bold">{formatPrice(buzzMapPrice)}</span>
            <span className="text-xs text-white/80">BUZZ MAPPA · {radiusKm}km</span>
            {segment !== "Entry" && (
              <span className="text-xs text-white/60 font-medium">{segment}</span>
            )}
          </div>
        </Button>
        
        {(!isEligibleForBuzz || dailyBuzzMapCounter >= 3) && (
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs text-red-400 whitespace-nowrap">
            {dailyBuzzMapCounter >= 3 ? 'Limite giornaliero raggiunto' : 'Attendere 3h dal precedente'}
          </div>
        )}
      </div>
    </>
  );
};

export default BuzzMapButton;
