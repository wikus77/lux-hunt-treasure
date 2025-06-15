
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
      console.log('❌ useBuzzMapLogic: No user ID, skipping fetch');
      return;
    }
    
    console.log('🔄 useBuzzMapLogic: Fetching areas for user:', user.id);
    setLoading(true);
    
    try {
      // CRITICAL: Use 'user_map_areas' table and fetch ALL areas for this user
      const { data, error: fetchError } = await supabase
        .from('user_map_areas')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('❌ useBuzzMapLogic: Error fetching areas:', fetchError);
        setError(fetchError);
        return;
      }

      console.log('✅ useBuzzMapLogic: Raw data from user_map_areas:', data);

      // Transform to BuzzMapArea format with ALL required properties
      const transformedAreas: BuzzMapArea[] = (data || []).map((area, index) => {
        const transformedArea = {
          id: area.id,
          lat: area.lat,
          lng: area.lng,
          radius_km: area.radius_km,
          coordinates: { lat: area.lat, lng: area.lng },
          radius: area.radius_km * 1000, // Convert to meters
          color: '#00FFFF', // Cyan color for BUZZ areas
          colorName: 'cyan',
          week: area.week || 1,
          generation: index + 1,
          isActive: true,
          user_id: area.user_id,
          created_at: area.created_at || new Date().toISOString()
        };
        
        console.log(`🔄 useBuzzMapLogic: Transformed area ${index + 1}:`, transformedArea);
        return transformedArea;
      });

      console.log('✅ useBuzzMapLogic: Setting transformed areas:', transformedAreas.length);
      setCurrentWeekAreas(transformedAreas);
      setError(null);
      
    } catch (err) {
      console.error('❌ useBuzzMapLogic: Exception fetching areas:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  const reloadAreas = () => {
    console.log('🔄 useBuzzMapLogic: Manual reload triggered');
    fetchCurrentWeekAreas();
  };

  // CRITICAL: Auto-fetch on user change and setup real-time subscription
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
            fetchCurrentWeekAreas(); // Refresh the list
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
            fetchCurrentWeekAreas(); // Refresh the list
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
