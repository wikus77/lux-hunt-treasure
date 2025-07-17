
// © 2025 Joseph MULÉ – M1SSION™ – Tutti i diritti riservati
// M1SSION™ - BUZZ Map Button Component

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Zap, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthContext } from '@/contexts/auth';
import { useBuzzMapPricing } from '@/hooks/map/useBuzzMapPricing';
import { useStripePayment } from '@/hooks/useStripePayment';

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
    if (!isAuthenticated) {
      toast.error('Devi essere loggato per usare BUZZ MAPPA!');
      return;
    }

    if (isProcessing || loading) {
      return;
    }

    setIsProcessing(true);

    try {
      // 🚨 MANDATORY: Process Stripe payment first - ALWAYS FORCED
      console.log('💳 BUZZ MAPPA: Processing MANDATORY Stripe payment - FORCED FOR ALL');
      
      // 🚨 CRITICAL: ALWAYS REQUIRE PAYMENT - NO EXCEPTIONS
      const result = await processBuzzPurchase(true, buzzMapPrice);
      
      if (!result) {
        toast.error("Pagamento obbligatorio", {
          description: "Il pagamento tramite Stripe è necessario per BUZZ MAPPA."
        });
        return;
      }
      
      console.log('✅ BUZZ MAPPA: Stripe payment completed successfully');
      
      // Generate area after payment
      const currentRadius = incrementGeneration();
      const lat = mapCenter?.[0] || 41.9028;
      const lng = mapCenter?.[1] || 12.4964;
      
      // Call callback
      if (onAreaGenerated) {
        onAreaGenerated(lat, lng, currentRadius);
      }
      
      toast.success(`Area BUZZ generata! Raggio: ${currentRadius}km`);
      
    } catch (error) {
      console.error('BUZZ Map error:', error);
      toast.error('Errore durante la generazione dell\'area BUZZ');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="absolute bottom-24 right-4 z-50">
      <Button
        onClick={handleBuzzMapPress}
        disabled={!isAuthenticated || isProcessing || loading}
        className="h-16 w-16 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-lg transition-all duration-300 hover:scale-110 active:scale-95"
        style={{
          background: 'linear-gradient(135deg, #00D1FF 0%, #0099CC 50%, #7B2EFF 100%)',
          boxShadow: '0 0 20px rgba(0, 209, 255, 0.5)',
        }}
      >
        <div className="flex flex-col items-center">
          <Zap className="h-6 w-6 text-white mb-1" />
          <span className="text-xs text-white font-bold">€{buzzMapPrice}</span>
        </div>
      </Button>
      
      {/* Info badge */}
      <div className="absolute -top-2 -left-2 bg-black/80 text-white text-xs px-2 py-1 rounded-full border border-cyan-500/30">
        {radiusKm}km
      </div>
    </div>
  );
};

export default BuzzMapButton;
