
// © 2025 Joseph MULÉ – CEO di NIYVORA KFT™
// M1SSION™ - BUZZ Map Logic Hook

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

      // Block if no active prizes exist
      if (!activePrizes || activePrizes.length === 0) {
        console.log('❌ useBuzzMapLogic: NO ACTIVE PRIZES - blocking all area display');
        setCurrentWeekAreas([]); // NO AREAS WITHOUT ACTIVE PRIZES
        setLoading(false);
        return;
      }

      // 🚨 CRITICAL: MANDATORY PAYMENT VERIFICATION BEFORE SHOWING AREAS
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('status, tier')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      // Check for payment transactions
      const { data: payments } = await supabase
        .from('payment_transactions')
        .select('status')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .limit(1);

      // Block if no subscription AND no payments (except for developer)
      const isDeveloper = user.email === 'wikus77@hotmail.it';
      
      if (!isDeveloper && !subscription && (!payments || payments.length === 0)) {
        console.log('❌ useBuzzMapLogic: NO PAYMENT VERIFICATION - blocking area display');
        setCurrentWeekAreas([]); // NO AREAS WITHOUT PAYMENT
        setLoading(false);
        return;
      }

      // 🚨 ONLY fetch areas if payment verified or developer AND active prizes exist
      const { data, error: fetchError } = await supabase
        .from('user_map_areas')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('❌ useBuzzMapLogic: Error fetching areas:', fetchError);
        setError(fetchError);
        setCurrentWeekAreas([]);
        return;
      }

      console.log('✅ useBuzzMapLogic: Raw data from user_map_areas:', data);

      // Transform ONLY if data exists and payment verified AND active prizes exist
      const transformedAreas: BuzzMapArea[] = (data || []).map((area, index) => ({
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
