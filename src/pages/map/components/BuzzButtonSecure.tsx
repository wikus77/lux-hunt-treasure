
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

  // CRITICAL FIX: Enhanced counter tracking with FORCED sync
  useEffect(() => {
    const mapCounter = areas.filter(area => 
      area.user_id === (user?.id || '00000000-0000-4000-a000-000000000000')
    ).length;
    setRealBuzzMapCounter(mapCounter);
    console.log('📊 EMERGENCY FIX: Map counter FORCE updated:', mapCounter);
  }, [areas, user?.id]);
  
  // CRITICAL FIX: Enhanced secure BUZZ MAP with FORCED Stripe integration for non-developers
  const handleSecureBuzzMapClick = async () => {
    const isDeveloper = user?.email === 'wikus77@hotmail.it';
    const hasDeveloperAccess = localStorage.getItem('developer_access') === 'granted';
    
    if (isDeveloper || hasDeveloperAccess) {
      console.log('🔧 EMERGENCY FIX: DEVELOPER BYPASS - Proceeding with BUZZ MAP generation');
      generateBuzzMapAreaInternal();
      return;
    }

    // CRITICAL FIX: For non-developers, ALWAYS FORCE Stripe activation FIRST
    console.log('💳 EMERGENCY FIX: NON-DEVELOPER - FORCING Stripe activation BEFORE generation');
    
    try {
      console.log('💳 OPENING STRIPE CHECKOUT for BUZZ MAP...');
      const stripeSuccess = await processBuzzPurchase(true, 2.99); // isMapBuzz = true
      if (stripeSuccess) {
        console.log('✅ EMERGENCY FIX: Stripe payment completed successfully for BUZZ MAP');
        toast.success('Pagamento completato! Generando area BUZZ MAPPA...');
        // Continue with area generation after payment
        setTimeout(() => {
          generateBuzzMapAreaInternal();
        }, 2000);
      } else {
        console.log('❌ EMERGENCY FIX: Stripe payment failed or cancelled');
        toast.error('Pagamento richiesto per BUZZ MAPPA');
      }
      return;
    } catch (error) {
      console.error('❌ EMERGENCY FIX: Stripe payment error for BUZZ MAP:', error);
      toast.error('Errore nel processo di pagamento BUZZ MAPPA');
      return;
    }
  };

  const generateBuzzMapAreaInternal = async () => {
    console.log('🚀 EMERGENCY FIX: BUZZ MAP - Starting FORCED area generation...');
    
    setIsRippling(true);
    setTimeout(() => setIsRippling(false), 1000);
    
    const centerLat = mapCenter ? mapCenter[0] : 41.9028;
    const centerLng = mapCenter ? mapCenter[1] : 12.4964;
    
    console.log('📍 EMERGENCY FIX: BUZZ COORDINATES:', { centerLat, centerLng });
    
    // CRITICAL FIX: Enhanced generateBuzzMapArea call with FORCED area creation
    const newArea = await generateBuzzMapArea(centerLat, centerLng);
    
    if (newArea) {
      console.log('🎉 EMERGENCY FIX: BUZZ MAP SUCCESS - Area generated', newArea);

      // CRITICAL FIX: Update counter and FORCE reload
      setRealBuzzMapCounter(1); // Always 1 since we delete previous areas
      
      await reloadAreas();
      
      if (handleBuzz) {
        handleBuzz();
      }
      
      // CRITICAL FIX: Create FORCED notification with GUARANTEED persistence
      let notificationCreated = false;
      let attempts = 0;
      
      while (!notificationCreated && attempts < 5) {
        attempts++;
        try {
          console.log(`📨 EMERGENCY FIX: BUZZ MAP notification creation attempt ${attempts}/5`);
          await createMapBuzzNotification(
            "🗺️ Area BUZZ Mappa Generata",
            `Nuova area di ricerca Mission generata: ${newArea.radius_km.toFixed(1)}km di raggio - Generazione #${realBuzzMapCounter}`
          );
          notificationCreated = true;
          console.log(`✅ EMERGENCY FIX: BUZZ MAP notification FORCED into database successfully on attempt ${attempts}`);
        } catch (notifError) {
          console.error(`❌ EMERGENCY FIX: BUZZ MAP notification attempt ${attempts} failed:`, notifError);
          if (attempts < 5) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }
      }
      
      if (onAreaGenerated) {
        onAreaGenerated(newArea.lat, newArea.lng, newArea.radius_km);
      }
      
    } else {
      console.error('❌ EMERGENCY FIX: BUZZ MAP - Area generation failed');
      toast.error('❌ Errore generazione area BUZZ MAP');
    }
  };

  const isDeveloper = user?.email === 'wikus77@hotmail.it' || localStorage.getItem('developer_access') === 'granted';
  const isBlocked = !isDeveloper; // Non-developers are always blocked until they pay
  const isLoading = isGenerating || stripeLoading || verificationLoading;
  
  const displayRadius = () => {
    if (activeArea) {
      return activeArea.radius_km.toFixed(1);
    }
    
    // Calculate expected radius based on generation count
    const generationCount = realBuzzMapCounter || 1;
    let expectedRadius = 500;
    if (generationCount > 1) {
      expectedRadius = Math.max(5, 500 * Math.pow(0.95, generationCount - 1));
    }
    return expectedRadius.toFixed(1);
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
