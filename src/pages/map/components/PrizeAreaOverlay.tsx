// © 2025 All Rights Reserved – M1SSION™ – NIYVORA KFT Joseph MULÉ
import React, { useState, useEffect } from 'react';
import { Popup } from 'react-leaflet';
import { SafeCircle } from '@/components/map/safe/SafeCircle';
import { supabase } from '@/integrations/supabase/client';
import { isValidLatLng, isValidRadius, logGuard } from '@/lib/map/geoGuards';

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
  let warnedOnce = false;

  useEffect(() => {
    const fetchPrizes = async () => {
      try {
        // 🚨 FORCE VALIDATION: Only show prizes with valid coordinates AND location_set
        const { data, error } = await supabase
          .from('prizes')
          .select('*')
          .eq('is_active', true)
          .not('lat', 'is', null)
          .not('lng', 'is', null)
          .gte('created_at', '2025-07-17'); // Force filter recent prizes only

        if (error) {
          console.error('❌ Error fetching prizes:', error);
          return;
        }

        // 🚨 ADDITIONAL VALIDATION: Filter out invalid coordinates
        const validPrizes = (data || []).filter(prize => 
          Number.isFinite(prize?.lat) && Number.isFinite(prize?.lng) &&
          prize.lat !== 0 && prize.lng !== 0 &&
          Math.abs(prize.lat) <= 90 && Math.abs(prize.lng) <= 180
        );

        if (import.meta.env.DEV && !warnedOnce && (data?.length ?? 0) !== validPrizes.length) {
          console.warn('Layer skipped: missing/invalid lat/lng', { comp: 'PrizeAreaOverlay' });
          warnedOnce = true;
        }

        console.log('🗺️ PrizeAreaOverlay: Valid prizes found:', validPrizes.length);
        setPrizes(validPrizes);
      } catch (err) {
        console.error('❌ Exception fetching prizes:', err);
        setPrizes([]); // Force empty on error
      } finally {
        setLoading(false);
      }
    };

    fetchPrizes();
  }, []);

  if (loading) return null;

  // Guard robusta: filtra premi renderizzabili
  const renderable = prizes.filter(p => {
    const radius = p.area_radius_m || 500;
    const isValid = isValidLatLng(p.lat, p.lng) && isValidRadius(radius);
    
    if (!isValid) {
      logGuard('PrizeAreaOverlay: prize skipped', {
        id: p.id,
        lat: p.lat,
        lng: p.lng,
        radius
      });
    }
    
    return isValid;
  });
  
  if (renderable.length === 0) return null;

  return (
    <>
      {renderable.map((prize) => (
        <SafeCircle
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
          <Popup>
            <div className="p-3 text-center">
              <div className="font-bold text-yellow-400 mb-2">🏆 {prize.title}</div>
              <div className="text-sm text-gray-300 mb-2">{prize.description}</div>
              <div className="text-xs text-yellow-300">
                Area Premio - Raggio: {((prize.area_radius_m || 500) / 1000).toFixed(1)} km
              </div>
            </div>
          </Popup>
        </SafeCircle>
      ))}
    </>
  );
};

export default PrizeAreaOverlay;
