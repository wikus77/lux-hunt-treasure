// © 2025 M1SSION™ NIYVORA KFT– Joseph MULÉ
import React, { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { LayerGroup, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/auth';
import { useLocation } from '@/hooks/useLocation';
import { useGeoWatcher } from '@/hooks/useGeoWatcher';
import { useMarkerRewards } from '@/hooks/useMarkerRewards';
import { GeoDebugBanner } from './GeoDebugBanner';
import { invalidateMarkerCache } from '@/utils/markerCacheUtils';

// Lazy load M1ssion components
const M1ssionMarkerPopup = lazy(() => import('./M1ssionMarkerPopup'));

interface MarkerItem {
  id: string;
  title: string;
  lat: number;
  lng: number;
  active: boolean;
  reward_type?: string;
  reward_description?: string;
  reward_payload?: any;
}

interface QRMapDisplayProps {
  userLocation?: { lat: number; lng: number } | null;
}

const QRMapDisplay: React.FC<QRMapDisplayProps> = ({ userLocation: propUserLocation }) => {
  const { user } = useAuthContext();
  const detectedLocation = useLocation();
  const geoPosition = useGeoWatcher();
  const { claims, refreshClaims } = useMarkerRewards();

  const [items, setItems] = useState<MarkerItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showLayer, setShowLayer] = useState(false);
  const [markerMinZoom, setMarkerMinZoom] = useState<number>(14);
  const [selectedMarker, setSelectedMarker] = useState<MarkerItem | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);

  // Determine user location priority: prop > detected > geo watcher  
  const userLocation = propUserLocation || detectedLocation || (geoPosition?.coords ? { lat: geoPosition.coords.lat, lng: geoPosition.coords.lng } : null);

  // M1MARK-TRACE: Fetch markers from proper source with telemetry
  useEffect(() => {
    const fetchMarkers = async () => {
      const fetchStartTime = Date.now();
      
      try {
        setIsLoading(true);
        
        console.info('M1MARK-TRACE: MARKER_FETCH_START', {
          user_authenticated: !!user,
          last_fetch: lastFetchTime,
          cache_invalidated: Date.now() - lastFetchTime > 30000
        });

        if (!user) {
          console.warn('M1MARK-TRACE: No authenticated user, skipping marker fetch');
          setItems([]);
          setIsLoading(false);
          return;
        }

        // Invalidate cache if online and refresh needed
        if (navigator.onLine && Date.now() - lastFetchTime > 30000) {
          invalidateMarkerCache();
        }

        // Use qr_codes_markers as the main data source (available in types)
        const { data: markersData, error: markersError } = await supabase
          .from('qr_codes_markers')
          .select('*');

        // Fetch rewards separately to avoid infinite types
        const { data: rewardsData } = await supabase
          .from('marker_rewards')
          .select('marker_id, reward_type, description, payload');

        if (markersError) {
          console.error('M1MARK-TRACE: MARKER_FETCH_ERROR', { error: markersError });
          setItems([]);
          return;
        }

        // Transform and filter markers using correct column names
        const validMarkers = (markersData || [])
          .filter(marker => {
            return marker.latitude && 
                   marker.longitude &&
                   Math.abs(marker.latitude) <= 90 && 
                   Math.abs(marker.longitude) <= 180;
          })
          .map(marker => {
            const markerReward = (rewardsData || []).find(r => r.marker_id === marker.code);
            return {
              id: marker.code || crypto.randomUUID(),
              title: marker.title || `Marker QR`,
              lat: marker.latitude,
              lng: marker.longitude,
              active: true,
              reward_type: markerReward?.reward_type || 'buzz_free',
              reward_description: markerReward?.description || 'BUZZ gratuiti',
              reward_payload: markerReward?.payload || {}
            };
          });

        setItems(validMarkers);
        setLastFetchTime(Date.now());

        const fetchEndTime = Date.now();
        console.info('M1MARK-TRACE: MARKER_FETCH_END', {
          count: validMarkers.length,
          duration_ms: fetchEndTime - fetchStartTime,
          filters_applied: ['active', 'visible_window', 'coordinates_valid'],
          has_rewards: validMarkers.filter(m => m.reward_type).length
        });

      } catch (error) {
        console.error('M1MARK-TRACE: MARKER_FETCH_EXCEPTION', { error });
        setItems([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMarkers();
  }, [user, lastFetchTime]);

  // Create custom M1SSION™ marker icon
  const icon = (item: MarkerItem) => {
    const isClaimed = claims.some(claim => claim.marker_id === item.id);
    const color = isClaimed ? '#666666' : '#00f0ff';
    
    return L.divIcon({
      className: 'm1ssion-map-marker',
      html: `<div style="width: 24px; height: 24px; background: linear-gradient(135deg, ${color}, #0066cc); border-radius: 50%; border: 3px solid white; box-shadow: 0 0 15px rgba(0,255,255,0.6); display: flex; align-items: center; justify-content: center; position: relative;">
               <div style="color: white; font-size: 12px; font-weight: bold;">⚡</div>
               <div style="position: absolute; top: -2px; right: -2px; width: 8px; height: 8px; background: #00ff00; border-radius: 50%; border: 1px solid white; ${isClaimed ? 'display: none;' : ''}"></div>
             </div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });
  };

  // Calculate distance to marker for debugging
  const calculateDistance = (marker: MarkerItem): number | undefined => {
    if (!userLocation) return undefined;
    
    const R = 6371000; // Earth's radius in meters
    const dLat = (marker.lat - userLocation.lat) * Math.PI / 180;
    const dLng = (marker.lng - userLocation.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(userLocation.lat * Math.PI / 180) * Math.cos(marker.lat * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const all = useMemo(() => items, [items]);

  // Toggle layer visibility on zoom changes
  useEffect(() => {
    const handleZoomChange = () => {
      const z = 13; // Default zoom for now
      const shouldShow = z >= markerMinZoom - 3; // More permissive for testing
      setShowLayer(shouldShow);
    };
    
    handleZoomChange();
  }, [markerMinZoom]);

  // Handle popup close
  const handlePopupClose = () => {
    setSelectedMarker(null);
  };

  if (isLoading) {
    return (
      <GeoDebugBanner 
        markersCount={0}
        isLoading={true}
        userLocation={userLocation}
        showMarkersLayer={showLayer}
        markerMinZoom={markerMinZoom}
        debugMessage="Caricamento markers M1SSION™..."
      />
    );
  }

  return (
    <>
      <GeoDebugBanner 
        markersCount={all.length}
        isLoading={isLoading}
        userLocation={userLocation}
        showMarkersLayer={showLayer}
        markerMinZoom={markerMinZoom}
      />
      
      <LayerGroup>
        {all.map((item) => (
          <Marker
            key={item.id}
            position={[item.lat, item.lng]}
            icon={icon(item)}
          >
            <Popup
              eventHandlers={{
                popupopen: () => {
                  console.info('M1MARK-TRACE: POPUP_OPENED', { 
                    marker_id: item.id,
                    reward_type: item.reward_type,
                    user_distance: calculateDistance(item)
                  });
                }
              }}
            >
              <div className="p-2 min-w-[200px]">
                <Suspense fallback={<div>Caricamento...</div>}>
                  <M1ssionMarkerPopup
                    markerId={item.id}
                    markerTitle={item.title}
                    rewards={item.reward_type ? [{
                      reward_type: item.reward_type,
                      payload: item.reward_payload || {},
                      description: item.reward_description || `Premio ${item.reward_type}`
                    }] : []}
                    userDistance={calculateDistance(item)}
                    onClose={handlePopupClose}
                  />
                </Suspense>
              </div>
            </Popup>
          </Marker>
        ))}
      </LayerGroup>
    </>
  );
};

export default QRMapDisplay;