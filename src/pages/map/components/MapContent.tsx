import React, { useEffect } from 'react';
import { MapContainer } from 'react-leaflet';
import { DEFAULT_LOCATION } from '../useMapLogic';
import MapInitializer from './MapInitializer';
import MapLayers from './MapLayers';
import MapPopupManager from './MapPopupManager';
import MapEventHandler from './MapEventHandler';
import BuzzMapAreas from './BuzzMapAreas';
import SearchAreaMapLayer from '../SearchAreaMapLayer';
import { useBuzzMapLogic } from '@/hooks/useBuzzMapLogic';

interface MapContentProps {
  mapRef: React.MutableRefObject<L.Map | null>;
  handleMapLoad: (map: L.Map) => void;
  searchAreas: any[];
  setActiveSearchArea: (id: string | null) => void;
  deleteSearchArea: (id: string) => Promise<boolean>;
  mapPoints: any[];
  activeMapPoint: string | null;
  setActiveMapPoint: (id: string | null) => void;
  handleUpdatePoint: (id: string, title: string, note: string) => Promise<boolean>;
  deleteMapPoint: (id: string) => Promise<boolean>;
  newPoint: any;
  handleSaveNewPoint: (title: string, note: string) => void;
  handleCancelNewPoint: () => void;
  isAddingSearchArea: boolean;
  handleMapClickArea: (e: any) => void;
  setPendingRadius: (value: number) => void;
  isAddingMapPoint: boolean;
  hookHandleMapPointClick: (lat: number, lng: number) => void;
}

const MapContent: React.FC<MapContentProps> = ({
  mapRef,
  handleMapLoad,
  searchAreas,
  setActiveSearchArea,
  deleteSearchArea,
  mapPoints,
  activeMapPoint,
  setActiveMapPoint,
  handleUpdatePoint,
  deleteMapPoint,
  newPoint,
  handleSaveNewPoint,
  handleCancelNewPoint,
  isAddingSearchArea,
  handleMapClickArea,
  setPendingRadius,
  isAddingMapPoint,
  hookHandleMapPointClick
}) => {
  // Get current BUZZ areas from unified hook (SINGLE SOURCE OF TRUTH)
  const { currentWeekAreas, reloadAreas } = useBuzzMapLogic();
  
  // Force reload areas when component mounts
  useEffect(() => {
    console.log('🚨 MAP CONTENT: Component mounted, forcing areas reload');
    reloadAreas();
  }, [reloadAreas]);
  
  // Enhanced logging for area changes
  useEffect(() => {
    console.log('🗺️ MAP CONTENT: Area state changed:', {
      areas: currentWeekAreas,
      count: currentWeekAreas.length,
      timestamp: new Date().toISOString()
    });
    
    if (currentWeekAreas.length > 0) {
      const area = currentWeekAreas[0];
      
      console.log('🎯 MAP CONTENT: Latest area to display:', {
        id: area.id,
        lat: area.lat,
        lng: area.lng,
        radius_km: area.radius_km,
        created_at: area.created_at || 'no-timestamp', // Handle optional created_at
        radiusInMeters: area.radius_km * 1000,
        color: '#00FFFF'
      });
      
      // Verification
      if (!area.lat || !area.lng || !area.radius_km) {
        console.error('❌ MAP CONTENT: Invalid area data:', area);
      } else {
        console.log('✅ MAP CONTENT: Area data is valid and ready for rendering');
      }
    } else {
      console.log('❌ MAP CONTENT: No areas available for rendering');
    }
  }, [currentWeekAreas]);

  // Debug search areas
  useEffect(() => {
    console.log('🔍 MAP CONTENT: Search areas:', {
      count: searchAreas.length,
      areas: searchAreas,
      timestamp: new Date().toISOString()
    });
  }, [searchAreas]);

  console.log('🔄 MAP CONTENT: Re-rendering with areas count:', currentWeekAreas.length);
  console.log('🔍 MAP CONTENT: Search areas count:', searchAreas.length);
  
  if (currentWeekAreas.length > 0) {
    console.log('📏 MAP CONTENT: Current area radius for rendering:', currentWeekAreas[0].radius_km, 'km with FIXED NEON COLOR');
  }

  return (
    <MapContainer 
      center={DEFAULT_LOCATION} 
      zoom={15}
      style={{ 
        height: '100%', 
        width: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1
      }}
      className="z-10"
      whenReady={() => {}}
    >
      <MapInitializer onMapReady={(map) => {
        mapRef.current = map;
        handleMapLoad(map);
        console.log('🗺️ MAP CONTENT: Map initialized and ready for BUZZ areas');
        console.log('🔍 MAP CONTENT: Map instance available for BUZZ areas:', !!map);
      }} />
      
      {/* Map Layers */}
      <MapLayers 
        searchAreas={searchAreas}
        setActiveSearchArea={setActiveSearchArea}
        deleteSearchArea={deleteSearchArea}
      />
      
      {/* SEARCH AREAS Layer */}
      <SearchAreaMapLayer 
        searchAreas={searchAreas}
        setActiveSearchArea={setActiveSearchArea}
        deleteSearchArea={deleteSearchArea}
      />
      
      {/* BUZZ Map Areas - UNIFIED RENDERING with updated array */}
      <BuzzMapAreas areas={currentWeekAreas} />
      
      {/* Map Popup Manager */}
      <MapPopupManager 
        mapPoints={mapPoints}
        activeMapPoint={activeMapPoint}
        setActiveMapPoint={setActiveMapPoint}
        handleUpdatePoint={handleUpdatePoint}
        deleteMapPoint={deleteMapPoint}
        newPoint={newPoint}
        handleSaveNewPoint={handleSaveNewPoint}
        handleCancelNewPoint={handleCancelNewPoint}
      />
      
      {/* Map Event Handler */}
      <MapEventHandler 
        isAddingSearchArea={isAddingSearchArea} 
        handleMapClickArea={handleMapClickArea}
        searchAreas={searchAreas}
        setPendingRadius={setPendingRadius}
        isAddingMapPoint={isAddingMapPoint} 
        onMapPointClick={hookHandleMapPointClick}
      />
    </MapContainer>
  );
};

export default MapContent;
