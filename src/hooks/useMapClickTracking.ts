
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUnifiedAuth } from '@/hooks/use-unified-auth';

interface MapClick {
  lat: number;
  lng: number;
  zoom: number;
  eventType: 'click' | 'buzz' | 'error';
}

export function useMapClickTracking() {
  const { isAuthenticated, getCurrentUser } = useUnifiedAuth();
  
  const trackMapClick = useCallback(async (
    lat: number, 
    lng: number, 
    zoom: number = 10, 
    eventType: 'click' | 'buzz' | 'error' = 'click'
  ) => {
    // Only track clicks if user is authenticated
    if (!isAuthenticated) return null;
    
    const user = getCurrentUser();
    if (!user?.id) return null;
    
    try {
      const { data, error } = await supabase
        .from('map_click_events')
        .insert({
          user_id: user.id,
          lat,
          lng,
          zoom,
          event_type: eventType
        })
        .select()
        .single();
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Failed to track map click:', error);
      return null;
    }
  }, [isAuthenticated, getCurrentUser]);
  
  const trackBuzzAction = useCallback((lat: number, lng: number, zoom: number = 10) => {
    return trackMapClick(lat, lng, zoom, 'buzz');
  }, [trackMapClick]);
  
  const trackMapError = useCallback((lat: number, lng: number, zoom: number = 10) => {
    return trackMapClick(lat, lng, zoom, 'error');
  }, [trackMapClick]);
  
  return {
    trackMapClick,
    trackBuzzAction,
    trackMapError
  };
}
