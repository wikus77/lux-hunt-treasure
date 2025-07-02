
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
  
  console.log('🗺️ MapContent rendering for week:', selectedWeek);
  
  return (
    <>
      {/* CRITICAL: Enhanced dark theme tile layer with robust error handling */}
      <TileLayer
        key="dark-tiles-primary"
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        subdomains="abcd"
        maxZoom={19}
        minZoom={3}
        updateWhenIdle={false}
        keepBuffer={8}
        updateWhenZooming={true}
        noWrap={false}
        crossOrigin={true}
        opacity={1}
        className="leaflet-tile-layer-fixed"
        eventHandlers={{
          loading: () => console.log('🗺️ Tiles loading started'),
          load: () => console.log('🗺️ Tiles loading completed'),
          tileerror: (e) => {
            console.log('🗺️ Tile error:', e);
            // Enhanced retry with exponential backoff
            setTimeout(() => {
              const target = e.target as any;
              if (target && target.src) {
                const originalSrc = target.src;
                target.src = '';
                setTimeout(() => {
                  target.src = originalSrc;
                }, 100);
              }
            }, 1000);
          },
          tileloadstart: () => console.log('🗺️ Tile load started'),
          tileload: () => console.log('🗺️ Tile loaded successfully')
        }}
        errorTileUrl="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgZmlsbD0iIzFhMWExYSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNjY2IiBmb250LXNpemU9IjE0Ij5NYXBwYTwvdGV4dD48L3N2Zz4="
      />
      
      {/* Overlay layers in correct z-index order */}
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
