
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
      // Note: map_click_events table may not exist in current schema
      // This is a fallback implementation that won't cause runtime errors
      console.log('Map click tracked:', { lat, lng, zoom, eventType, userId: user.id });
      return { lat, lng, zoom, event_type: eventType, user_id: user.id };
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
