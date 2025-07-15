
import React, { useState, useRef, useEffect } from 'react';
import { MapContainer as LeafletMapContainer, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './leaflet-fixes.css';
import MapContent from './MapContent';
import MapControls from './MapControls';
import BuzzMapButton from '@/components/map/BuzzMapButton';
import MapZoomControls from './MapZoomControls';
import HelpDialog from './HelpDialog';
import { useBuzzMapLogic } from '@/hooks/useBuzzMapLogic';

// Default location (Rome)
const DEFAULT_LOCATION: [number, number] = [41.9028, 12.4964];

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
}

const MapContainer: React.FC<MapContainerProps> = ({
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
  toggleAddingSearchArea = () => {}
}) => {
  const [mapCenter, setMapCenter] = useState<[number, number]>(DEFAULT_LOCATION);
  const [showHelpDialog, setShowHelpDialog] = useState(false);
  const mapRef = useRef<L.Map | null>(null);
  const [mapReady, setMapReady] = useState(false);
  
  // Get BUZZ areas
  const { currentWeekAreas, reloadAreas } = useBuzzMapLogic();

  // Handle map ready
  const handleMapReady = (map: L.Map) => {
    mapRef.current = map;
    setMapReady(true);
    
    // iOS Capacitor fixes
    setTimeout(() => {
      if (map) {
        map.invalidateSize();
        console.log('🗺️ Map invalidated for iOS');
      }
    }, 100);
    
    // Additional iOS fix
    setTimeout(() => {
      if (map) {
        map.invalidateSize();
        map.setView(mapCenter, map.getZoom());
        console.log('🗺️ Map re-centered for iOS');
      }
    }, 500);
  };

  // Force map update on mount for iOS
  useEffect(() => {
    const timer = setTimeout(() => {
      if (mapRef.current && mapReady) {
        mapRef.current.invalidateSize();
        console.log('🗺️ Map force invalidated on mount');
      }
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [mapReady]);

  // Handle whenReady event - no parameters expected by React Leaflet
  const handleWhenReady = () => {
    // The map instance will be available through the MapContent component
    console.log('🗺️ Map is ready');
  };

  return (
    <div className="map-container-wrapper">
      <LeafletMapContainer 
        center={DEFAULT_LOCATION} 
        zoom={13}
        className="map-container"
        zoomControl={false}
        scrollWheelZoom={true}
        doubleClickZoom={true}
        dragging={true}
        zoomAnimation={true}
        fadeAnimation={true}
        markerZoomAnimation={true}
        inertia={true}
        whenReady={handleWhenReady}
      >
        {/* Dark tiles */}
        <TileLayer
          attribution='&copy; CartoDB'
          url='https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        />
        
        {/* Map Content */}
        <MapContent
          mapRef={mapRef}
          handleMapLoad={handleMapReady}
          searchAreas={searchAreas}
          setActiveSearchArea={setActiveSearchArea}
          deleteSearchArea={deleteSearchArea}
          mapPoints={mapPoints}
          activeMapPoint={activeMapPoint}
          setActiveMapPoint={setActiveMapPoint}
          handleUpdatePoint={handleUpdatePoint}
          deleteMapPoint={deleteMapPoint}
          newPoint={newPoint}
          handleSaveNewPoint={handleSaveNewPoint}
          handleCancelNewPoint={handleCancelNewPoint}
          isAddingSearchArea={isAddingSearchArea}
          handleMapClickArea={handleMapClickArea}
          setPendingRadius={setPendingRadius}
          isAddingMapPoint={isAddingPoint}
          hookHandleMapPointClick={addNewPoint}
          currentWeekAreas={currentWeekAreas}
        />
        
        {/* Map Controls */}
        <MapControls
          requestLocationPermission={requestLocationPermission}
          toggleAddingSearchArea={toggleAddingSearchArea}
          isAddingSearchArea={isAddingSearchArea}
          isAddingMapPoint={isAddingPoint}
          setShowHelpDialog={setShowHelpDialog}
        />
        
        {/* Zoom Controls */}
        <MapZoomControls />
      </LeafletMapContainer>
      
      {/* BUZZ Button */}
      <BuzzMapButton 
        onBuzzPress={handleBuzz}
        mapCenter={mapCenter}
        onAreaGenerated={(lat, lng, radius) => {
          console.log('🎯 Area generated:', { lat, lng, radius });
          reloadAreas();
        }}
      />
      
      {/* Help Dialog */}
      <HelpDialog open={showHelpDialog} setOpen={setShowHelpDialog} />
    </div>
  );
};

export default MapContainer;
