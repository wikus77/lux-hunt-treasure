// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
// GeoAlert system for notifying users when near markers
import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';

interface NearbyMarker {
  id: string;
  title: string;
  lat: number;
  lng: number;
  distance: number;
}

interface GeoAlertState {
  isMonitoring: boolean;
  nearbyMarkers: NearbyMarker[];
  lastCheck: Date | null;
  error: string | null;
}

// Haversine formula for distance calculation
const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371000; // Earth radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

export const useGeoMarkerAlert = () => {
  const { user } = useAuth();
  const [state, setState] = useState<GeoAlertState>({
    isMonitoring: false,
    nearbyMarkers: [],
    lastCheck: null,
    error: null
  });
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const notifiedMarkers = useRef<Set<string>>(new Set());

  const checkNearbyMarkers = useCallback(async () => {
    if (!user) return;

    try {
      console.log('🎯 M1QR-TRACE: GEOALERT CHECK TRIGGERED');
      
      // Get current position
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 30000
        });
      });

      const { latitude: userLat, longitude: userLng } = position.coords;
      
      // Get all active markers
      const { data: markers, error } = await supabase
        .from('markers')
        .select('id, title, lat, lng')
        .eq('active', true);

      if (error) throw error;

      // Also get QR codes as markers
      const { data: qrCodes, error: qrError } = await supabase
        .from('qr_codes')
        .select('id, title, lat, lng, code')
        .eq('is_active', true);

      if (qrError) throw qrError;

      // Combine all markers
      const allMarkers = [
        ...(markers || []),
        ...(qrCodes || []).map(qr => ({
          id: qr.id,
          title: qr.title || `QR ${qr.code}`,
          lat: qr.lat,
          lng: qr.lng
        }))
      ];

      // Calculate distances and find nearby markers
      const nearby: NearbyMarker[] = [];
      
      for (const marker of allMarkers) {
        if (!marker.lat || !marker.lng) continue;
        
        const distance = calculateDistance(userLat, userLng, marker.lat, marker.lng);
        
        if (distance <= 500) { // Within 500 meters
          nearby.push({
            id: marker.id,
            title: marker.title,
            lat: marker.lat,
            lng: marker.lng,
            distance: Math.round(distance)
          });
        }
      }

      // Send notifications for new nearby markers
      for (const marker of nearby) {
        if (!notifiedMarkers.current.has(marker.id)) {
          notifiedMarkers.current.add(marker.id);
          
          // Log the alert
          await supabase.functions.invoke('log-user-geo-alert', {
            body: {
              user_id: user.id,
              marker_id: marker.id,
              distance: marker.distance
            }
          });

          // Send push notification via OneSignal
          try {
            await supabase.functions.invoke('send-push-notification-onesignal', {
              body: {
                user_id: user.id,
                title: "🚨 Marker nelle vicinanze!",
                message: `Sei a soli ${marker.distance} metri da un marker attivo su M1SSION™. Controlla subito la mappa!`,
                data: {
                  type: 'geo_alert',
                  marker_id: marker.id,
                  distance: marker.distance
                }
              }
            });
            
            // Also show local toast
            toast.success(`🚨 Marker a ${marker.distance}m`, {
              description: `${marker.title} - Controlla la mappa!`
            });
            
          } catch (notifError) {
            console.error('❌ Failed to send geo alert notification:', notifError);
          }
        }
      }

      setState(prev => ({
        ...prev,
        nearbyMarkers: nearby,
        lastCheck: new Date(),
        error: null
      }));

    } catch (error) {
      console.error('❌ GeoAlert check failed:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Unknown error',
        lastCheck: new Date()
      }));
    }
  }, [user]);

  const startMonitoring = useCallback(() => {
    if (!user || state.isMonitoring) return;

    console.log('🎯 Starting GeoAlert monitoring');
    setState(prev => ({ ...prev, isMonitoring: true }));
    
    // Initial check
    checkNearbyMarkers();
    
    // Set up interval (every 60 seconds)
    intervalRef.current = setInterval(checkNearbyMarkers, 60000);
  }, [user, state.isMonitoring, checkNearbyMarkers]);

  const stopMonitoring = useCallback(() => {
    console.log('🎯 Stopping GeoAlert monitoring');
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    setState(prev => ({ ...prev, isMonitoring: false }));
    notifiedMarkers.current.clear();
  }, []);

  // Auto start monitoring when user is available
  useEffect(() => {
    if (user && !state.isMonitoring) {
      // Small delay to ensure everything is initialized
      const timer = setTimeout(startMonitoring, 2000);
      return () => clearTimeout(timer);
    }
  }, [user, state.isMonitoring, startMonitoring]);

  // Cleanup on unmount
  useEffect(() => {
    return stopMonitoring;
  }, [stopMonitoring]);

  return {
    ...state,
    startMonitoring,
    stopMonitoring,
    checkNow: checkNearbyMarkers
  };
};