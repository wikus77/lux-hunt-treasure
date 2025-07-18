
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
  const { isAuthenticated } = useAuthContext();
  const { buzzMapPrice, radiusKm, incrementGeneration } = useBuzzMapPricing();
  const { processBuzzPurchase, loading } = useStripePayment();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleBuzzMapPress = async () => {
    console.log('🎯 BUZZ MAPPA PRESSED - REAL PAYMENT MODE', {
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
      // 🔥 REAL STRIPE: Open Stripe checkout - NO area creation until payment succeeds
      console.log('💳 BUZZ MAPPA: Opening Stripe checkout - REAL PAYMENT REQUIRED');
      const result = await processBuzzPurchase(true, buzzMapPrice);
      
      if (result) {
        console.log('✅ BUZZ MAPPA: Stripe checkout opened successfully');
        toast.success("Checkout Stripe aperto", {
          description: "Completa il pagamento per generare l'area BUZZ MAPPA"
        });
        
        // 🚨 REMOVED: No mock area creation - Stripe webhook will handle success
        onBuzzPress();
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
          <span className="text-xs text-white/80">BUZZ MAPPA</span>
        </div>
      </Button>
    </div>
  );
};

export default BuzzMapButton;
