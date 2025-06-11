
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/auth';
import { toast } from 'sonner';

export interface BuzzMapArea {
  id: string;
  lat: number;
  lng: number;
  radius_km: number;
  week: number;
  created_at: string;
  user_id: string;
}

export const useBuzzMapLogic = () => {
  const { getCurrentUser } = useAuthContext();
  const [isGenerating, setIsGenerating] = useState(false);
  const [areas, setAreas] = useState<BuzzMapArea[]>([]);
  const [dailyBuzzMapCounter, setDailyBuzzMapCounter] = useState(0);
  
  const currentUser = getCurrentUser();
  const userId = currentUser?.id;

  // CRITICAL FIX: Enhanced area loading
  useEffect(() => {
    let isMounted = true;
    
    const loadAreas = async () => {
      if (!userId) {
        const hasDeveloperAccess = localStorage.getItem('developer_access') === 'granted';
        if (!hasDeveloperAccess) return;
      }

      try {
        const { data, error } = await supabase
          .from('user_map_areas')
          .select('*')
          .eq('user_id', userId || '00000000-0000-4000-a000-000000000000')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('❌ Error loading areas:', error);
          return;
        }

        const mappedAreas = (data || []).map(area => ({
          id: area.id,
          lat: area.lat,
          lng: area.lng,
          radius_km: area.radius_km,
          week: area.week,
          created_at: area.created_at,
          user_id: area.user_id
        }));

        if (isMounted) {
          setAreas(mappedAreas);
          console.log('✅ EMERGENCY FIX: Areas loaded:', mappedAreas.length);
        }
      } catch (error) {
        console.error('❌ Exception loading areas:', error);
      }
    };

    loadAreas();
    
    return () => {
      isMounted = false;
    };
  }, [userId]);

  // CRITICAL FIX: Enhanced area generation with proper radius reduction
  const generateBuzzMapArea = useCallback(async (lat: number, lng: number): Promise<BuzzMapArea | null> => {
    if (!userId) {
      const hasDeveloperAccess = localStorage.getItem('developer_access') === 'granted';
      const isDeveloperEmail = localStorage.getItem('developer_user_email') === 'wikus77@hotmail.it';
      
      if (!hasDeveloperAccess && !isDeveloperEmail) {
        console.error('❌ BUZZ MAP: No valid user ID');
        toast.error('Devi essere loggato per utilizzare BUZZ MAPPA');
        return null;
      }
    }

    setIsGenerating(true);
    
    try {
      console.log('🚀 EMERGENCY FIX: Starting dynamic area generation...');

      // CRITICAL FIX: Calculate radius based on existing areas
      const existingAreas = areas.filter(area => area.user_id === (userId || '00000000-0000-4000-a000-000000000000'));
      let newRadius = 500; // Start at 500km
      
      if (existingAreas.length > 0) {
        // Reduce by 5% for each subsequent generation
        const lastRadius = existingAreas[0].radius_km;
        newRadius = Math.max(5, lastRadius * 0.95); // Minimum 5km
        console.log(`📊 EMERGENCY FIX: Reducing radius from ${lastRadius}km to ${newRadius}km`);
      }

      // Call edge function for area generation
      const { data: response, error: edgeError } = await supabase.functions.invoke('handle-buzz-press', {
        body: {
          userId: userId || '00000000-0000-4000-a000-000000000000',
          generateMap: true,
          coordinates: { lat, lng },
          radius: newRadius
        }
      });

      if (edgeError) {
        console.error('❌ EMERGENCY FIX: Edge function error:', edgeError);
        toast.error('Errore nella chiamata al server');
        return null;
      }

      if (!response?.success) {
        console.error('❌ EMERGENCY FIX: Edge function failed:', response?.errorMessage);
        toast.error(response?.errorMessage || 'Errore nella generazione area');
        return null;
      }

      // Create new area from response
      const newArea: BuzzMapArea = {
        id: response.areaId || `area-${Date.now()}`,
        lat: response.lat || lat,
        lng: response.lng || lng,
        radius_km: response.radius_km || newRadius,
        week: Math.ceil((Date.now() - new Date('2025-01-01').getTime()) / (7 * 24 * 60 * 60 * 1000)),
        created_at: new Date().toISOString(),
        user_id: userId || '00000000-0000-4000-a000-000000000000'
      };

      // Update local state
      setAreas(prev => [newArea, ...prev]);
      setDailyBuzzMapCounter(response.generation_number || 1);

      console.log('✅ EMERGENCY FIX: Area generated successfully:', newArea);
      toast.success(`✅ Nuova area BUZZ MAPPA generata: ${newArea.radius_km.toFixed(1)}km`);

      return newArea;

    } catch (error) {
      console.error('❌ EMERGENCY FIX: Exception generating area:', error);
      toast.error('Errore imprevisto nella generazione');
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [userId, areas]);

  const getActiveArea = useCallback(() => {
    return areas.length > 0 ? areas[0] : null;
  }, [areas]);

  const currentWeekAreas = useCallback(() => {
    const currentWeek = Math.ceil((Date.now() - new Date('2025-01-01').getTime()) / (7 * 24 * 60 * 60 * 1000));
    return areas.filter(area => area.week === currentWeek);
  }, [areas]);

  const reloadAreas = useCallback(async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('user_map_areas')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        const mappedAreas = data.map(area => ({
          id: area.id,
          lat: area.lat,
          lng: area.lng,
          radius_km: area.radius_km,
          week: area.week,
          created_at: area.created_at,
          user_id: area.user_id
        }));
        
        setAreas(mappedAreas);
        console.log('✅ EMERGENCY FIX: Areas reloaded:', mappedAreas.length);
      }
    } catch (error) {
      console.error('❌ Error reloading areas:', error);
    }
  }, [userId]);

  return {
    isGenerating,
    areas,
    dailyBuzzMapCounter,
    generateBuzzMapArea,
    getActiveArea,
    currentWeekAreas: currentWeekAreas(),
    reloadAreas,
    loadAreas: reloadAreas
  };
};
