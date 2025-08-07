// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/auth';

interface QRMapMarker {
  id: string;
  code: string;
  lat: number;
  lng: number;
  location_name: string;
  reward_type: string;
  distance?: number;
  isInRange: boolean;
}

interface UserLocation {
  lat: number;
  lng: number;
}

export const useQRMapIntegration = () => {
  const { user } = useAuthContext();
  const [qrMarkers, setQrMarkers] = useState<QRMapMarker[]>([]);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Constants
  const QR_DETECTION_RADIUS_METERS = 100;
  const QR_DISPLAY_RADIUS_KM = 10; // Show QR codes within 10km

  useEffect(() => {
    if (user) {
      getUserLocation();
      loadNearbyQRCodes();
    }
  }, [user]);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(location);
          loadNearbyQRCodes(location);
        },
        (error) => {
          console.warn('Geolocation error:', error);
          setError('Impossibile ottenere la posizione');
          // Load all QR codes without location filtering
          loadNearbyQRCodes();
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        }
      );
    } else {
      setError('Geolocalizzazione non supportata');
      loadNearbyQRCodes();
    }
  };

  const loadNearbyQRCodes = async (location?: UserLocation) => {
    try {
      setIsLoading(true);
      setError(null);

      // Get all unused QR codes
      const { data: qrCodes, error: qrError } = await supabase
        .from('qr_buzz_codes')
        .select('id, code, lat, lng, location_name, reward_type, expires_at')
        .eq('is_used', false)
        .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`);

      if (qrError) throw qrError;

      if (!qrCodes) {
        setQrMarkers([]);
        return;
      }

      const markers: QRMapMarker[] = [];
      const currentLocation = location || userLocation;

      for (const qr of qrCodes) {
        let distance = 0;
        let isInRange = false;

        if (currentLocation) {
          // Calculate distance using Haversine formula
          distance = calculateDistance(
            currentLocation.lat,
            currentLocation.lng,
            qr.lat,
            qr.lng
          );

          // Only show QR codes within display radius
          if (distance <= QR_DISPLAY_RADIUS_KM * 1000) {
            isInRange = distance <= QR_DETECTION_RADIUS_METERS;
            
            markers.push({
              id: qr.id,
              code: qr.code,
              lat: qr.lat,
              lng: qr.lng,
              location_name: qr.location_name,
              reward_type: qr.reward_type,
              distance,
              isInRange
            });
          }
        } else {
          // If no location, show all QR codes but mark as not in range
          markers.push({
            id: qr.id,
            code: qr.code,
            lat: qr.lat,
            lng: qr.lng,
            location_name: qr.location_name,
            reward_type: qr.reward_type,
            distance: 0,
            isInRange: false
          });
        }
      }

      // Sort by distance (closest first)
      markers.sort((a, b) => (a.distance || 0) - (b.distance || 0));

      setQrMarkers(markers);

    } catch (error) {
      console.error('Error loading QR codes:', error);
      setError('Errore nel caricamento dei QR codes');
    } finally {
      setIsLoading(false);
    }
  };

  const redeemQRCode = async (code: string) => {
    if (!user) {
      throw new Error('Devi essere loggato per riscattare QR codes');
    }

    try {
      const { data, error } = await supabase.functions.invoke('qr-redeem', {
        body: {
          code: code.toUpperCase(),
          userLat: userLocation?.lat,
          userLng: userLocation?.lng
        }
      });

      if (error) throw error;

      // Reload QR codes after redemption
      await loadNearbyQRCodes();

      return data;

    } catch (error) {
      console.error('QR redemption error:', error);
      throw error;
    }
  };

  const refreshLocation = () => {
    getUserLocation();
  };

  // Helper function to calculate distance between two points
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371000; // Earth's radius in meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in meters
  };

  const getQRMarkerStyle = (marker: QRMapMarker) => {
    const baseStyle = {
      width: '32px',
      height: '32px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '16px',
      fontWeight: 'bold',
      cursor: 'pointer',
      border: '2px solid',
      transition: 'all 0.3s ease'
    };

    if (marker.isInRange) {
      return {
        ...baseStyle,
        background: 'linear-gradient(135deg, #4ade80, #22c55e)',
        borderColor: '#16a34a',
        color: 'white',
        animation: 'pulse 2s infinite',
        boxShadow: '0 0 20px rgba(34, 197, 94, 0.6)'
      };
    } else {
      return {
        ...baseStyle,
        background: 'linear-gradient(135deg, #64748b, #475569)',
        borderColor: '#374151',
        color: 'white',
        opacity: 0.7
      };
    }
  };

  const getQRMarkerIcon = (rewardType: string) => {
    switch (rewardType) {
      case 'buzz': return '⚡';
      case 'clue': return '🔍';
      case 'enigma': return '🧩';
      case 'fake': return '🌀';
      default: return '❓';
    }
  };

  return {
    qrMarkers,
    userLocation,
    isLoading,
    error,
    redeemQRCode,
    refreshLocation,
    getQRMarkerStyle,
    getQRMarkerIcon,
    QR_DETECTION_RADIUS_METERS,
    QR_DISPLAY_RADIUS_KM
  };
};