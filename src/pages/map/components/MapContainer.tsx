import React, { useState, useRef } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { DEFAULT_LOCATION } from '../useMapLogic';
import MapController from './MapController';
import MapPopupManager from './MapPopupManager';
import SearchAreaMapLayer from '../SearchAreaMapLayer';
import MapEventHandler from './MapEventHandler';
import BuzzButton from './BuzzButton';
import LocationButton from './LocationButton';
import MapInstructionsOverlay from './MapInstructionsOverlay';
import SearchAreaButton from './SearchAreaButton';
import HelpDialog from '../HelpDialog';
import BuzzMapAreas from './BuzzMapAreas';
import MapInitializer from './MapInitializer';
import { useBuzzMapLogic } from '@/hooks/useBuzzMapLogic';
import L from 'leaflet';

interface MapContainerProps {
  isAddingPoint: boolean;
  setIsAddingPoint: (value: boolean) => void;
  addNewPoint: (lat: number, lng: number) => void;
  mapPoints: any[];
  activeMapPoint: string | null;
  setActiveMapPoint: (id: string | null) => void;
  handleUpdatePoint: (id: string, title: string, note: string) => Promise<boolean>;
  deleteMapPoint: (id: string) => Promise<boolean>;
  newPoint: any | null;
  handleSaveNewPoint: (title: string, note: string) => void;
  handleCancelNewPoint: () => void;
  handleBuzz: () => void;
  isAddingSearchArea?: boolean;
  handleMapClickArea?: (e: any) => void;
  searchAreas?: any[];
  setActiveSearchArea?: (id: string | null) => void;
  deleteSearchArea?: (id: string) => Promise<boolean>;
  setPendingRadius?: (value: number) => void;
  requestLocationPermission?: () => void;
  toggleAddingSearchArea?: () => void;
  showHelpDialog?: boolean;
  setShowHelpDialog?: (show: boolean) => void;
}

const MapContainerComponent: React.FC<MapContainerProps> = ({
  isAddingPoint,
  setIsAddingPoint,
  addNewPoint,
  mapPoints,
  activeMapPoint,
  setActiveMapPoint,
  handleUpdatePoint,
  deleteMapPoint,
  newPoint,
  handleSaveNewPoint,
  handleCancelNewPoint,
  handleBuzz,
  isAddingSearchArea = false,
  handleMapClickArea = () => {},
  searchAreas = [],
  setActiveSearchArea = () => {},
  deleteSearchArea = async () => false,
  setPendingRadius = () => {},
  requestLocationPermission = () => {},
  toggleAddingSearchArea = () => {},
  showHelpDialog = false,
  setShowHelpDialog = () => {}
}) => {
  const [mapCenter, setMapCenter] = useState<[number, number]>(DEFAULT_LOCATION);
  const mapRef = useRef<L.Map | null>(null);
  const { currentWeekAreas } = useBuzzMapLogic();

  // Debug logging for point addition state
  React.useEffect(() => {
    console.log("🔄 MapContainer - isAddingPoint state:", isAddingPoint);
  }, [isAddingPoint]);

  // Funzione per aggiornare il centro quando la mappa si muove
  const handleMapMove = () => {
    if (mapRef.current) {
      const center = mapRef.current.getCenter();
      setMapCenter([center.lat, center.lng]);
    }
  };

  // Callback for when map is ready
  const handleMapReady = (map: L.Map) => {
    mapRef.current = map;
    map.on('moveend', handleMapMove);
    console.log("🗺️ Map initialized and ready for point addition");
  };

  // Enhanced addNewPoint handler with proper logging
  const handleAddNewPoint = (lat: number, lng: number) => {
    console.log("⭐ handleAddNewPoint called with coordinates:", { lat, lng });
    console.log("🔄 Current isAddingPoint state:", isAddingPoint);
    
    if (isAddingPoint) {
      console.log("✅ Creating new point at coordinates:", lat, lng);
      addNewPoint(lat, lng);
      setIsAddingPoint(false);
      console.log("🔄 isAddingPoint set to false after point creation");
    } else {
      console.log("❌ Not in adding point mode, ignoring click");
    }
  };

  // Funzione per centrare la mappa su una nuova area generata
  const handleAreaGenerated = (lat: number, lng: number, radiusKm: number) => {
    if (mapRef.current) {
      console.log('🎯 Centrando mappa su nuova area:', { lat, lng, radiusKm });
      
      // Centra la mappa sulle nuove coordinate
      mapRef.current.setView([lat, lng], 13);
      
      // Calcola lo zoom appropriato per visualizzare l'area completa
      const radiusMeters = radiusKm * 1000;
      const bounds = L.latLng(lat, lng).toBounds(radiusMeters * 2); // Diametro completo
      
      // Adatta lo zoom per mostrare l'area con un po' di margine
      setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.fitBounds(bounds, { padding: [50, 50] });
        }
      }, 100);
    }
  };

  return (
    <div 
      className="rounded-[24px] overflow-hidden relative w-full" 
      style={{ 
        height: '70vh', 
        minHeight: '500px',
        width: '100%',
        display: 'block',
        position: 'relative'
      }}
    >
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
        zoomControl={true}
        scrollWheelZoom={true}
        doubleClickZoom={true}
        dragging={true}
        zoomAnimation={true}
        fadeAnimation={true}
        markerZoomAnimation={true}
        inertia={true}
      >
        <MapInitializer onMapReady={handleMapReady} />
        
        <MapController 
          isAddingPoint={isAddingPoint}
          setIsAddingPoint={setIsAddingPoint}
          addNewPoint={handleAddNewPoint}
        />
        
        {/* Balanced tone TileLayer - not too dark, not too light */}
        <TileLayer
          attribution='&copy; CartoDB'
          url='https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        />

        {/* Add labels layer separately for better visibility and control */}
        <TileLayer
          attribution='&copy; CartoDB'
          url='https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png'
        />
        
        {/* Visualizza le aree BUZZ MAPPA */}
        <BuzzMapAreas areas={currentWeekAreas} />
        
        {/* Display search areas */}
        <SearchAreaMapLayer 
          searchAreas={searchAreas} 
          setActiveSearchArea={setActiveSearchArea}
          deleteSearchArea={deleteSearchArea}
        />
        
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
        
        {/* Use the MapEventHandler component with enhanced point click handling */}
        <MapEventHandler 
          isAddingSearchArea={isAddingSearchArea} 
          handleMapClickArea={handleMapClickArea}
          searchAreas={searchAreas}
          setPendingRadius={setPendingRadius}
          isAddingMapPoint={isAddingPoint} 
          onMapPointClick={handleAddNewPoint}
        />
      </MapContainer>

      {/* Use the LocationButton component */}
      <LocationButton requestLocationPermission={requestLocationPermission} />

      {/* Add SearchAreaButton component */}
      <SearchAreaButton 
        toggleAddingSearchArea={toggleAddingSearchArea} 
        isAddingSearchArea={isAddingSearchArea} 
      />

      {/* Use the BuzzButton component with map center and area generation callback */}
      <BuzzButton 
        handleBuzz={handleBuzz} 
        mapCenter={mapCenter}
        onAreaGenerated={handleAreaGenerated}
      />

      {/* Use the MapInstructionsOverlay component */}
      <MapInstructionsOverlay 
        isAddingSearchArea={isAddingSearchArea} 
        isAddingMapPoint={isAddingPoint}
      />
      
      {/* Help Dialog */}
      {setShowHelpDialog && 
        <HelpDialog open={showHelpDialog || false} setOpen={setShowHelpDialog} />
      }
    </div>
  );
};

export default MapContainerComponent;
