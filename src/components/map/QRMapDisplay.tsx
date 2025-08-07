// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import React, { useEffect, useState } from 'react';
import { Marker, Popup } from 'react-leaflet';
import { supabase } from '@/integrations/supabase/client';
import { QrCode, MapPin, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import L from 'leaflet';

interface QRMapItem {
  id: string;
  lat: number;
  lon: number;
  location_name: string;
  reward_type: string;
  message: string;
  attivo: boolean;
  scansioni: number;
  max_distance_meters: number;
  redeemed_by: string[];
}

interface QRMapDisplayProps {
  userLocation?: { lat: number; lng: number } | null;
}

export const QRMapDisplay: React.FC<QRMapDisplayProps> = ({ userLocation }) => {
  const { user } = useUnifiedAuth();
  const [qrCodes, setQrCodes] = useState<QRMapItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadQRCodes();
  }, []);

  const loadQRCodes = async () => {
    try {
      const { data, error } = await supabase
        .from('qr_rewards')
        .select('*')
        .eq('attivo', true)
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
      qr.lon
    );
    return distance <= qr.max_distance_meters;
  };

  const isUserAlreadyRedeemed = (qr: QRMapItem): boolean => {
    return user ? qr.redeemed_by.includes(user.id) : false;
  };

  const handleQRRedeem = (qrCode: string) => {
    // 🔥 CRITICAL: Use current domain for QR redirect
    const currentDomain = window.location.origin;
    const qrUrl = `${currentDomain}/qr/validate?token=${qrCode}`;
    window.open(qrUrl, '_blank');
  };

  const getRewardIcon = (type: string) => {
    switch (type) {
      case 'buzz_gratis': return '⚡';
      case 'indizio_segreto': return '🔍';
      case 'enigma_misterioso': return '🧩';
      case 'sorpresa_speciale': return '🌀';
      default: return '❓';
    }
  };

  const getRewardColor = (type: string) => {
    switch (type) {
      case 'buzz_gratis': return '#10b981'; // green
      case 'indizio_segreto': return '#3b82f6'; // blue
      case 'enigma_misterioso': return '#8b5cf6'; // purple
      case 'sorpresa_speciale': return '#f59e0b'; // orange
      default: return '#6b7280'; // gray
    }
  };

  // Custom icon for QR markers
  const createQRIcon = (qr: QRMapItem) => {
    const isInRange = isUserInRange(qr);
    const isRedeemed = isUserAlreadyRedeemed(qr);
    const color = getRewardColor(qr.reward_type);
    const icon = getRewardIcon(qr.reward_type);

    return L.divIcon({
      html: `
        <div style="
          background: ${isRedeemed ? '#6b7280' : color};
          color: white;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 3px solid ${isInRange ? '#00ff00' : '#ffffff'};
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          ${isInRange ? 'animation: pulse 2s infinite;' : ''}
        ">
          ${icon}
        </div>
        <style>
          @keyframes pulse {
            0% { box-shadow: 0 0 0 0 rgba(0, 255, 0, 0.7); }
            70% { box-shadow: 0 0 0 10px rgba(0, 255, 0, 0); }
            100% { box-shadow: 0 0 0 0 rgba(0, 255, 0, 0); }
          }
        </style>
      `,
      className: 'custom-qr-marker',
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });
  };

  if (isLoading) return null;

  return (
    <>
      {qrCodes.map((qr) => {
        const isInRange = isUserInRange(qr);
        const isRedeemed = isUserAlreadyRedeemed(qr);
        
        return (
          <Marker
            key={qr.id}
            position={[qr.lat, qr.lon]}
            icon={createQRIcon(qr)}
          >
            <Popup>
              <div className="text-center space-y-3 min-w-[200px]">
                <div className="flex items-center gap-2 justify-center">
                  <QrCode className="w-5 h-5 text-primary" />
                  <h3 className="font-bold text-lg">M1SSION™ QR</h3>
                </div>
                
                <div>
                  <p className="font-semibold text-base">{qr.location_name}</p>
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

                <div className="text-xs text-gray-600 space-y-1">
                  <div className="flex items-center gap-1 justify-center">
                    <MapPin className="w-3 h-3" />
                    <span>Raggio: {qr.max_distance_meters}m</span>
                  </div>
                  <div className="flex items-center gap-1 justify-center">
                    <Gift className="w-3 h-3" />
                    <span>Scansioni: {qr.scansioni}</span>
                  </div>
                  {userLocation && (
                    <div>
                      Distanza: {Math.round(calculateDistance(
                        userLocation.lat,
                        userLocation.lng,
                        qr.lat,
                        qr.lon
                      ))}m
                    </div>
                  )}
                </div>

                {isRedeemed ? (
                  <Badge variant="secondary" className="w-full">
                    ✅ Già Riscattato
                  </Badge>
                ) : isInRange ? (
                  <Button 
                    onClick={() => handleQRRedeem(qr.id)}
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