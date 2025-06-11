
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Circle as CircleIcon, Loader, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from 'sonner';
import { useNotificationManager } from "@/hooks/useNotificationManager";
import { useBuzzMapLogic } from "@/hooks/useBuzzMapLogic";
import { usePaymentVerification } from "@/hooks/usePaymentVerification";
import { useStripePayment } from "@/hooks/useStripePayment";
import { supabase } from '@/integrations/supabase/client';
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
  const [realWeeklyUsed, setRealWeeklyUsed] = useState(0);
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
    reloadAreas
  } = useBuzzMapLogic();
  
  const activeArea = getActiveArea();

  useEffect(() => {
    let isMounted = true;
    
    const fetchRealCounters = async () => {
      if (!user?.id) return;

      try {
        const { data: mapCounter } = await supabase
          .from('user_buzz_map_counter')
          .select('buzz_map_count')
          .eq('user_id', user.id)
          .eq('date', new Date().toISOString().split('T')[0])
          .single();

        const currentWeek = Math.ceil((Date.now() - new Date('2025-07-19').getTime()) / (7 * 24 * 60 * 60 * 1000));
        const { data: weeklyAllowance } = await supabase
          .from('weekly_buzz_allowances')
          .select('used_buzz_count')
          .eq('user_id', user.id)
          .eq('week_number', Math.max(1, currentWeek))
          .eq('year', new Date().getFullYear())
          .single();

        if (isMounted) {
          setRealBuzzMapCounter(mapCounter?.buzz_map_count || 0);
          setRealWeeklyUsed(weeklyAllowance?.used_buzz_count || 0);
        }

        console.log('📊 EMERGENCY FIX: Real counters:', {
          mapCounter: mapCounter?.buzz_map_count || 0,
          weeklyUsed: weeklyAllowance?.used_buzz_count || 0
        });
      } catch (error) {
        console.error('❌ EMERGENCY FIX: Error fetching real counters:', error);
        if (isMounted) {
          setRealBuzzMapCounter(0);
          setRealWeeklyUsed(0);
        }
      }
    };

    fetchRealCounters();
    
    return () => {
      isMounted = false;
    };
  }, [user?.id]);
  
  // CRITICAL FIX: Enhanced secure BUZZ MAP click with STRIPE-FIRST logic
  const handleSecureBuzzMapClick = async () => {
    // CRITICAL FIX: Developer bypass check first
    const isDeveloper = user?.email === 'wikus77@hotmail.it';
    const hasDeveloperAccess = localStorage.getItem('developer_access') === 'granted';
    
    if (isDeveloper || hasDeveloperAccess) {
      console.log('🔧 EMERGENCY FIX: DEVELOPER BYPASS - Proceeding with map generation');
    } else {
      // CRITICAL FIX: For non-developers, FORCE Stripe BEFORE area generation
      const canProceed = await requireBuzzPayment();
      if (!canProceed) {
        console.log('💳 EMERGENCY FIX: Payment required - IMMEDIATE Stripe for BUZZ MAP');
        try {
          const stripeSuccess = await processBuzzPurchase(true); // isMapBuzz = true
          if (stripeSuccess) {
            console.log('✅ EMERGENCY FIX: Stripe payment completed, proceeding with area generation');
            // Payment successful, but wait for webhook to complete before generating area
            toast.success('Pagamento completato! Generando area...');
            // Continue with area generation after a short delay for webhook processing
            setTimeout(() => {
              generateBuzzMapAreaInternal();
            }, 2000);
          }
          return; // Stop here whether payment succeeded or failed
        } catch (error) {
          console.error('❌ EMERGENCY FIX: Stripe payment failed:', error);
          return;
        }
      }
    }

    // If we reach here, user has permission or is developer
    generateBuzzMapAreaInternal();
  };

  const generateBuzzMapAreaInternal = async () => {
    console.log('🚀 EMERGENCY FIX: BUZZ MAP - Starting area generation...');
    
    setIsRippling(true);
    setTimeout(() => setIsRippling(false), 1000);
    
    if (typeof window !== 'undefined' && window.plausible) {
      window.plausible('buzz_click');
    }
    
    const centerLat = mapCenter ? mapCenter[0] : 41.9028;
    const centerLng = mapCenter ? mapCenter[1] : 12.4964;
    
    console.log('📍 EMERGENCY FIX: BUZZ COORDINATES:', { 
      centerLat, 
      centerLng,
      mode: 'emergency-production-fix'
    });
    
    // CRITICAL FIX: Enhanced generateBuzzMapArea call with better error handling
    const newArea = await generateBuzzMapArea(centerLat, centerLng);
    
    if (newArea) {
      if (typeof window !== 'undefined' && window.plausible) {
        window.plausible('clue_unlocked');
      }
      
      console.log('🎉 EMERGENCY FIX: BUZZ MAP SUCCESS - Area generated', newArea);

      try {
        // Update local counter
        const { data: updatedCounter } = await supabase
          .from('user_buzz_map_counter')
          .upsert({
            user_id: user?.id,
            date: new Date().toISOString().split('T')[0],
            buzz_map_count: realBuzzMapCounter + 1
          }, {
            onConflict: 'user_id,date'
          })
          .select('buzz_map_count')
          .single();

        if (updatedCounter) {
          setRealBuzzMapCounter(updatedCounter.buzz_map_count);
        }
      } catch (error) {
        console.error('❌ EMERGENCY FIX: Error updating counters:', error);
      }
      
      await reloadAreas();
      
      if (handleBuzz) {
        handleBuzz();
      }
      
      await createMapBuzzNotification(
        "Area BUZZ Mappa Generata",
        `Nuova area di ricerca Mission: ${newArea.radius_km.toFixed(1)}km - Generazione ${realBuzzMapCounter + 1}`
      );
      
      if (onAreaGenerated) {
        onAreaGenerated(newArea.lat, newArea.lng, newArea.radius_km);
      }
      
    } else {
      console.error('❌ EMERGENCY FIX: BUZZ MAP - Area generation failed');
      toast.error('❌ Errore generazione area BUZZ MAP');
    }
  };

  // CRITICAL FIX: Enhanced logic with improved user experience
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
