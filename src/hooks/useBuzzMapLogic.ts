// © 2025 Joseph MULÉ – M1SSION™ – Tutti i diritti riservati
// M1SSION™ - BUZZ Map Logic Hook - RESET COMPLETO 17/07/2025

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/auth';

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
      
      // 🔥 STEP 2: Check for completed BUZZ MAP payments
      const { data: payments, error: paymentError } = await supabase
        .from('payment_transactions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .ilike('description', '%Buzz Map%')
        .gte('created_at', '2025-07-17T00:00:00Z');

      console.log('💳 BUZZ MAP PAYMENTS CHECK:', { 
        count: payments?.length || 0, 
        payments: payments,
        error: paymentError 
      });

      if (paymentError) {
        console.error('❌ PAYMENTS ERROR:', paymentError);
        setError(paymentError);
        setCurrentWeekAreas([]);
        setLoading(false);
        return;
      }

      // 🚨 CRITICAL: Must have completed BUZZ MAP payments to show areas
      if (!payments || payments.length === 0) {
        console.warn('🚨 NO COMPLETED BUZZ MAP PAYMENTS - CLEARING ALL AREAS');
        setCurrentWeekAreas([]);
        setLoading(false);
        return;
      }

      // 🔥 STEP 3: Fetch user map areas (only after validations passed)
      const { data, error: fetchError } = await supabase
        .from('user_map_areas')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', '2025-07-17T00:00:00.000Z') // Only show areas from current mission
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('❌ useBuzzMapLogic: Error fetching areas:', fetchError);
        setError(fetchError);
        setCurrentWeekAreas([]);
        return;
      }

      console.log('✅ useBuzzMapLogic: Raw data from user_map_areas (post 2025-07-17):', data);

      // 🚨 FIX CRITICO: Only transform if data exists and all checks passed
      if (!data || data.length === 0) {
        console.log('✅ useBuzzMapLogic: No valid user areas found - displaying empty map');
        setCurrentWeekAreas([]);
        setError(null);
        setLoading(false);
        return;
      }

      // Transform ONLY if data exists and all verifications passed
      const transformedAreas: BuzzMapArea[] = data.map((area, index) => ({
        id: area.id,
        lat: area.lat,
        lng: area.lng,
        radius_km: area.radius_km,
        coordinates: { lat: area.lat, lng: area.lng },
        radius: area.radius_km * 1000,
        color: '#00FFFF',
        colorName: 'cyan',
        week: area.week || 1,
        generation: index + 1,
        isActive: true,
        user_id: area.user_id,
        created_at: area.created_at || new Date().toISOString()
      }));

      console.log('✅ useBuzzMapLogic: Setting authorized areas:', transformedAreas.length);
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
          }
        )
        .subscribe();

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
