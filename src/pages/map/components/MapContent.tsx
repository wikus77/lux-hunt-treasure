
import React, { memo } from 'react';
import { TileLayer } from 'react-leaflet';
import BuzzMapAreas from './BuzzMapAreas';
import UserLocationMarker from './UserLocationMarker';
import MapMarkers from './MapMarkers';
import SearchAreaMapLayer from '../SearchAreaMapLayer';
import PrizeLocationCircle from './PrizeLocationCircle';
import { useBuzzMapLogic } from '@/hooks/useBuzzMapLogic';

export interface MapContentProps {
  selectedWeek: number;
}

// CRITICAL FIX: Memoize MapContent to prevent tile layer re-mounting
export const MapContent: React.FC<MapContentProps> = memo(({ selectedWeek }) => {
  const { currentWeekAreas } = useBuzzMapLogic();
  
  console.log('🗺️ VISUAL RENDER: MapContent rendering for week:', selectedWeek);
  
  return (
    <>
      {/* CRITICAL FIX: Single stable TileLayer with unique key */}
      <TileLayer
        key="single-tile-layer"
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        subdomains="abcd"
        maxZoom={19}
        minZoom={3}
        updateWhenIdle={true}
        keepBuffer={2}
        updateWhenZooming={false}
        // CRITICAL: Prevent tile duplication
        noWrap={true}
        bounds={undefined}
        // CRITICAL: Ensure tiles load properly
        crossOrigin={true}
      />
      
      {/* CRITICAL FIX: Stable layer order to prevent visual conflicts */}
      <BuzzMapAreas areas={currentWeekAreas} selectedWeek={selectedWeek} />
      <SearchAreaMapLayer />
      <UserLocationMarker />
      <MapMarkers />
      <PrizeLocationCircle />
    </>
  );
});

MapContent.displayName = 'MapContent';

export default MapContent;
