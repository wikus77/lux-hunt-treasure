
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Circle as CircleIcon, Loader, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from 'sonner';
import { useNotificationManager } from "@/hooks/useNotificationManager";
import { useBuzzMapLogic } from "@/hooks/useBuzzMapLogic";
import { usePaymentVerification } from "@/hooks/usePaymentVerification";
import { useStripePayment } from "@/hooks/useStripePayment";

export interface BuzzButtonSecureProps {
  handleBuzz?: () => void;
  radiusKm?: number;
  mapCenter?: [number, number];
  onAreaGenerated?: (lat: number, lng: number, radius: number) => void;
}

const BuzzButtonSecure: React.FC<BuzzButtonSecureProps> = ({ 
  handleBuzz, 
  radiusKm = 500, // LANCIO: FISSO a 500km per prima generazione
  mapCenter,
  onAreaGenerated
}) => {
  const [isRippling, setIsRippling] = useState(false);
  const { createMapBuzzNotification } = useNotificationManager();
  const { processBuzzPurchase, loading: stripeLoading } = useStripePayment();
  const {
    hasValidPayment,
    canAccessPremium,
    remainingBuzz,
    subscriptionTier,
    loading: verificationLoading,
    requireBuzzPayment,
    logUnauthorizedAccess
  } = usePaymentVerification();
  
  const { 
    isGenerating, 
    generateBuzzMapArea,
    getActiveArea,
    dailyBuzzMapCounter,
    reloadAreas
  } = useBuzzMapLogic();
  
  const activeArea = getActiveArea();
  
  const handleSecureBuzzMapClick = async () => {
    // LANCIO: Verifica pagamento critica
    const canProceed = await requireBuzzPayment();
    if (!canProceed) {
      await logUnauthorizedAccess('buzz_map_blocked_no_payment', {
        subscriptionTier,
        remainingBuzz,
        hasValidPayment,
        mapCenter
      });
      return;
    }

    console.log('🚀 LANCIO BUZZ MAP: Payment verified, proceeding with 500km generation...');
    
    setIsRippling(true);
    setTimeout(() => setIsRippling(false), 1000);
    
    if (typeof window !== 'undefined' && window.plausible) {
      window.plausible('buzz_click');
    }
    
    // LANCIO: Use map center or default coordinates
    const centerLat = mapCenter ? mapCenter[0] : 41.9028;
    const centerLng = mapCenter ? mapCenter[1] : 12.4964;
    
    console.log('📍 LANCIO COORDINATES:', { 
      centerLat, 
      centerLng,
      mode: 'launch-19-july',
      expectedRadius: '500km'
    });
    
    if (subscriptionTier === 'Free') {
      console.log('💳 Free plan detected, redirecting to payment...');
      try {
        await processBuzzPurchase(true);
        return;
      } catch (error) {
        console.error('❌ LANCIO: Payment failed:', error);
        await logUnauthorizedAccess('buzz_map_payment_failed', { error });
        return;
      }
    }
    
    // LANCIO: Generate area with FORCED 500km radius
    const newArea = await generateBuzzMapArea(centerLat, centerLng);
    
    if (newArea) {
      if (typeof window !== 'undefined' && window.plausible) {
        window.plausible('clue_unlocked');
      }
      
      console.log('🎉 LANCIO SUCCESS: Area generated with FORCED 500km', newArea);
      
      await reloadAreas();
      
      if (handleBuzz) {
        handleBuzz();
      }
      
      await createMapBuzzNotification(
        "Area BUZZ Mappa - Lancio M1SSION",
        `Nuova area di ricerca generata: ${newArea.radius_km}km - Settimana 1`
      );
      
      if (onAreaGenerated) {
        onAreaGenerated(newArea.lat, newArea.lng, newArea.radius_km);
      }
      
    } else {
      console.error('❌ LANCIO: Area generation failed');
      await logUnauthorizedAccess('buzz_map_generation_failed');
      toast.error('❌ Errore generazione area BUZZ');
    }
  };

  const isBlocked = !hasValidPayment || remainingBuzz <= 0;
  const isLoading = isGenerating || stripeLoading || verificationLoading;
  
  // LANCIO: Mostra sempre 500km per prima generazione
  const displayRadius = () => {
    if (activeArea) {
      return activeArea.radius_km.toFixed(1);
    }
    return '500.0'; // LANCIO: Default FISSO 500km
  };
  
  // LANCIO: Mostra numero generazioni corrette (azzerate per reset)
  const displayGeneration = () => {
    return dailyBuzzMapCounter || 0; // Sempre 0 dopo reset
  };
  
  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
      <motion.div
        className="relative"
        whileHover={{ scale: isBlocked ? 1 : 1.05 }}
        whileTap={{ scale: isBlocked ? 1 : 0.95 }}
      >
        <Button
          onClick={handleSecureBuzzMapClick}
          disabled={isLoading || isBlocked}
          className={`buzz-button relative overflow-hidden whitespace-nowrap ${
            isBlocked 
              ? 'bg-gradient-to-r from-red-600 to-red-800 cursor-not-allowed' 
              : 'bg-gradient-to-r from-[#00cfff] via-[#ff00cc] to-[#7f00ff] hover:shadow-[0_0_25px_10px_rgba(255,0,128,0.65)]'
          } text-white px-8 py-3 rounded-full font-bold tracking-wide text-base transition-all duration-300`}
          style={{
            animation: isBlocked ? "none" : "buzzGlow 2s infinite ease-in-out",
            minWidth: 'fit-content',
            boxShadow: isBlocked ? 'none' : '0 0 20px 6px rgba(255,0,128,0.45)'
          }}
        >
          {isLoading ? (
            <Loader className="mr-2 h-4 w-4 animate-spin" />
          ) : isBlocked ? (
            <Lock className="mr-2 h-4 w-4" />
          ) : (
            <CircleIcon className="mr-2 h-4 w-4" />
          )}
          <span>
            {isLoading ? 'Generando...' : 
             isBlocked ? 'ACCESSO NEGATO' :
             `BUZZ MAPPA LANCIO (${displayRadius()}km) - Gen ${displayGeneration()}`}
          </span>
          
          {!isBlocked && hasValidPayment && (
            <div className="absolute top-1 right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          )}
        </Button>
        
        {isRippling && !isBlocked && (
          <motion.div
            className="absolute inset-0 border-2 border-cyan-400 rounded-full"
            initial={{ scale: 0.8, opacity: 0.5 }}
            animate={{ scale: 3, opacity: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        )}
      </motion.div>
      
      <style>
        {`
        @keyframes buzzGlow {
          0% { box-shadow: 0 0 8px rgba(255, 0, 204, 0.66); }
          50% { box-shadow: 0 0 22px rgba(255, 0, 204, 0.88), 0 0 33px rgba(0, 207, 255, 0.55); }
          100% { box-shadow: 0 0 8px rgba(255, 0, 204, 0.66); }
        }
        `}
      </style>
    </div>
  );
};

export default BuzzButtonSecure;
