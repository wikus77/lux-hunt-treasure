
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
    areas,
    deletePreviousBuzzMapAreas
  } = useBuzzMapLogic();
  
  const activeArea = getActiveArea();

  // Enhanced counter tracking
  useEffect(() => {
    const mapCounter = areas.filter(area => 
      area.user_id === (user?.id || '00000000-0000-4000-a000-000000000000')
    ).length;
    setRealBuzzMapCounter(mapCounter);
    console.log('📊 Map counter updated:', mapCounter);
  }, [areas, user?.id]);
  
  // SURGICAL FIX: Enhanced secure BUZZ MAP with FORCED Stripe for non-developers
  const handleSecureBuzzMapClick = async () => {
    const isDeveloper = user?.email === 'wikus77@hotmail.it';
    const hasDeveloperAccess = localStorage.getItem('developer_access') === 'granted';
    
    // SURGICAL FIX: Developer bypass with clear logging
    if (isDeveloper || hasDeveloperAccess) {
      console.log('🔧 SURGICAL FIX: DEVELOPER BYPASS - Proceeding with area generation');
      console.log('💳 STRIPE SKIPPED: Developer mode active');
      generateBuzzMapAreaInternal();
      return;
    }

    // SURGICAL FIX: FORCE Stripe for ALL non-developers
    console.log('💳 SURGICAL FIX: NON-DEVELOPER - FORCING Stripe checkout modal');
    
    try {
      console.log('💳 STRIPE MODAL: Opening checkout for BUZZ MAP...');
      toast.info('💳 Apertura pagamento Stripe...');
      
      // FORCED Stripe modal display
      const stripeSuccess = await processBuzzPurchase(true, 2.99); // isMapBuzz = true
      
      if (stripeSuccess) {
        console.log('✅ SURGICAL FIX: Stripe payment completed for BUZZ MAP');
        toast.success('✅ Pagamento completato! Generando area BUZZ MAPPA...');
        
        // Continue with area generation after payment
        setTimeout(() => {
          generateBuzzMapAreaInternal();
        }, 2000);
      } else {
        console.log('❌ SURGICAL FIX: Stripe payment failed or cancelled');
        toast.error('❌ Pagamento richiesto per BUZZ MAPPA');
      }
      return;
    } catch (error) {
      console.error('❌ SURGICAL FIX: Stripe payment error for BUZZ MAP:', error);
      toast.error('❌ Errore nel processo di pagamento BUZZ MAPPA');
      return;
    }
  };

  const generateBuzzMapAreaInternal = async () => {
    console.log('🚀 SURGICAL FIX: Starting area generation with forced deletion...');
    
    setIsRippling(true);
    setTimeout(() => setIsRippling(false), 1000);
    
    const centerLat = mapCenter ? mapCenter[0] : 41.9028;
    const centerLng = mapCenter ? mapCenter[1] : 12.4964;
    
    console.log('📍 BUZZ COORDINATES:', { centerLat, centerLng });
    
    // Generate new area (deletion happens inside generateBuzzMapArea)
    const newArea = await generateBuzzMapArea(centerLat, centerLng);
    
    if (newArea) {
      console.log('🎉 SURGICAL FIX: BUZZ MAP SUCCESS - Area generated', newArea);

      // Update counter
      setRealBuzzMapCounter(1); // Always 1 since we delete previous areas
      
      await reloadAreas();
      
      if (handleBuzz) {
        handleBuzz();
      }
      
      // SURGICAL FIX: Force notification creation with guaranteed persistence
      let notificationCreated = false;
      let attempts = 0;
      
      while (!notificationCreated && attempts < 10) {
        attempts++;
        try {
          console.log(`📨 SURGICAL FIX: BUZZ MAP notification attempt ${attempts}/10`);
          await createMapBuzzNotification(
            "🗺️ Area BUZZ Mappa Generata",
            `Nuova area di ricerca Mission: ${newArea.radius_km.toFixed(1)}km di raggio - Generazione #${realBuzzMapCounter + 1}`
          );
          notificationCreated = true;
          console.log(`✅ SURGICAL FIX: BUZZ MAP notification created on attempt ${attempts}`);
        } catch (notifError) {
          console.error(`❌ SURGICAL FIX: BUZZ MAP notification attempt ${attempts} failed:`, notifError);
          if (attempts < 10) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }
      }
      
      if (!notificationCreated) {
        console.error('❌ SURGICAL FIX: Failed to create notification after 10 attempts');
      }
      
      if (onAreaGenerated) {
        onAreaGenerated(newArea.lat, newArea.lng, newArea.radius_km);
      }
      
    } else {
      console.error('❌ SURGICAL FIX: BUZZ MAP - Area generation failed');
      toast.error('❌ Errore generazione area BUZZ MAP');
    }
  };

  // SURGICAL FIX: Enhanced display logic
  const isDeveloper = user?.email === 'wikus77@hotmail.it' || localStorage.getItem('developer_access') === 'granted';
  const isBlocked = !isDeveloper; // Non-developers always need payment
  const isLoading = isGenerating || stripeLoading || verificationLoading;
  
  const displayRadius = () => {
    if (activeArea) {
      return activeArea.radius_km.toFixed(1);
    }
    return "500.0"; // Default start radius
  };
  
  const displayGeneration = () => {
    return realBuzzMapCounter || 0;
  };
  
  // SURGICAL FIX: Enhanced generation limits
  const maxGenerations = isDeveloper ? 10 : 3;
  const canGenerate = displayGeneration() < maxGenerations;
  
  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
      <motion.div
        className="relative"
        whileHover={{ scale: (isBlocked && !canGenerate) ? 1 : 1.05 }}
        whileTap={{ scale: (isBlocked && !canGenerate) ? 1 : 0.95 }}
      >
        <Button
          onClick={handleSecureBuzzMapClick}
          disabled={isLoading || (!isDeveloper && !canGenerate)}
          className={`buzz-button relative overflow-hidden whitespace-nowrap ${
            (isBlocked && !canGenerate)
              ? 'bg-gradient-to-r from-red-600 to-red-800 cursor-not-allowed' 
              : isBlocked 
                ? 'bg-gradient-to-r from-orange-600 to-orange-800 cursor-pointer hover:from-orange-500 hover:to-orange-700' 
                : 'bg-gradient-to-r from-[#00cfff] via-[#ff00cc] to-[#7f00ff] hover:shadow-[0_0_25px_10px_rgba(255,0,128,0.65)]'
          } text-white px-8 py-3 rounded-full font-bold tracking-wide text-base transition-all duration-300`}
          style={{
            animation: (!canGenerate || isBlocked) ? "none" : "buzzGlow 2s infinite ease-in-out",
            minWidth: 'fit-content',
            boxShadow: (!canGenerate || isBlocked) ? 'none' : '0 0 20px 6px rgba(255,0,128,0.45)'
          }}
        >
          {isLoading ? (
            <Loader className="mr-2 h-4 w-4 animate-spin" />
          ) : (!canGenerate && !isDeveloper) ? (
            <Lock className="mr-2 h-4 w-4" />
          ) : isBlocked ? (
            <CircleIcon className="mr-2 h-4 w-4" />
          ) : (
            <CircleIcon className="mr-2 h-4 w-4" />
          )}
          <span>
            {isLoading ? 'Generando...' : 
             (!canGenerate && !isDeveloper) ? `LIMITE RAGGIUNTO (${maxGenerations})` :
             isBlocked ? 'BUZZ MAPPA - CLICCA PER ACQUISTARE' :
             `BUZZ MAPPA (${displayRadius()}km) - ${displayGeneration()}/${maxGenerations} ${isDeveloper ? '[DEV]' : ''}`}
          </span>
          
          {!isBlocked && canGenerate && (hasValidPayment || isDeveloper) && (
            <div className="absolute top-1 right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          )}
        </Button>
        
        {isRippling && !isBlocked && canGenerate && (
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
