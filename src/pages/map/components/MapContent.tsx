
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
  mapPoints: {
    id: string;
    lat: number;
    lng: number;
    title: string;
    note: string;
    position: { lat: number; lng: number };
  }[];
  activeMapPoint: string | null;
  setActiveMapPoint: React.Dispatch<React.SetStateAction<string | null>>;
  handleUpdatePoint: (id: string, title: string, note: string) => Promise<boolean>;
  deleteMapPoint: (id: string) => Promise<boolean>;
  newPoint: any | null;
  handleSaveNewPoint: (title: string, note: string) => void;
  handleCancelNewPoint: () => void;
}

// CRITICAL FIX: Memoize MapContent to prevent tile layer re-mounting
export const MapContent: React.FC<MapContentProps> = memo(({ 
  selectedWeek,
  mapPoints,
  activeMapPoint,
  setActiveMapPoint,
  handleUpdatePoint,
  deleteMapPoint,
  newPoint,
  handleSaveNewPoint,
  handleCancelNewPoint
}) => {
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
      <MapMarkers 
        mapPoints={mapPoints}
        activeMapPoint={activeMapPoint}
        setActiveMapPoint={setActiveMapPoint}
        handleUpdatePoint={handleUpdatePoint}
        deleteMapPoint={deleteMapPoint}
        newPoint={newPoint}
        handleSaveNewPoint={handleSaveNewPoint}
        handleCancelNewPoint={handleCancelNewPoint}
      />
      <PrizeLocationCircle />
    </>
  );
});

MapContent.displayName = 'MapContent';

export default MapContent;
