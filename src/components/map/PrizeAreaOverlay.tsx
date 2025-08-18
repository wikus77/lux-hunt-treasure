// © 2025 All Rights Reserved  – M1SSION™  – NIYVORA KFT Joseph MULÉ
import React, { useState, useEffect } from 'react';
import { Circle } from 'react-leaflet';
import { supabase } from '@/integrations/supabase/client';
import { useLocation } from 'wouter';

interface Prize {
  id: string;
  lat: number;
  lng: number;
  area_radius_m: number;
  title: string;
  description: string;
  is_active: boolean;
}

const PrizeAreaOverlay: React.FC = () => {
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [loading, setLoading] = useState(true);
  const [location] = useLocation();

  useEffect(() => {
    const fetchPrizes = async () => {
      try {
        console.log('🏆 PrizeAreaOverlay: Fetching prizes with location verification');
        
        const { data, error } = await supabase
          .from('prizes')
          .select('*')
          .eq('is_active', true)
          .not('lat', 'is', null)
          .not('lng', 'is', null);

        if (error) {
          console.error('❌ PrizeAreaOverlay: Error fetching prizes:', error);
          setPrizes([]);
          return;
        }

        // 🚨 CRITICAL: Filter out prizes without proper location coordinates
        const validPrizes = (data || []).filter((prize: any) => {
          const hasValidCoords = Number.isFinite(prize?.lat) && Number.isFinite(prize?.lng);
          if (!hasValidCoords && import.meta.env.DEV) {
            console.groupCollapsed('[MAP] invalid lat/lng filtered in PrizeAreaOverlay');
            console.log('prizeId:', prize?.id, 'lat:', prize?.lat, 'lng:', prize?.lng);
            console.groupEnd();
          }
          return hasValidCoords;
        });

        console.log('✅ PrizeAreaOverlay: Valid prizes found:', {
          total: data?.length || 0,
          valid: validPrizes.length,
          validPrizeIds: validPrizes.map(p => p.id)
        });

        setPrizes(validPrizes);
      } catch (err) {
        console.error('Exception fetching prizes:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPrizes();
  }, []);

  if (loading || prizes.length === 0) {
    return null;
  }

  return (
    <>
      {prizes.map((prize) => (
        <Circle
          key={prize.id}
          center={[prize.lat, prize.lng]}
          radius={prize.area_radius_m || 500}
          pathOptions={{
            color: '#FFD700',
            fillColor: '#FFD700',
            fillOpacity: 0.1,
            weight: 2,
            opacity: 0.6,
            className: 'prize-area-glow'
          }}
          eventHandlers={{
            mouseover: (e) => {
              e.target.setStyle({ fillOpacity: 0.2, weight: 3 });
            },
            mouseout: (e) => {
              e.target.setStyle({ fillOpacity: 0.1, weight: 2 });
            }
          }}
        >
          {/* Popup removed on /map to avoid interference with M1SSION modal */}
        </Circle>
      ))}
    </>
  );
};

export default PrizeAreaOverlay;
