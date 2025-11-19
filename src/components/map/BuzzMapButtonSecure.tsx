// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthContext } from '@/contexts/auth';
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
  
  // 🔥 SERVER-AUTHORITATIVE: Get pricing from RPC, not client calculation
  const [serverPricing, setServerPricing] = useState<{
    level: number;
    radius_km: number;
    m1u: number;
    current_week: number;
    current_count: number;
  } | null>(null);
  const [pricingLoading, setPricingLoading] = useState(true);
  
  const { unitsData } = useM1UnitsRealtime(user?.id);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<[number, number] | null>(null);

  // Load server-authoritative pricing on mount and when user changes
  useEffect(() => {
    const loadServerPricing = async () => {
      if (!user?.id) {
        setPricingLoading(false);
        return;
      }

      try {
        setPricingLoading(true);
        const { data, error } = await (supabase as any).rpc('m1_get_next_buzz_level', {
          p_user_id: user.id
        });

        if (error) {
          console.error('❌ SERVER PRICING: RPC error', error);
          setPricingLoading(false);
          return;
        }

        // RPC returns array with single row
        const pricing = Array.isArray(data) ? data[0] : data;
        
        console.log('✅ PRICING_SOURCE: server', {
          level: pricing.level,
          radius_km: pricing.radius_km,
          m1u: pricing.m1u,
          current_week: pricing.current_week,
          current_count: pricing.current_count
        });

        setServerPricing(pricing);
      } catch (err) {
        console.error('❌ SERVER PRICING: Exception', err);
      } finally {
        setPricingLoading(false);
      }
    };

    loadServerPricing();

    // Reload pricing after buzz area created
    const handleBuzzCreated = () => {
      console.log('🔄 Reloading server pricing after BUZZ...');
      loadServerPricing();
    };

    window.addEventListener('buzzAreaCreated', handleBuzzCreated);
    return () => window.removeEventListener('buzzAreaCreated', handleBuzzCreated);
  }, [user?.id]);

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

    // 🔥 SERVER-AUTHORITATIVE: Use server pricing values
    if (!serverPricing) {
      console.error('❌ M1SSION™ BUZZ MAP: No server pricing available');
      toast.error('Errore nel caricamento dei prezzi. Riprova.');
      return;
    }

    const costM1U = serverPricing.m1u;
    const currentBalance = unitsData?.balance || 0;

    // 🔍 VERIFICA LOG: Server pricing PRIMA del click
    console.log('🔍 [VERIFICA] PRICING PRIMA CLICK:', {
      pricingSource: 'server',
      currentWeek: serverPricing.current_week,
      currentCount: serverPricing.current_count,
      levelNext: serverPricing.level,
      radiusKm: serverPricing.radius_km,
      costM1U: serverPricing.m1u
    });

    console.log('💎 M1SSION™ BUZZ MAP: Initiating M1U payment (SERVER-AUTHORITATIVE)', {
      source: 'server',
      level: serverPricing.level,
      radiusKm: serverPricing.radius_km,
      costM1U,
      currentBalance,
      coordinates,
      userId: user.id,
      currentWeek: serverPricing.current_week,
      currentCount: serverPricing.current_count
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
      // 🔥 NOTE: RPC buzz_map_spend_m1u is DEPRECATED - server calculates everything
      // We only call edge function with coordinates, server does the rest
      console.log('🗺️ M1SSION™ BUZZ MAP: Calling edge function (server will calculate level/radius/cost)...');
      const edgeResult = await callBuzzApi({
        userId: user.id,
        mode: 'map', // 🔥 FIX: Explicit mode to force MAP branch
        generateMap: true,
        coordinates: { lat: coordinates[0], lng: coordinates[1] },
        sessionId: Date.now().toString()
      });

      // 🔍 VERIFICA LOG: Response dell'edge function
      console.log('🔍 [VERIFICA] EDGE FUNCTION RESPONSE:', {
        success: edgeResult?.success,
        fullResponse: edgeResult,
        hasId: !!edgeResult?.area_id,
        level: edgeResult?.level,
        radius_km: edgeResult?.radius_km,
        week: (edgeResult as any)?.week // Temporary debug field
      });

      if (!edgeResult?.area_id) {
        console.error('❌ Edge returned no row (missing area_id)');
      }

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

      const actualLevel = edgeResult.level || serverPricing.level;
      const actualRadius = edgeResult.radius_km || serverPricing.radius_km;
      
      console.log('✅ M1SSION™ BUZZ MAP: Area created successfully (SERVER-AUTHORITATIVE)', {
        areaId: edgeResult.area_id,
        level: actualLevel,
        radiusKm: actualRadius,
        source: 'server'
      });

      // Show success toast
      toast.success(
        `BUZZ MAP creato · Livello ${actualLevel} · ${Math.round(actualRadius)}km · ${costM1U} M1U`,
        {
          duration: 4000,
          style: {
            background: 'linear-gradient(135deg, #9333EA 0%, #EF4444 100%)',
            color: 'white',
            fontWeight: 'bold'
          }
        }
      );

      // 🔥 FIX: Update agent location immediately after BUZZ (geolocation sync)
      try {
        console.log('📍 Updating agent location after BUZZ...', { lat: coordinates[0], lng: coordinates[1] });
        const { error: locationError } = await (supabase as any).rpc('set_my_agent_location', {
          p_lat: coordinates[0],
          p_lng: coordinates[1],
          p_accuracy: null,
          p_status: 'online'
        });
        if (locationError) {
          console.warn('⚠️ Failed to update agent location:', locationError);
        } else {
          console.log('✅ Agent location updated successfully');
        }
      } catch (e) {
        console.warn('⚠️ Agent location update exception:', e);
      }

      // Notify parent components to reload areas
      onAreaGenerated?.(coordinates[0], coordinates[1], actualRadius);
      onBuzzPress();

      // 🔥 FIX: Wait for DB commit/replica, then wait for areas reload, THEN trigger pricing refresh
      // Sequence: Edge Function → 800ms delay → areasReloaded event → pricing update
      console.log('🔄 Step 1/3: Waiting 800ms for DB commit + realtime listener activation...');
      await new Promise(resolve => setTimeout(resolve, 800));

      // 🔥 FIX: Wait for 'areasReloaded' event from MapTiler3D realtime listener
      console.log('🔄 Step 2/3: Waiting for areasReloaded event (max 3s timeout)...');
      await new Promise<void>((resolve) => {
        const timeout = setTimeout(() => {
          console.warn('⚠️ areasReloaded timeout - proceeding anyway');
          resolve();
        }, 3000);

        const handler = () => {
          console.log('✅ areasReloaded event received');
          clearTimeout(timeout);
          window.removeEventListener('areasReloaded', handler);
          resolve();
        };

        window.addEventListener('areasReloaded', handler);
      });

      // 🔥 FIX: NOW dispatch buzzAreaCreated to trigger pricing refresh AFTER layers updated
      console.log('🔄 Step 3/3: Dispatching buzzAreaCreated to reload pricing...');
      window.dispatchEvent(new CustomEvent('buzzAreaCreated', {
        detail: { 
          level: actualLevel,
          radiusKm: actualRadius,
          costM1U,
          lat: coordinates[0],
          lng: coordinates[1],
          areaId: edgeResult.area_id
        }
      }));

      console.log('✅ BUZZ MAP sequence complete (800ms → areasReloaded → pricing)');

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
                  {serverPricing ? `${serverPricing.radius_km}km · ${serverPricing.m1u} M1U` : 'Loading...'}
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
