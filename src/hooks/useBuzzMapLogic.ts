// © 2025 Joseph MULÉ – M1SSION™ – Tutti i diritti riservati
// M1SSION™ - BUZZ Map Logic Hook - RESET COMPLETO 17/07/2025
// @ts-nocheck

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/auth';
import { toast } from 'sonner';
import { emitReconnecting, emitSubscribed, emitError } from '@/lib/realtime/reconnectBus';
import { getCurrentWeekOfYear } from '@/lib/weekUtils';

export interface BuzzMapArea {
  id: string;
  lat: number;
  lng: number;
  radius_km: number;
  coordinates: { lat: number; lng: number };
  radius: number;
  color: string;
  colorName: string;
  week: number;
  generation: number;
  level?: number; // 🔍 M1-3D VERIFY: Track level from DB
  isActive: boolean;
  user_id: string;
  created_at: string;
}

export const useBuzzMapLogic = () => {
  const { user } = useAuthContext();
  const [currentWeekAreas, setCurrentWeekAreas] = useState<BuzzMapArea[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchCurrentWeekAreas = async () => {
    if (!user?.id) {
      console.log('❌ useBuzzMapLogic: No user ID, clearing areas');
      setCurrentWeekAreas([]); // CLEAR ILLEGAL AREAS
      return;
    }
    
    console.log('🔄 useBuzzMapLogic: Checking authorization for user:', user.id);
    setLoading(true);
    
    try {
      // 🔥 STEP 1: Check for active BUZZ game targets (not regular prizes)
      const { data: gameTargets, error: targetError } = await supabase
        .from('buzz_game_targets')
        .select('*')
        .eq('is_active', true);

      console.log('🎯 BUZZ GAME TARGETS CHECK:', { 
        count: gameTargets?.length || 0, 
        targets: gameTargets,
        error: targetError 
      });

      if (targetError) {
        console.error('❌ GAME TARGETS ERROR:', targetError);
        setError(targetError);
        setCurrentWeekAreas([]);
        setLoading(false);
        return;
      }

      // Validate that targets have proper coordinates
      const validTargets = gameTargets?.filter(target => 
        target.lat && target.lon && 
        target.lat !== 0 && target.lon !== 0 &&
        Math.abs(target.lat) <= 90 && Math.abs(target.lon) <= 180
      ) || [];

      console.log('🧭 VALID TARGETS CHECK:', { 
        total: gameTargets?.length || 0,
        valid: validTargets.length,
        validTargets: validTargets.map(t => ({ id: t.id, lat: t.lat, lon: t.lon, city: t.city }))
      });

      if (validTargets.length === 0) {
        console.warn('🚨 NO VALID BUZZ GAME TARGETS - CLEARING ALL AREAS');
        setCurrentWeekAreas([]);
        setLoading(false);
        return;
      }
      
      // 🔥 STEP 2: BUZZ MAP via M1U system (NEW - 2025-11-13)
      // BUZZ MAP now uses M1U payments (buzz_map_spend_m1u RPC), not Stripe payments
      // We check user_map_areas directly with source='buzz_map' filter
      // Payment validation is handled by the RPC itself (M1U balance check + transaction log)
      console.log('💎 M1SSION™ BUZZ MAP: Checking M1U-based areas (source=buzz_map)');

      // 🔥 STEP 3: Fetch user map areas with M1U-based filter + WEEKLY COUNTER
      // CRITICAL: Filter by source='buzz_map' AND current week to match backend logic
      const currentWeek = getCurrentWeekOfYear();
      console.log('🗓️ BUZZ MAP: Fetching areas for current week:', currentWeek);
      
      // 🔥 CRITICAL: Query ONLY the latest (CURRENT) row for the week
      const { data: userAreas, error: userAreasError } = await supabase
        .from('user_map_areas')
        .select('*')
        .eq('user_id', user.id)
        .eq('source', 'buzz_map') // 🔥 CRITICAL: Only M1U-paid areas
        .eq('week', currentWeek) // 🔥 NEW: Filter by current ISO week
        .order('created_at', { ascending: false })
        .limit(1); // 🔥 FIX: Only take the latest (CURRENT) area

      console.log('🗺️ USER MAP AREAS CHECK (M1U-BASED + WEEKLY):', { 
        count: userAreas?.length || 0, 
        currentWeek,
        areas: userAreas?.map(a => ({ id: a.id, lat: a.lat, lng: a.lng, radius_km: a.radius_km, week: a.week, source: a.source, created_at: a.created_at })),
        error: userAreasError,
        query: "M1U payment system - fetching user_map_areas with source='buzz_map' for current week only"
      });

      if (userAreasError) {
        console.error('❌ USER AREAS ERROR:', userAreasError);
        setError(userAreasError);
        setCurrentWeekAreas([]);
        setLoading(false);
        return;
      }

      // 🚨 CRITICAL: Check if user has M1U-based map areas
      if (!userAreas || userAreas.length === 0) {
        console.warn('🚨 NO M1U-BASED MAP AREAS FOUND (source=buzz_map)');
        console.log('💡 This is normal if user has not created any BUZZ MAP areas yet via M1U payment');
        setCurrentWeekAreas([]);
        setLoading(false);
        return;
      }

      // 🔥 STEP 3: Transform areas that exist (using data from previous step)
      console.log('✅ useBuzzMapLogic: Raw data from user_map_areas (post 2025-07-17):', userAreas);

      // Transform user areas for display with PROPER RADIUS LOGGING (WEEKLY FILTERED)
      const transformedAreas: BuzzMapArea[] = userAreas.map((area, index) => {
        // 🔥 FIX: Safe coordinate fallback for center_lat/center_lng vs lat/lng
        const lat = area.center_lat ?? area.lat;
        const lng = area.center_lng ?? area.lng;
        
        // ⚠️ Log warning if using fallback coordinates
        if ((area.lat === null || area.lat === undefined) && area.center_lat !== null && area.center_lat !== undefined) {
          console.warn(`⚠️ BUZZ AREA ${area.id}: Using fallback center_lat (${area.center_lat}) because lat is ${area.lat}`);
        }
        if ((area.lng === null || area.lng === undefined) && area.center_lng !== null && area.center_lng !== undefined) {
          console.warn(`⚠️ BUZZ AREA ${area.id}: Using fallback center_lng (${area.center_lng}) because lng is ${area.lng}`);
        }
        
        console.log(`🗺️ BUZZ AREA (Week ${area.week}): Area ${area.id} - level: ${area.level}, radius_km: ${area.radius_km}, lat: ${lat}, lng: ${lng}`);
        
        // 🚨 REMOVED: No duplicate toast here - only from edge function after payment
        
        return {
          id: area.id,
          lat,
          lng,
          radius_km: area.radius_km,
          level: area.level, // 🔍 M1-3D VERIFY: Track level from DB
          coordinates: { lat, lng },
          radius: area.radius_km * 1000, // Convert to meters for map display
          color: '#00FFFF',
          colorName: 'cyan',
          week: area.week || currentWeek,
          generation: index + 1,
          isActive: true,
          user_id: area.user_id,
          created_at: area.created_at || new Date().toISOString()
        };
      });

      // 🔍 VERIFICA LOG: Areas dopo fetchCurrentWeekAreas
      console.log('🔍 [VERIFICA] AREAS DOPO FETCH:', {
        count: transformedAreas.length,
        week: currentWeek,
        firstArea: transformedAreas[0] || null,
        firstAreaDetails: transformedAreas[0] ? {
          id: transformedAreas[0].id,
          level: transformedAreas[0].level,
          radius_km: transformedAreas[0].radius_km,
          week: transformedAreas[0].week
        } : null
      });

      console.log('✅ useBuzzMapLogic: Setting authorized areas (current week only):', transformedAreas.length);
      setCurrentWeekAreas(transformedAreas);
      setError(null);
      
    } catch (err) {
      console.error('❌ useBuzzMapLogic: Exception fetching areas:', err);
      setError(err as Error);
      setCurrentWeekAreas([]); // CLEAR ON ERROR
    } finally {
      setLoading(false);
    }
  };

  const reloadAreas = async (): Promise<void> => {
    console.log('🔄 useBuzzMapLogic: Manual reload triggered');
    await fetchCurrentWeekAreas(); // ✅ FIX: Await completion before dispatching events
  };

  // CRITICAL: Auto-fetch on user change but respect payment requirements AND active prizes
  useEffect(() => {
    fetchCurrentWeekAreas();
    
    // Set up real-time subscription for new areas
    if (user?.id) {
      console.log('🔔 useBuzzMapLogic: Setting up real-time subscription for user:', user.id);
      
      const channel = supabase
        .channel('user_map_areas_changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'user_map_areas',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('🔔 useBuzzMapLogic: New area inserted via real-time:', payload);
            fetchCurrentWeekAreas(); // Refresh with payment verification
            
            // Trigger map auto-center via custom event
            if (payload.new) {
              console.log('📍 useBuzzMapLogic: Broadcasting area creation event');
              // 🔥 UNIFIED COORDS FIX: Use center_lat/center_lng with fallback to lat/lng
              const lat = payload.new.center_lat ?? payload.new.lat;
              const lng = payload.new.center_lng ?? payload.new.lng;
              window.dispatchEvent(new CustomEvent('buzzAreaCreated', {
                detail: {
                  lat,
                  lng,
                  radius_km: payload.new.radius_km
                }
              }));
            }
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            emitSubscribed('user_map_areas_changes');
            console.log('✅ Subscribed to user_map_areas_changes');
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            emitError(String(status), 'user_map_areas_changes');
          }
        });

      return () => {
        console.log('🔔 useBuzzMapLogic: Unsubscribing from real-time');
        channel.unsubscribe();
      };
    }
  }, [user?.id]);

  return {
    areas: currentWeekAreas,
    loading,
    error: error || new Error('No error'),
    currentWeekAreas,
    reloadAreas
  };
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
