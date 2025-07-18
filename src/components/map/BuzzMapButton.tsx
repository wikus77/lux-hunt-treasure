
// © 2025 Joseph MULÉ – M1SSION™ – Tutti i diritti riservati
// M1SSION™ - BUZZ Map Button Component - RESET COMPLETO 17/07/2025

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAuthContext } from '@/contexts/auth';
import { useBuzzMapPricing } from '@/hooks/map/useBuzzMapPricing';
import { useStripePayment } from '@/hooks/useStripePayment';
import { supabase } from '@/integrations/supabase/client';

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
  const { buzzMapPrice, radiusKm, incrementGeneration } = useBuzzMapPricing();
  const { processBuzzPurchase, loading } = useStripePayment();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleBuzzMapPress = async () => {
    console.log('🎯 BUZZ MAPPA PRESSED - FIXED REAL PAYMENT MODE', {
      isAuthenticated,
      buzzMapPrice,
      radiusKm,
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

    setIsProcessing(true);

    try {
      // 🔥 CRITICAL FIX: Real Stripe checkout with proper session ID extraction
      console.log('💳 BUZZ MAPPA: Opening Stripe checkout - REAL PAYMENT REQUIRED');
      const result = await processBuzzPurchase(true, buzzMapPrice);
      
      if (result) {
        console.log('✅ BUZZ MAPPA: Stripe checkout opened successfully');
        toast.success("Checkout Stripe aperto", {
          description: "Completa il pagamento per generare l'area BUZZ MAPPA"
        });
        
        // 🚨 CRITICAL FIX: Poll for real payment with actual Stripe session ID
        // Note: This will be replaced by webhook in production
        const pollForPayment = async () => {
          let attempts = 0;
          const maxAttempts = 60; // 10 minutes max
          
          const checkPayment = async () => {
            attempts++;
            console.log(`🔍 Checking payment status, attempt ${attempts}/${maxAttempts}`);
            
            try {
              // Check for successful payments in the last 5 minutes
              const { data: payments, error: paymentError } = await supabase
                .from('payment_transactions')
                .select('*')
                .eq('user_id', user?.id)
                .eq('status', 'succeeded')
                .ilike('description', '%Buzz Map%')
                .gte('created_at', new Date(Date.now() - 5 * 60 * 1000).toISOString())
                .order('created_at', { ascending: false })
                .limit(1);
              
              if (!paymentError && payments && payments.length > 0) {
                const payment = payments[0];
                console.log('💳 Found successful payment, creating area...', payment);
                
                // Use the real session ID from the payment
                const { data, error } = await supabase.functions.invoke('handle-buzz-payment-success', {
                  body: { session_id: payment.provider_transaction_id }
                });
                
                if (!error && data?.success) {
                  console.log('✅ BUZZ MAPPA: Area created successfully!', data);
                  
                  // 🎯 UNIFIED TOAST: Single toast with DB values
                  toast.success(`✅ BUZZ MAPPA creata!`, {
                    description: `Centro: ${data.target.city} · Radius: ${data.area.radius_km}km`
                  });
                  
                  // Trigger area generation callback
                  if (onAreaGenerated && data.area) {
                    onAreaGenerated(data.area.lat, data.area.lng, data.area.radius_km);
                  }
                  
                  onBuzzPress();
                  return true;
                }
              }
              
              if (attempts < maxAttempts) {
                setTimeout(checkPayment, 10000); // Check every 10 seconds
              } else {
                console.warn('❌ Payment timeout - area not created');
                toast.error("Timeout pagamento", {
                  description: "Controlla il pagamento e riprova se necessario"
                });
              }
              
            } catch (checkError) {
              console.error('Error checking payment:', checkError);
              if (attempts < maxAttempts) {
                setTimeout(checkPayment, 10000);
              }
            }
            return false;
          };
          
          setTimeout(checkPayment, 5000); // Start checking after 5 seconds
        };
        
        pollForPayment();
        
      } else {
        console.error('❌ BUZZ MAPPA: processBuzzPurchase failed');
        toast.error("Errore Stripe", {
          description: "Impossibile aprire il checkout Stripe. Riprova."
        });
      }
      
    } catch (error) {
      console.error('❌ BUZZ Map error:', error);
      toast.error('Errore durante l\'apertura del checkout Stripe');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
      <Button
        onClick={handleBuzzMapPress}
        disabled={!isAuthenticated || isProcessing || loading}
        className="h-16 px-6 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-lg transition-all duration-300 hover:scale-110 active:scale-95"
        style={{
          background: 'linear-gradient(135deg, #00D1FF 0%, #0099CC 50%, #7B2EFF 100%)',
          boxShadow: '0 0 20px rgba(0, 209, 255, 0.5)',
        }}
      >
        <div className="flex flex-col items-center">
          <span className="text-sm text-white font-bold">€{buzzMapPrice}</span>
          <span className="text-xs text-white/80">BUZZ MAPPA · {radiusKm}km</span>
        </div>
      </Button>
    </div>
  );
};

export default BuzzMapButton;
