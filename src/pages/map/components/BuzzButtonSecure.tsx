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
  radiusKm = 500, // LANCIO: FISSO a 500km per prima generazione
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
    requireBuzzPayment,
    logUnauthorizedAccess
  } = usePaymentVerification();
  
  const { 
    isGenerating, 
    generateBuzzMapArea,
    getActiveArea,
    reloadAreas
  } = useBuzzMapLogic();
  
  const activeArea = getActiveArea();

  // SYNC: Read real counters from Supabase
  useEffect(() => {
    const fetchRealCounters = async () => {
      if (!user?.id) return;

      try {
        // Get real buzz map counter from database
        const { data: mapCounter } = await supabase
          .from('user_buzz_map_counter')
          .select('buzz_map_count')
          .eq('user_id', user.id)
          .eq('date', new Date().toISOString().split('T')[0])
          .single();

        // Get real weekly allowance used
        const currentWeek = Math.ceil((Date.now() - new Date('2025-07-19').getTime()) / (7 * 24 * 60 * 60 * 1000));
        const { data: weeklyAllowance } = await supabase
          .from('weekly_buzz_allowances')
          .select('used_buzz_count')
          .eq('user_id', user.id)
          .eq('week_number', Math.max(1, currentWeek))
          .eq('year', new Date().getFullYear())
          .single();

        setRealBuzzMapCounter(mapCounter?.buzz_map_count || 0);
        setRealWeeklyUsed(weeklyAllowance?.used_buzz_count || 0);

        console.log('📊 LANCIO REAL COUNTERS:', {
          mapCounter: mapCounter?.buzz_map_count || 0,
          weeklyUsed: weeklyAllowance?.used_buzz_count || 0
        });
      } catch (error) {
        console.error('❌ LANCIO: Error fetching real counters:', error);
        // Default to 0 for launch reset state
        setRealBuzzMapCounter(0);
        setRealWeeklyUsed(0);
      }
    };

    fetchRealCounters();
  }, [user?.id]);
  
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

      // Update real counters in Supabase
      try {
        await supabase.rpc('increment_buzz_map_counter', { p_user_id: user?.id });
        
        // Refresh real counters
        setRealBuzzMapCounter(prev => prev + 1);
      } catch (error) {
        console.error('❌ LANCIO: Error updating counters:', error);
      }
      
      await reloadAreas();
      
      if (handleBuzz) {
        handleBuzz();
      }
      
      await createMapBuzzNotification(
        "Area BUZZ Mappa - Lancio M1SSION",
        `Nuova area di ricerca generata: ${newArea.radius_km}km - Prima Generazione Settimana 1`
      );
      
      if (onAreaGenerated) {
        onAreaGenerated(newArea.lat, newArea.lng, newArea.radius_km);
      }
      
    } else {
      console.error('❌ LANCIO: Area generation failed');
      await logUnauthorizedAccess('buzz_map_generation_failed', {});
      toast.error('❌ Errore generazione area BUZZ');
    }
  };

  const isBlocked = !hasValidPayment || remainingBuzz <= 0;
  const isLoading = isGenerating || stripeLoading || verificationLoading;
  
  // LANCIO: Mostra sempre 500km per prima generazione
  function displayRadius() {
    if (activeArea) {
      return activeArea.radius_km.toFixed(1);
    }
    return '500.0'; // LANCIO: Default FISSO 500km
  }
  
  // LANCIO: Mostra numero generazioni corrette (da database reale)
  function displayGeneration() {
    return realBuzzMapCounter || 0; // Real counter from Supabase
  }
  
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

// Helper functions
function displayRadius() {
  if (activeArea) {
    return activeArea.radius_km.toFixed(1);
  }
  return '500.0'; // LANCIO: Default FISSO 500km
}
  
function displayGeneration() {
  return realBuzzMapCounter || 0; // Real counter from Supabase
}
