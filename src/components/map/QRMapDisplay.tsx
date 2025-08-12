// © 2025 All Rights Reserved  – M1SSION™  – NIYVORA KFT Joseph MULÉ

import React, { useEffect, useState } from 'react';
import { Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { supabase } from '@/integrations/supabase/client';
import { QrCode, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
interface QRMapItem {
  id: string;
  code: string;
  lat: number;
  lng: number;
  title?: string | null;
  reward_type: string;
  is_active?: boolean;
  status?: string | null;
}

interface QRMapDisplayProps {
  userLocation?: { lat: number; lng: number } | null;
}

export const QRMapDisplay: React.FC<QRMapDisplayProps> = ({ userLocation }) => {
  const [qrCodes, setQrCodes] = useState<QRMapItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadQRCodes();
  }, []);

  const loadQRCodes = async () => {
    try {
      const { data, error } = await supabase
        .from('qr_codes')
        .select('id, code, lat, lng, title, reward_type, created_at, is_active')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQrCodes(data || []);
    } catch (error) {
      console.error('Error loading QR codes for map:', error);
    } finally {
      setIsLoading(false);
    }
  };

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

  const isUserInRange = (qr: QRMapItem): boolean => {
    if (!userLocation) return false;
    const distance = calculateDistance(
      userLocation.lat,
      userLocation.lng,
      qr.lat,
      qr.lng
    );
    const DETECTION_RADIUS = 100; // meters
    return distance <= DETECTION_RADIUS;
  };

  const isUserAlreadyRedeemed = (qr: QRMapItem): boolean => {
    return false;
  };

  const handleQRRedeem = (qrCode: string) => {
    const currentDomain = window.location.origin;
    const qrUrl = `${currentDomain}/qr?code=${encodeURIComponent(qrCode)}`;
    window.open(qrUrl, '_blank');
  };

  const getRewardIcon = (type: string) => {
    switch (type) {
      case 'buzz_credit': return '⚡';
      case 'buzz_map_credit': return '🗺️';
      case 'custom': return '🎁';
      default: return '❓';
    }
  };

  const getRewardColor = (type: string) => {
    switch (type) {
      case 'buzz_credit': return '#10b981'; // green
      case 'buzz_map_credit': return '#06b6d4'; // cyan
      case 'custom': return '#f59e0b'; // orange
      default: return '#6b7280'; // gray
    }
  };

  if (isLoading) return null;

  const validQRCodes = (qrCodes || []).filter((qr: any) => {
    const ok = Number.isFinite(qr?.lat) && Number.isFinite(qr?.lng);
    if (!ok && import.meta.env.DEV) {
      console.groupCollapsed('[MAP] invalid lat/lng filtered in QRMapDisplay');
      console.log('qrId:', qr?.id, 'lat:', qr?.lat, 'lng:', qr?.lng);
      console.groupEnd();
    }
    return ok;
  });

  return (
    <>
      {validQRCodes.map((qr) => {
        const isInRange = isUserInRange(qr);
        const isRedeemed = isUserAlreadyRedeemed(qr);
        
        return (
          <Marker
            key={qr.id}
            position={[qr.lat, qr.lng]}
            icon={redPulseIcon}
          >
            <Popup>
              <div className="text-center space-y-3 min-w-[200px]">
                <div className="flex items-center gap-2 justify-center">
                  <QrCode className="w-5 h-5 text-primary" />
                  <h3 className="font-bold text-lg">M1SSION™ QR</h3>
                </div>
                
                <div>
                  <p className="font-semibold text-base">{qr.title || 'QR scoperto'}</p>
                  <Badge 
                    className="mt-1"
                    style={{ 
                      backgroundColor: isRedeemed ? '#6b7280' : getRewardColor(qr.reward_type),
                      color: 'white'
                    }}
                  >
                    {getRewardIcon(qr.reward_type)} {qr.reward_type.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>

                {userLocation && (
                  <div className="text-xs text-gray-600">
                    <div className="flex items-center gap-1 justify-center">
                      <MapPin className="w-3 h-3" />
                      <span>
                        Distanza: {Math.round(calculateDistance(
                          userLocation.lat,
                          userLocation.lng,
                          qr.lat,
                          qr.lng
                        ))}m
                      </span>
                    </div>
                  </div>
                )}

                {isRedeemed ? (
                  <Badge variant="secondary" className="w-full">
                    ✅ Già Riscattato
                  </Badge>
                ) : isInRange ? (
                  <Button 
                    onClick={() => handleQRRedeem(qr.code)}
                    className="w-full bg-green-600 hover:bg-green-700"
                    size="sm"
                  >
                    🎯 Riscatta Reward
                  </Button>
                ) : (
                  <Badge variant="outline" className="w-full">
                    📍 Avvicinati per riscattare
                  </Badge>
                )}

                <div className="text-xs text-gray-500 border-t pt-2">
                  <span className="font-mono">{qr.id.slice(0, 8)}...</span>
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
};