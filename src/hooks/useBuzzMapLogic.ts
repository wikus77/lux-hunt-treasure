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
      // 🚨 CRITICAL: VERIFY ACTIVE PRIZES FIRST - NO AREAS WITHOUT PRIZES
      const { data: activePrizes } = await supabase
        .from('prizes')
        .select('id, is_active')
        .eq('is_active', true);

      console.warn('🎯 BUZZ MAP CHECK: Active prizes verification:', { 
        activePrizes: activePrizes?.length || 0,
        hasActivePrizes: activePrizes && activePrizes.length > 0,
        user_email: user.email,
        timestamp: new Date().toISOString()
      });

      // 🚨 IMMEDIATE BLOCK: Force return if no active prizes exist
      if (!activePrizes || activePrizes.length === 0) {
        console.warn('🚨 BUZZ MAP BLOCK: NO ACTIVE PRIZES - FORCED EMPTY AREAS');
        setCurrentWeekAreas([]);
        setError(null);
        setLoading(false);
        return;
      }

      // Log active prizes found
      console.log('✅ useBuzzMapLogic: Active prizes found:', activePrizes.map(p => p.id));

      // Check for payment transactions (skip for developer only)
      const isDeveloper = user.email === 'wikus77@hotmail.it';
      
      if (!isDeveloper) {
        const { data: payments } = await supabase
          .from('payment_transactions')
          .select('status')
          .eq('user_id', user.id)
          .eq('status', 'completed')
          .limit(1);

        if (!payments || payments.length === 0) {
          console.log('❌ useBuzzMapLogic: NO PAYMENT VERIFICATION - blocking area display for non-developer');
          setCurrentWeekAreas([]); // NO AREAS WITHOUT PAYMENT
          setLoading(false);
          return;
        }
      }

      // 🚨 ONLY fetch areas if active prizes exist AND payment verified
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
        supabase.removeChannel(channel);
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
