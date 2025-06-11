
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/auth';
import { useBuzzMapCounter } from './buzz/useBuzzMapCounter';
import { useBuzzMapRadius } from './buzz/useBuzzMapRadius';
import { useBuzzMapNotifications } from './buzz/useBuzzMapNotifications';
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
  const [precisionMode] = useState('high');
  
  // Get current user with developer support
  const currentUser = getCurrentUser();
  const userId = currentUser?.id;
  
  const { incrementCounter } = useBuzzMapCounter(userId);
  const { calculateRadius } = useBuzzMapRadius();
  const { sendAreaGeneratedNotification } = useBuzzMapNotifications();

  // FIXED: Stabilized area loading with immediate effect
  useEffect(() => {
    let isMounted = true;
    
    const loadAreas = async () => {
      if (!userId) {
        const hasDeveloperAccess = localStorage.getItem('developer_access') === 'granted';
        if (!hasDeveloperAccess) return;
        console.log('🔧 Developer mode: Using fallback for area loading');
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
          console.log('✅ Areas loaded:', mappedAreas.length);
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

  // FIXED: Enhanced area generation with BACKEND EDGE FUNCTION CALL
  const generateBuzzMapArea = useCallback(async (lat: number, lng: number): Promise<BuzzMapArea | null> => {
    if (!userId) {
      const hasDeveloperAccess = localStorage.getItem('developer_access') === 'granted';
      const isDeveloperEmail = localStorage.getItem('developer_user_email') === 'wikus77@hotmail.it';
      
      if (!hasDeveloperAccess && !isDeveloperEmail) {
        console.error('❌ BUZZ MAP: No valid user ID');
        toast.error('Devi essere loggato per utilizzare BUZZ MAPPA');
        return null;
      }
      
      console.log('🔧 Developer mode: Using fallback for BUZZ MAP generation');
    }

    setIsGenerating(true);
    
    try {
      console.log('🚀 BUZZ MAP: Calling backend edge function...');

      // CRITICAL FIX: Call the edge function instead of local generation
      const { data: response, error: edgeError } = await supabase.functions.invoke('handle-buzz-press', {
        body: {
          userId: userId || '00000000-0000-4000-a000-000000000000',
          generateMap: true,
          coordinates: { lat, lng }
        }
      });

      if (edgeError) {
        console.error('❌ Edge function error:', edgeError);
        toast.error('Errore nella chiamata al server');
        return null;
      }

      if (!response?.success) {
        console.error('❌ Edge function failed:', response?.errorMessage);
        toast.error(response?.errorMessage || 'Errore nella generazione area');
        return null;
      }

      console.log('✅ BUZZ MAP: Edge function success:', response);

      // Create local area object from response
      if (response.radius_km && response.lat && response.lng) {
        const newArea: BuzzMapArea = {
          id: `temp-${Date.now()}`,
          lat: response.lat,
          lng: response.lng,
          radius_km: response.radius_km,
          week: Math.ceil((Date.now() - new Date('2025-01-01').getTime()) / (7 * 24 * 60 * 60 * 1000)),
          created_at: new Date().toISOString(),
          user_id: userId || '00000000-0000-4000-a000-000000000000'
        };

        // Update local state
        setAreas(prev => [newArea, ...prev]);
        setDailyBuzzMapCounter(response.generation_number || 1);

        console.log('✅ BUZZ MAP area generated successfully:', newArea);
        toast.success(`✅ Area BUZZ MAP generata: ${response.radius_km.toFixed(1)}km`);

        return newArea;
      }

      return null;

    } catch (error) {
      console.error('❌ Exception generating BUZZ MAP area:', error);
      toast.error('Errore imprevisto nella generazione');
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [userId]);

  // Get active area
  const getActiveArea = useCallback(() => {
    return areas.length > 0 ? areas[0] : null;
  }, [areas]);

  // Current week areas calculation
  const currentWeekAreas = useCallback(() => {
    const currentWeek = Math.ceil((Date.now() - new Date('2025-01-01').getTime()) / (7 * 24 * 60 * 60 * 1000));
    return areas.filter(area => area.week === currentWeek);
  }, [areas]);

  // FIXED: Reload areas with immediate refresh
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
        console.log('✅ Areas reloaded:', mappedAreas.length);
      }
    } catch (error) {
      console.error('❌ Error reloading areas:', error);
    }
  }, [userId]);

  return {
    isGenerating,
    areas,
    dailyBuzzMapCounter,
    precisionMode,
    generateBuzzMapArea,
    getActiveArea,
    currentWeekAreas: currentWeekAreas(),
    reloadAreas,
    loadAreas: reloadAreas
  };
};
