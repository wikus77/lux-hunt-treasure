
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
import { useMapStore } from '@/stores/mapStore';
import L from 'leaflet';
import { 
  handleMapMove, 
  handleMapReady, 
  handleAddNewPoint, 
  handleAreaGenerated 
} from '@/components/map/utils/mapContainerUtils';

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
  
  // CRITICAL: Use the hook to get BUZZ areas with real-time updates
  const { currentWeekAreas, loading: areasLoading, reloadAreas } = useBuzzMapLogic();
  
  // Use Zustand store for consistent state management
  const { isAddingMapPoint, mapStatus } = useMapStore();

  // CRITICAL: Debug logging for BUZZ areas
  React.useEffect(() => {
    console.log("🗺️ MapContainer - BUZZ areas updated:", {
      areasCount: currentWeekAreas.length,
      loading: areasLoading,
      areas: currentWeekAreas.map(area => ({
        id: area.id,
        center: [area.lat, area.lng],
        radius: area.radius_km
      }))
    });
  }, [currentWeekAreas, areasLoading]);

  // Debug logging for point addition state
  React.useEffect(() => {
    console.log("🔄 MapContainer - State from Zustand:", { 
      isAddingPoint, 
      isAddingMapPoint, 
      mapStatus 
    });
  }, [isAddingPoint, isAddingMapPoint, mapStatus]);

  // Create utility functions using the extracted helpers
  const handleMapMoveCallback = handleMapMove(mapRef, setMapCenter);
  const handleMapReadyCallback = handleMapReady(mapRef, handleMapMoveCallback);
  const handleAddNewPointCallback = handleAddNewPoint(isAddingPoint, addNewPoint, setIsAddingPoint);
  
  // CRITICAL: Enhanced area generation callback with reload
  const handleAreaGeneratedCallback = (lat: number, lng: number, radiusKm: number) => {
    console.log('🎯 MapContainer - Area generated, updating map and reloading areas:', { lat, lng, radiusKm });
    
    // Update map center and zoom
    if (mapRef.current) {
      mapRef.current.setView([lat, lng], 13);
      
      // Calculate appropriate zoom for radius
      const radiusMeters = radiusKm * 1000;
      const bounds = L.latLng(lat, lng).toBounds(radiusMeters * 2);
      
      setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.fitBounds(bounds, { padding: [50, 50] });
        }
      }, 100);
    }
    
    // CRITICAL: Force reload areas to show new area immediately
    setTimeout(() => {
      console.log('🔄 MapContainer - Forcing areas reload after generation');
      reloadAreas();
    }, 500);
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
        <MapInitializer onMapReady={handleMapReadyCallback} />
        
        <MapController 
          isAddingPoint={isAddingPoint}
          setIsAddingPoint={setIsAddingPoint}
          addNewPoint={handleAddNewPointCallback}
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
        
        {/* CRITICAL: Display BUZZ MAPPA areas with real-time updates */}
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
          onMapPointClick={handleAddNewPointCallback}
        />
      </MapContainer>

      {/* Use the LocationButton component */}
      <LocationButton requestLocationPermission={requestLocationPermission} />

      {/* Add SearchAreaButton component */}
      <SearchAreaButton 
        toggleAddingSearchArea={toggleAddingSearchArea} 
        isAddingSearchArea={isAddingSearchArea} 
      />

      {/* CRITICAL: Use the BuzzButton component with enhanced area generation callback */}
      <BuzzButton 
        handleBuzz={handleBuzz} 
        mapCenter={mapCenter}
        onAreaGenerated={handleAreaGeneratedCallback}
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
