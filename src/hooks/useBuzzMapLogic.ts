
import { useState, useCallback } from 'react';
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
  user_id?: string; // FIXED: Added missing user_id property
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

  // Load user areas
  const loadAreas = useCallback(async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('user_map_areas')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error loading areas:', error);
        return;
      }

      const mappedAreas = data.map(area => ({
        id: area.id,
        lat: area.lat,
        lng: area.lng,
        radius_km: area.radius_km,
        week: area.week,
        created_at: area.created_at,
        user_id: area.user_id // FIXED: Include user_id in mapped areas
      }));

      setAreas(mappedAreas);
      console.log('✅ Areas loaded:', mappedAreas.length);
    } catch (error) {
      console.error('❌ Exception loading areas:', error);
    }
  }, [userId]);

  // Generate buzz map area
  const generateBuzzMapArea = useCallback(async (lat: number, lng: number): Promise<BuzzMapArea | null> => {
    // CRITICAL: Check user ID with developer support
    if (!userId) {
      const hasDeveloperAccess = localStorage.getItem('developer_access') === 'granted';
      const isDeveloperEmail = localStorage.getItem('developer_user_email') === 'wikus77@hotmail.it';
      
      if (!hasDeveloperAccess && !isDeveloperEmail) {
        console.error('❌ BUZZ MAP: No valid user ID');
        toast.error('Devi essere loggato per utilizzare BUZZ MAPPA');
        return null;
      }
      
      console.log('🔧 Developer mode: Using fallback for BUZZ MAP');
    }

    setIsGenerating(true);
    
    try {
      console.log('🚀 Generating BUZZ MAP area:', { lat, lng, userId });

      // Get current generation count
      const generation = await incrementCounter();
      console.log('📊 Current generation:', generation);

      // Calculate radius based on generation
      const radiusMeters = calculateRadius(generation);
      const radiusKm = radiusMeters / 1000;

      console.log('📏 Calculated radius:', radiusKm, 'km');

      // Get current week
      const currentWeek = Math.ceil((Date.now() - new Date('2025-01-01').getTime()) / (7 * 24 * 60 * 60 * 1000));

      // Create area in database
      const { data, error } = await supabase
        .from('user_map_areas')
        .insert({
          user_id: userId || '00000000-0000-4000-a000-000000000000',
          lat,
          lng,
          radius_km: radiusKm,
          week: currentWeek
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating area:', error);
        toast.error('Errore nella creazione dell\'area BUZZ');
        return null;
      }

      const newArea: BuzzMapArea = {
        id: data.id,
        lat: data.lat,
        lng: data.lng,
        radius_km: data.radius_km,
        week: data.week,
        created_at: data.created_at,
        user_id: data.user_id // FIXED: Include user_id in new area
      };

      // Update local state
      setAreas(prev => [newArea, ...prev]);
      setDailyBuzzMapCounter(generation);

      // Send notification
      if (userId) {
        await sendAreaGeneratedNotification(userId, radiusKm, generation);
      }

      console.log('✅ BUZZ MAP area generated successfully:', newArea);
      toast.success(`✅ Area BUZZ MAP generata: ${radiusKm.toFixed(1)}km`);

      return newArea;

    } catch (error) {
      console.error('❌ Exception generating BUZZ MAP area:', error);
      toast.error('Errore imprevisto nella generazione');
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [userId, incrementCounter, calculateRadius, sendAreaGeneratedNotification]);

  // Get active area
  const getActiveArea = useCallback(() => {
    return areas.length > 0 ? areas[0] : null;
  }, [areas]);

  // FIXED: Add missing currentWeekAreas property
  const currentWeekAreas = useCallback(() => {
    const currentWeek = Math.ceil((Date.now() - new Date('2025-01-01').getTime()) / (7 * 24 * 60 * 60 * 1000));
    return areas.filter(area => area.week === currentWeek);
  }, [areas]);

  // Reload areas
  const reloadAreas = useCallback(async () => {
    await loadAreas();
  }, [loadAreas]);

  return {
    isGenerating,
    areas,
    dailyBuzzMapCounter,
    precisionMode,
    generateBuzzMapArea,
    getActiveArea,
    currentWeekAreas: currentWeekAreas(), // FIXED: Include currentWeekAreas
    reloadAreas,
    loadAreas
  };
};
