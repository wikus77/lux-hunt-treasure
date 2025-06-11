
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Circle as CircleIcon, Loader, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from 'sonner';
import { useNotificationManager } from "@/hooks/useNotificationManager";
import { useBuzzMapLogic } from "@/hooks/useBuzzMapLogic";
import { usePaymentVerification } from "@/hooks/usePaymentVerification";
import { useStripePayment } from "@/hooks/useStripePayment";
import { useAuth } from '@/hooks/useAuth';

export interface BuzzButtonSecureProps {
  handleBuzz?: () => void;
  radiusKm?: number;
  mapCenter?: [number, number];
  onAreaGenerated?: (lat: number, lng: number, radius: number) => void;
}

const BuzzButtonSecure: React.FC<BuzzButtonSecureProps> = ({ 
  handleBuzz, 
  radiusKm = 500,
  mapCenter,
  onAreaGenerated
}) => {
  const [isRippling, setIsRippling] = useState(false);
  const [realBuzzMapCounter, setRealBuzzMapCounter] = useState(0);
  const { user } = useAuth();
  const { createMapBuzzNotification } = useNotificationManager();
  const { processBuzzPurchase, loading: stripeLoading } = useStripePayment();
  const {
    hasValidPayment,
    canAccessPremium,
    remainingBuzz,
    subscriptionTier,
    loading: verificationLoading,
    requireBuzzPayment
  } = usePaymentVerification();
  
  const { 
    isGenerating, 
    generateBuzzMapArea,
    getActiveArea,
    reloadAreas,
    areas
  } = useBuzzMapLogic();
  
  const activeArea = getActiveArea();

  // CRITICAL FIX: Enhanced counter tracking
  useEffect(() => {
    const mapCounter = areas.filter(area => 
      area.user_id === (user?.id || '00000000-0000-4000-a000-000000000000')
    ).length;
    setRealBuzzMapCounter(mapCounter);
    console.log('📊 EMERGENCY FIX: Map counter updated:', mapCounter);
  }, [areas, user?.id]);
  
  // CRITICAL FIX: Enhanced secure BUZZ MAP with proper Stripe integration
  const handleSecureBuzzMapClick = async () => {
    const isDeveloper = user?.email === 'wikus77@hotmail.it';
    const hasDeveloperAccess = localStorage.getItem('developer_access') === 'granted';
    
    if (isDeveloper || hasDeveloperAccess) {
      console.log('🔧 EMERGENCY FIX: DEVELOPER BYPASS - Proceeding with map generation');
      generateBuzzMapAreaInternal();
      return;
    }

    // CRITICAL FIX: For non-developers, check payment FIRST
    const canProceed = await requireBuzzPayment();
    if (!canProceed) {
      console.log('💳 EMERGENCY FIX: Payment required - IMMEDIATE Stripe for BUZZ MAP');
      try {
        const stripeSuccess = await processBuzzPurchase(true, 2.99); // isMapBuzz = true
        if (stripeSuccess) {
          console.log('✅ EMERGENCY FIX: Stripe payment completed');
          toast.success('Pagamento completato! Generando area...');
          // Continue with area generation after payment
          setTimeout(() => {
            generateBuzzMapAreaInternal();
          }, 2000);
        }
        return;
      } catch (error) {
        console.error('❌ EMERGENCY FIX: Stripe payment failed:', error);
        return;
      }
    }

    // If payment is valid, proceed directly
    generateBuzzMapAreaInternal();
  };

  const generateBuzzMapAreaInternal = async () => {
    console.log('🚀 EMERGENCY FIX: BUZZ MAP - Starting area generation...');
    
    setIsRippling(true);
    setTimeout(() => setIsRippling(false), 1000);
    
    const centerLat = mapCenter ? mapCenter[0] : 41.9028;
    const centerLng = mapCenter ? mapCenter[1] : 12.4964;
    
    console.log('📍 EMERGENCY FIX: BUZZ COORDINATES:', { centerLat, centerLng });
    
    // CRITICAL FIX: Enhanced generateBuzzMapArea call
    const newArea = await generateBuzzMapArea(centerLat, centerLng);
    
    if (newArea) {
      console.log('🎉 EMERGENCY FIX: BUZZ MAP SUCCESS - Area generated', newArea);

      // Update counter
      setRealBuzzMapCounter(prev => prev + 1);
      
      await reloadAreas();
      
      if (handleBuzz) {
        handleBuzz();
      }
      
      // CRITICAL FIX: Create meaningful notification
      await createMapBuzzNotification(
        "Area BUZZ Mappa Generata",
        `Nuova area di ricerca Mission generata: ${newArea.radius_km.toFixed(1)}km di raggio - Generazione #${realBuzzMapCounter + 1}`
      );
      
      if (onAreaGenerated) {
        onAreaGenerated(newArea.lat, newArea.lng, newArea.radius_km);
      }
      
    } else {
      console.error('❌ EMERGENCY FIX: BUZZ MAP - Area generation failed');
      toast.error('❌ Errore generazione area BUZZ MAP');
    }
  };

  const isDeveloper = user?.email === 'wikus77@hotmail.it' || localStorage.getItem('developer_access') === 'granted';
  const isBlocked = !isDeveloper && (!canAccessPremium || remainingBuzz <= 0);
  const isLoading = isGenerating || stripeLoading || verificationLoading;
  
  const displayRadius = () => {
    if (activeArea) {
      return activeArea.radius_km.toFixed(1);
    }
    return '500.0';
  };
  
  const displayGeneration = () => {
    return realBuzzMapCounter || 0;
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
          disabled={isLoading}
          className={`buzz-button relative overflow-hidden whitespace-nowrap ${
            isBlocked 
              ? 'bg-gradient-to-r from-orange-600 to-orange-800 cursor-pointer hover:from-orange-500 hover:to-orange-700' 
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
            <CircleIcon className="mr-2 h-4 w-4" />
          ) : (
            <CircleIcon className="mr-2 h-4 w-4" />
          )}
          <span>
            {isLoading ? 'Generando...' : 
             isBlocked ? 'BUZZ MAPPA - CLICCA PER ACQUISTARE' :
             `BUZZ MAPPA (${displayRadius()}km) - Gen ${displayGeneration()}`}
          </span>
          
          {!isBlocked && (hasValidPayment || isDeveloper) && (
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
