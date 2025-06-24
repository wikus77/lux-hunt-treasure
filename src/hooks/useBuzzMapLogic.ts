
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/auth';
import { useQueryClient } from '@tanstack/react-query';

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
  const queryClient = useQueryClient();
  const [currentWeekAreas, setCurrentWeekAreas] = useState<BuzzMapArea[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // CRITICAL FIX: Stable fetch function with proper error handling
  const fetchCurrentWeekAreas = useCallback(async () => {
    if (!user?.id) {
      console.log('❌ useBuzzMapLogic: No user ID, skipping fetch');
      setCurrentWeekAreas([]);
      return;
    }
    
    console.log('🔄 useBuzzMapLogic: Fetching areas for user:', user.id);
    setLoading(true);
    
    try {
      // CRITICAL FIX: Proper await with error handling
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

      // CRITICAL FIX: Robust data transformation with validation
      const transformedAreas: BuzzMapArea[] = (data || [])
        .filter(area => area && typeof area.lat === 'number' && typeof area.lng === 'number')
        .map((area, index) => ({
          id: area.id,
          lat: area.lat,
          lng: area.lng,
          radius_km: area.radius_km || 100,
          coordinates: { lat: area.lat, lng: area.lng },
          radius: (area.radius_km || 100) * 1000, // Convert to meters
          color: '#00FFFF',
          colorName: 'cyan',
          week: area.week || 1,
          generation: index + 1,
          isActive: true,
          user_id: area.user_id,
          created_at: area.created_at || new Date().toISOString()
        }));

      console.log('✅ useBuzzMapLogic: Setting transformed areas:', transformedAreas.length);
      setCurrentWeekAreas(transformedAreas);
      setError(null);
      
    } catch (err) {
      console.error('❌ useBuzzMapLogic: Exception fetching areas:', err);
      setError(err as Error);
      setCurrentWeekAreas([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // CRITICAL FIX: Manual reload with query invalidation
  const reloadAreas = useCallback(async () => {
    console.log('🔄 useBuzzMapLogic: Manual reload triggered');
    await queryClient.invalidateQueries({ queryKey: ['user_map_areas'] });
    await fetchCurrentWeekAreas();
  }, [fetchCurrentWeekAreas, queryClient]);

  // CRITICAL FIX: Optimized effect with proper dependencies
  useEffect(() => {
    fetchCurrentWeekAreas();
    
    // CRITICAL FIX: Real-time subscription with proper cleanup
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
            // CRITICAL FIX: Debounced refresh to prevent race conditions
            setTimeout(() => {
              fetchCurrentWeekAreas();
            }, 1000);
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'user_map_areas',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('🔔 useBuzzMapLogic: Area updated via real-time:', payload);
            setTimeout(() => {
              fetchCurrentWeekAreas();
            }, 1000);
          }
        )
        .subscribe();

      return () => {
        console.log('🔔 useBuzzMapLogic: Unsubscribing from real-time');
        supabase.removeChannel(channel);
      };
    }
  }, [user?.id, fetchCurrentWeekAreas]);

  return {
    areas: currentWeekAreas,
    loading,
    error,
    currentWeekAreas,
    reloadAreas
  };
};
