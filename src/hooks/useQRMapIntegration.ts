// @ts-nocheck
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
  const [claimedSet, setClaimedSet] = useState<Set<string>>(new Set());

  // Constants
  const QR_DETECTION_RADIUS_METERS = 100;
  const QR_DISPLAY_RADIUS_KM = 10; // Show QR codes within 10km

  useEffect(() => {
    if (user) {
      getUserLocation();
      loadNearbyQRCodes();
      loadUserClaims();
      // Realtime: update markers when this user redeems a QR
      const channel = supabase
        .channel(`qr_redemption_logs_user_${user.id}`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'qr_redemption_logs', filter: `user_id=eq.${user.id}` }, (payload) => {
          try {
            const row: any = payload.new;
            const code: string | undefined = row?.qr_code || row?.code;
            const qrId: string | undefined = row?.qr_id || row?.qr_code_id || row?.qrCodeId;
            setClaimedSet(prev => {
              const next = new Set(prev);
              if (code) next.add(code);
              if (qrId) next.add(qrId);
              return next;
            });
            // Optionally refresh proximity flags
            loadNearbyQRCodes();
          } catch (e) {
            console.warn('Realtime QR claim payload parse error', e);
          }
        })
        .subscribe();
      return () => {
        supabase.removeChannel(channel);
      };
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

      // Get all active QR codes from qr_codes table
      const { data: qrCodes, error: qrError } = await supabase
        .from('qr_codes')
        .select('code, title, reward_type, reward_value, lat, lng, is_active, expires_at')
        .eq('is_active', true)
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
              const isClaimed = claimedSet.has(qr.code) || claimedSet.has(qr.code);
              markers.push({
                id: qr.code,
                code: qr.code,
                lat: qr.lat,
                lng: qr.lng,
                location_name: qr.title ?? 'QR',
                reward_type: qr.reward_type,
                distance,
                isInRange,
                // @ts-ignore
                claimed: isClaimed
              });
          }
        } else {
          // If no location, show all QR codes but mark as not in range
          const isClaimed = claimedSet.has(qr.code) || claimedSet.has(qr.code);
          markers.push({
            id: qr.code,
            code: qr.code,
            lat: qr.lat,
            lng: qr.lng,
            location_name: qr.title ?? 'QR',
            reward_type: qr.reward_type,
            distance: 0,
            isInRange: false,
            // @ts-ignore
            claimed: isClaimed
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
    // This is now handled by popup in QRMarkers component
    console.log('M1QR-TRACE: QR redeem triggered via popup for code:', code);
    return {
      success: true,
      message: 'QR redeem handled by popup'
    };
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

  const getQRMarkerStyle = (marker: QRMapMarker & { claimed?: boolean }) => {
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
    } as const;

    // Greyed out if already claimed by this user
    if (marker.claimed) {
      return {
        ...baseStyle,
        background: 'linear-gradient(135deg, #94a3b8, #64748b)',
        borderColor: '#334155',
        color: 'white',
        opacity: 0.6,
        filter: 'grayscale(0.6)'
      } as const;
    }

    if (marker.isInRange) {
      return {
        ...baseStyle,
        background: 'linear-gradient(135deg, #4ade80, #22c55e)',
        borderColor: '#16a34a',
        color: 'white',
        animation: 'pulse 2s infinite',
        boxShadow: '0 0 20px rgba(34, 197, 94, 0.6)'
      } as const;
    }

    return {
      ...baseStyle,
      background: 'linear-gradient(135deg, #64748b, #475569)',
      borderColor: '#374151',
      color: 'white',
      opacity: 0.7
    } as const;
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

  async function loadUserClaims() {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('qr_redemption_logs')
        .select('qr_code_id')
        .eq('user_id', user.id);
      if (error) throw error;
      const next = new Set<string>();
      (data || []).forEach((row: any) => {
        if (row.qr_code_id) next.add(row.qr_code_id);
      });
      setClaimedSet(next);
    } catch (e) {
      console.warn('Failed to load user QR claims', e);
    }
  }

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