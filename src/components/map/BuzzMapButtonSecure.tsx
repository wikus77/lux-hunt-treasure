// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthContext } from '@/contexts/auth';
import { useBuzzMapPricingNew } from '@/hooks/useBuzzMapPricingNew';
import { useM1UnitsRealtime } from '@/hooks/useM1UnitsRealtime';
import { showInsufficientM1UToast } from '@/utils/m1uHelpers';
import { supabase } from '@/integrations/supabase/client';
import { useBuzzApi } from '@/hooks/buzz/useBuzzApi';

interface BuzzMapButtonSecureProps {
  onBuzzPress: () => void;
  mapCenter?: [number, number];
  onAreaGenerated?: (lat: number, lng: number, radius: number) => void;
}

const BuzzMapButtonSecure: React.FC<BuzzMapButtonSecureProps> = ({
  onBuzzPress,
  mapCenter,
  onAreaGenerated
}) => {
  const { isAuthenticated, user } = useAuthContext();
  const { callBuzzApi } = useBuzzApi();
  const { 
    nextLevel, 
    nextRadiusKm, 
    nextPriceEur,
    nextCostM1U,
    loading: pricingLoading 
  } = useBuzzMapPricingNew(user?.id);
  
  const { unitsData } = useM1UnitsRealtime(user?.id);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<[number, number] | null>(null);

  // Get current geolocation
  useEffect(() => {
    if (!navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setCurrentLocation([position.coords.latitude, position.coords.longitude]);
      },
      (error) => {
        console.warn('Geolocation error:', error);
        // Fallback to map center or Rome coordinates
        if (mapCenter) {
          setCurrentLocation(mapCenter);
        } else {
          setCurrentLocation([41.9028, 12.4964]); // Rome fallback
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [mapCenter]);

  const getCoordinates = (): [number, number] => {
    // Priority: current GPS location > map center > last known position > Rome fallback
    if (currentLocation) return currentLocation;
    if (mapCenter && mapCenter[0] && mapCenter[1]) return mapCenter;
    
    // Check localStorage for last known position
    const lastPos = localStorage.getItem('lastKnownPosition');
    if (lastPos) {
      try {
        const parsed = JSON.parse(lastPos);
        if (parsed.lat && parsed.lng) return [parsed.lat, parsed.lng];
      } catch (e) {
        console.warn('Failed to parse last known position:', e);
      }
    }
    
    // Rome fallback
    return [41.9028, 12.4964];
  };

  const handleBuzzMapPress = async () => {
    if (!isAuthenticated || !user) {
      toast.error('Devi accedere per usare BUZZ MAP.');
      return;
    }

    const coordinates = getCoordinates();
    if (!coordinates || !coordinates[0] || !coordinates[1]) {
      toast.error('Posizione necessaria per BUZZ MAP');
      return;
    }

    // Save current position for future fallback
    localStorage.setItem('lastKnownPosition', JSON.stringify({
      lat: coordinates[0],
      lng: coordinates[1],
      timestamp: Date.now()
    }));

    const costM1U = nextCostM1U;
    const currentBalance = unitsData?.balance || 0;

    console.log('💎 M1SSION™ BUZZ MAP: Initiating M1U payment', {
      level: nextLevel,
      radiusKm: nextRadiusKm,
      costM1U,
      currentBalance,
      coordinates,
      userId: user.id
    });

    // Check M1U balance
    if (currentBalance < costM1U) {
      console.warn('❌ M1SSION™ BUZZ MAP: Insufficient M1U balance', {
        required: costM1U,
        available: currentBalance
      });
      showInsufficientM1UToast(costM1U, currentBalance);
      return;
    }

    setIsProcessing(true);

    try {
      // Call RPC to spend M1U and create BUZZ MAP area
      const { data: spendResult, error: spendError } = await (supabase as any).rpc('buzz_map_spend_m1u', {
        p_cost_m1u: costM1U,
        p_latitude: coordinates[0],
        p_longitude: coordinates[1],
        p_radius_km: nextRadiusKm
      });

      if (spendError) {
        console.error('❌ M1SSION™ BUZZ MAP: RPC error', spendError);
        toast.error('Errore nel processare il pagamento M1U');
        return;
      }

      if (!(spendResult as any)?.success) {
        const errorType = (spendResult as any)?.error || 'unknown';
        console.error('❌ M1SSION™ BUZZ MAP: Payment failed', { error: errorType });
        
        if (errorType === 'insufficient_m1u') {
          showInsufficientM1UToast(costM1U, (spendResult as any).current_balance || 0);
        } else {
          toast.error(`Errore: ${errorType}`);
        }
        return;
      }

      // M1U spent successfully via RPC
      console.log('✅ M1SSION™ BUZZ MAP: M1U spent successfully', {
        spent: (spendResult as any).spent,
        newBalance: (spendResult as any).new_balance
      });

      // Now call edge function to actually create the area in user_map_areas
      console.log('🗺️ M1SSION™ BUZZ MAP: Calling edge function to create area...');
      const edgeResult = await callBuzzApi({
        userId: user.id,
        generateMap: true,
        coordinates: { lat: coordinates[0], lng: coordinates[1] },
        sessionId: Date.now().toString()
      });

      // 🔥 FIX: Check for undefined result (network/CORS failure)
      if (!edgeResult) {
        console.error('❌ M1SSION™ BUZZ MAP: No response from edge function (network/CORS error)');
        toast.error('Errore di connessione. Verifica la tua connessione e riprova.');
        return;
      }

      if (!edgeResult.success) {
        console.error('❌ M1SSION™ BUZZ MAP: Edge function failed', edgeResult);
        toast.error(edgeResult.errorMessage || 'Errore durante la creazione dell\'area. Riprova.');
        return;
      }

      console.log('✅ M1SSION™ BUZZ MAP: Area created successfully', {
        areaId: edgeResult.area_id || (spendResult as any).area_id,
        level: nextLevel,
        radiusKm: nextRadiusKm
      });

      // Show success toast
      toast.success(
        `BUZZ MAP creato · Livello ${nextLevel} · ${Math.round(nextRadiusKm)}km · ${costM1U} M1U`,
        {
          duration: 4000,
          style: {
            background: 'linear-gradient(135deg, #9333EA 0%, #EF4444 100%)',
            color: 'white',
            fontWeight: 'bold'
          }
        }
      );

      // Notify parent components to reload areas
      onAreaGenerated?.(coordinates[0], coordinates[1], nextRadiusKm);
      onBuzzPress();

      // Dispatch success event for other components
      window.dispatchEvent(new CustomEvent('buzzMapCreated', {
        detail: { 
          level: nextLevel,
          radiusKm: nextRadiusKm,
          costM1U,
          coordinates,
          areaId: edgeResult.area_id || (spendResult as any).area_id
        }
      }));

    } catch (error: any) {
      console.error('❌ M1SSION™ BUZZ MAP: Exception', error);
      if (error.message?.includes('429')) {
        toast.error('Hai raggiunto il limite giornaliero. Riprova dopo mezzanotte.');
      } else {
        toast.error('Errore durante la creazione della BUZZ MAP');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      {/* M1SSION™ BUZZ MAP Button - Centered Bottom, +10% Size, Pulsating Animation */}
      <motion.div 
        className="fixed left-1/2 transform -translate-x-1/2 z-50"
        style={{ 
          bottom: 'clamp(16px, 3vh, 28px)',
          transform: 'translateX(-50%)'
        }}
      >
        <motion.button
          className="relative rounded-full transition-all duration-300 bg-gradient-to-br from-purple-500 to-red-500 hover:scale-110 active:scale-95"
          onClick={handleBuzzMapPress}
          disabled={!isAuthenticated || isProcessing || pricingLoading}
          style={{
            width: '96px',
            height: '96px',
            border: '2px solid rgba(255, 255, 255, 0.2)',
            boxShadow: `
              inset 0 -8px 20px rgba(0, 0, 0, 0.4),
              inset 0 8px 20px rgba(255, 255, 255, 0.1),
              inset -8px 0 20px rgba(147, 51, 234, 0.3),
              inset 8px 0 20px rgba(239, 68, 68, 0.3),
              0 0 40px rgba(147, 51, 234, 0.4),
              0 0 20px rgba(239, 68, 68, 0.3),
              0 15px 40px rgba(0, 0, 0, 0.6),
              0 8px 20px rgba(0, 0, 0, 0.4)
            `,
          }}
          whileTap={{ 
            scale: isAuthenticated ? 0.9 : 1,
          }}
          whileHover={{
            boxShadow: `
              inset 0 -10px 25px rgba(0, 0, 0, 0.5),
              inset 0 10px 25px rgba(255, 255, 255, 0.15),
              inset -10px 0 25px rgba(147, 51, 234, 0.4),
              inset 10px 0 25px rgba(239, 68, 68, 0.4),
              0 0 60px rgba(147, 51, 234, 0.6),
              0 0 30px rgba(239, 68, 68, 0.5),
              0 20px 50px rgba(0, 0, 0, 0.7),
              0 10px 25px rgba(0, 0, 0, 0.5)
            `,
          }}
          aria-label="BUZZ MAP"
          animate={{
            scale: [1, 1.06, 1],
          }}
          transition={{
            scale: {
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            },
          }}
        >
          <div className="absolute top-0 left-0 w-full h-full rounded-full flex flex-col items-center justify-center">
            {isProcessing || pricingLoading ? (
              <Lock className="text-white animate-pulse" size={28} />
            ) : (
              <>
                <span className="text-sm text-white font-bold leading-none">
                  BUZZ MAP
                </span>
                <span className="text-xs text-white/90 leading-none mt-1">
                  {Math.round(nextRadiusKm)}km · {nextCostM1U} M1U
                </span>
              </>
            )}
          </div>
        </motion.button>
      </motion.div>
    </>
  );
};

export default BuzzMapButtonSecure;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
