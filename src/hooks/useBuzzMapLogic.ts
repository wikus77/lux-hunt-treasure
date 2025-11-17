// © 2025 Joseph MULÉ – M1SSION™ – Tutti i diritti riservati
// M1SSION™ - BUZZ Map Logic Hook - RESET COMPLETO 17/07/2025

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
      
      const { data: userAreas, error: userAreasError } = await supabase
        .from('user_map_areas')
        .select('*')
        .eq('user_id', user.id)
        .eq('source', 'buzz_map') // 🔥 CRITICAL: Only M1U-paid areas
        .eq('week', currentWeek) // 🔥 NEW: Filter by current ISO week
        .order('created_at', { ascending: false });

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
        console.log(`🗺️ BUZZ AREA (Week ${area.week}): Area ${area.id} - radius_km: ${area.radius_km}, lat: ${area.lat}, lng: ${area.lng}`);
        
        // 🚨 REMOVED: No duplicate toast here - only from edge function after payment
        
        return {
          id: area.id,
          lat: area.lat,
          lng: area.lng,
          radius_km: area.radius_km,
          coordinates: { lat: area.lat, lng: area.lng },
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

  const reloadAreas = () => {
    console.log('🔄 useBuzzMapLogic: Manual reload triggered');
    fetchCurrentWeekAreas();
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
              window.dispatchEvent(new CustomEvent('buzzAreaCreated', {
                detail: {
                  lat: payload.new.lat,
                  lng: payload.new.lng,
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
