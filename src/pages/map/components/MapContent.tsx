
import React, { useEffect } from 'react';
import { MapContainer } from 'react-leaflet';
import { DEFAULT_LOCATION } from '../useMapLogic';
import MapInitializer from './MapInitializer';
import MapLayers from './MapLayers';
import MapPopupManager from './MapPopupManager';
import MapEventHandler from './MapEventHandler';
import BuzzMapAreas from './BuzzMapAreas';
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
  // Ottieni le aree BUZZ correnti dall'hook
  const { currentWeekAreas, debugCurrentState } = useBuzzMapLogic();
  
  // DEBUG: Log ogni cambio delle aree
  useEffect(() => {
    console.log('🗺️ MapContent - Current BUZZ areas changed:', {
      areas: currentWeekAreas,
      count: currentWeekAreas.length,
      timestamp: new Date().toISOString()
    });
    
    // DEBUG: Stato completo del hook
    debugCurrentState();
    
    if (currentWeekAreas.length > 0) {
      const area = currentWeekAreas[0];
      console.log('🎯 MapContent - Area to display:', {
        id: area.id,
        lat: area.lat,
        lng: area.lng,
        radius_km: area.radius_km,
        created_at: area.created_at,
        radiusInMeters: area.radius_km * 1000
      });
      
      // VERIFICA CRITICA: assicurati che i dati siano validi
      if (!area.lat || !area.lng || !area.radius_km) {
        console.error('❌ MapContent - Invalid area data:', area);
      } else {
        console.log('✅ MapContent - Area data is valid and ready for rendering');
      }
    }
  }, [currentWeekAreas, debugCurrentState]);

  // DEBUG: Verifica che il componente si re-renderizzi quando cambiano le aree
  console.log('🔄 MapContent re-rendering with areas count:', currentWeekAreas.length);

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
        console.log('🗺️ MapContent - Map initialized and ready');
        
        // DEBUG: Verifica che la mappa sia pronta per ricevere layer
        console.log('🔍 Map instance available for BUZZ areas:', !!map);
      }} />
      
      {/* Map Layers */}
      <MapLayers 
        searchAreas={searchAreas}
        setActiveSearchArea={setActiveSearchArea}
        deleteSearchArea={deleteSearchArea}
      />
      
      {/* BUZZ Map Areas - CRITICO: Visualizza sempre, anche se array vuoto per debugging */}
      <BuzzMapAreas areas={currentWeekAreas} />
      
      {/* DEBUG: Log per verificare il rendering */}
      {console.log('✅ MapContent - BuzzMapAreas component rendered with areas:', currentWeekAreas.length)}
      
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
