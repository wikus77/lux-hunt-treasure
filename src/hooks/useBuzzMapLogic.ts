// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// M1SSION™ - BUZZ Map Logic Hook - RESET COMPLETO 17/07/2025

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/auth';
import { toast } from 'sonner';
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
  level?: number;
  isActive: boolean;
  user_id: string;
  created_at: string;
}

// Feature flag for legacy game targets (disabled - table does not exist)
const BUZZ_TARGETS_ENABLED = false;

export const useBuzzMapLogic = () => {
  const { user } = useAuthContext();
  const [currentWeekAreas, setCurrentWeekAreas] = useState<BuzzMapArea[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchCurrentWeekAreas = async () => {
    if (!user?.id) {
      console.log('❌ useBuzzMapLogic: No user ID, clearing areas');
      setCurrentWeekAreas([]);
      return;
    }
    
    console.log('🔄 useBuzzMapLogic: Checking authorization for user:', user.id);
    setLoading(true);
    
    try {
      // STUB: buzz_game_targets table does not exist - skip validation
      if (BUZZ_TARGETS_ENABLED) {
        // Legacy game targets feature disabled
        console.log('🎯 BUZZ GAME TARGETS: Feature disabled (table does not exist)');
      }

      console.log('💎 M1SSION™ BUZZ MAP: Checking M1U-based areas (source=buzz_map)');

      const currentWeek = getCurrentWeekOfYear();
      console.log('🗓️ BUZZ MAP: Fetching areas for current week:', currentWeek);
      
      // Query user_map_areas with explicit column selection to avoid type issues
      const { data: userAreas, error: userAreasError } = await supabase
        .from('user_map_areas')
        .select('id, user_id, lat, lng, radius_km, week, level, active, created_at, source')
        .eq('user_id', user.id)
        .eq('source', 'buzz_map')
        .eq('week', currentWeek)
        .order('created_at', { ascending: false })
        .limit(1);

      if (userAreasError) {
        console.error('❌ USER AREAS ERROR:', userAreasError);
        setError(userAreasError);
        setCurrentWeekAreas([]);
        setLoading(false);
        return;
      }

      console.log('🗺️ USER AREAS RESULT:', { 
        count: userAreas?.length || 0, 
        areas: userAreas 
      });

      if (!userAreas || userAreas.length === 0) {
        console.log('📭 No user map areas found for current week');
        setCurrentWeekAreas([]);
        setLoading(false);
        return;
      }

      // Map user areas to BuzzMapArea format
      const mappedAreas: BuzzMapArea[] = userAreas.map((area, index) => ({
        id: area.id,
        lat: area.lat,
        lng: area.lng,
        radius_km: area.radius_km,
        coordinates: { lat: area.lat, lng: area.lng },
        radius: area.radius_km,
        color: getColorForGeneration(index),
        colorName: getColorNameForGeneration(index),
        week: area.week,
        generation: index,
        level: area.level ?? undefined,
        isActive: area.active ?? true,
        user_id: area.user_id,
        created_at: area.created_at
      }));

      console.log('✅ MAPPED AREAS:', mappedAreas);
      setCurrentWeekAreas(mappedAreas);
      setError(null);
      
    } catch (err) {
      console.error('💥 FETCH ERROR:', err);
      setError(err as Error);
      setCurrentWeekAreas([]);
      toast.error('Errore nel caricamento delle aree BUZZ MAP');
    } finally {
      setLoading(false);
    }
  };

  const getColorForGeneration = (generation: number): string => {
    const colors = ['#FF6B6B', '#4ECDC4', '#FFD93D', '#A8E6CF', '#FF8B94'];
    return colors[generation % colors.length];
  };

  const getColorNameForGeneration = (generation: number): string => {
    const colorNames = ['Rosso', 'Turchese', 'Giallo', 'Verde', 'Rosa'];
    return colorNames[generation % colorNames.length];
  };

  useEffect(() => {
    if (user?.id) {
      fetchCurrentWeekAreas();
    }
  }, [user?.id]);

  return {
    currentWeekAreas,
    loading,
    error,
    refetch: fetchCurrentWeekAreas
  };
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
