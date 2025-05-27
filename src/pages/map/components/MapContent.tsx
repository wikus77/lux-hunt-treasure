
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
  // Get current BUZZ areas from hook - CRITICAL for updates
  const { currentWeekAreas, debugCurrentState, reloadAreas } = useBuzzMapLogic();
  
  // CRITICAL FIX: Force reload areas every time component mounts or changes
  useEffect(() => {
    console.log('🚨 CRITICAL RADIUS - MapContent mounted, forcing areas reload');
    reloadAreas(); // Force reload areas from DB
  }, [reloadAreas]);
  
  // ENHANCED DEBUG: Detailed log every area change with radius verification
  useEffect(() => {
    console.log('🗺️ CRITICAL RADIUS - DIRECT LEAFLET MapContent area state changed:', {
      areas: currentWeekAreas,
      count: currentWeekAreas.length,
      timestamp: new Date().toISOString()
    });
    
    // DEBUG: Complete hook state
    debugCurrentState();
    
    if (currentWeekAreas.length > 0) {
      const area = currentWeekAreas[0];
      
      console.log('🎯 CRITICAL RADIUS - DIRECT LEAFLET Latest area to display with FIXED COLOR:', {
        id: area.id,
        lat: area.lat,
        lng: area.lng,
        radius_km: area.radius_km,
        created_at: area.created_at,
        radiusInMeters: area.radius_km * 1000,
        fixedColor: '#00FFFF'
      });
      
      // CRITICAL VERIFICATION: ensure data is valid and updated
      if (!area.lat || !area.lng || !area.radius_km) {
        console.error('❌ CRITICAL RADIUS - Invalid area data:', area);
      } else {
        console.log('✅ CRITICAL RADIUS - DIRECT LEAFLET Area data is valid and ready for FORCED rendering with FIXED COLOR');
        console.log('📏 RENDERING RADIUS with DIRECT LEAFLET:', {
          radius_km: area.radius_km,
          radius_meters: area.radius_km * 1000,
          should_be_updated: true,
          fixedColor: '#00FFFF'
        });
      }
    } else {
      console.log('❌ CRITICAL RADIUS - No areas available for rendering');
    }
  }, [currentWeekAreas, debugCurrentState]);

  // DEBUG: Search areas logging
  useEffect(() => {
    console.log('🔍 SEARCH AREAS in MapContent:', {
      count: searchAreas.length,
      areas: searchAreas,
      timestamp: new Date().toISOString()
    });
  }, [searchAreas]);

  // DEBUG: Verify component re-renders when areas change
  console.log('🔄 CRITICAL RADIUS - DIRECT LEAFLET MapContent re-rendering with areas count:', currentWeekAreas.length);
  console.log('🔍 Search areas count:', searchAreas.length);
  
  // Log current radius for update verification
  if (currentWeekAreas.length > 0) {
    console.log('📏 CRITICAL RADIUS - DIRECT LEAFLET Current area radius for rendering:', currentWeekAreas[0].radius_km, 'km with FIXED NEON COLOR');
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
      whenReady={() => {}} // Empty function to satisfy the type requirement
    >
      {/* Add the MapInitializer component to handle map initialization */}
      <MapInitializer onMapReady={(map) => {
        mapRef.current = map;
        handleMapLoad(map);
        console.log('🗺️ CRITICAL RADIUS - DIRECT LEAFLET Map initialized and ready for BUZZ areas with UPDATED RADIUS and FIXED COLOR');
        
        // DEBUG: Verify map is ready to receive layers
        console.log('🔍 Map instance available for BUZZ areas:', !!map);
      }} />
      
      {/* Map Layers */}
      <MapLayers 
        searchAreas={searchAreas}
        setActiveSearchArea={setActiveSearchArea}
        deleteSearchArea={deleteSearchArea}
      />
      
      {/* SEARCH AREAS Layer - CRITICAL: Separate layer for search areas */}
      <SearchAreaMapLayer 
        searchAreas={searchAreas}
        setActiveSearchArea={setActiveSearchArea}
        deleteSearchArea={deleteSearchArea}
      />
      
      {/* BUZZ Map Areas - CRITICAL: DIRECT LEAFLET RENDERING with updated array and FIXED COLOR */}
      <BuzzMapAreas areas={currentWeekAreas} />
      
      {/* Use the MapPopupManager component */}
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
      
      {/* Use the MapEventHandler component with properly synced isAddingMapPoint state */}
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
