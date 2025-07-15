
import React, { useState, useRef, useEffect } from 'react';
import { MapContainer as LeafletMapContainer, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './components/leaflet-fixes.css';
import MapContent from './MapContent';
import MapControls from './components/MapControls';
import BuzzMapButton from '@/components/map/BuzzMapButton';
import MapZoomControls from './components/MapZoomControls';
import HelpDialog from './components/HelpDialog';
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
  showHelpDialog?: boolean;
  setShowHelpDialog?: (show: boolean) => void;
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
  toggleAddingSearchArea = () => {},
  showHelpDialog = false,
  setShowHelpDialog = () => {}
}) => {
  const [mapCenter, setMapCenter] = useState<[number, number]>(DEFAULT_LOCATION);
  const mapRef = useRef<L.Map | null>(null);
  const [mapReady, setMapReady] = useState(false);
  
  // Get BUZZ areas
  const { currentWeekAreas, reloadAreas } = useBuzzMapLogic();

  // Handle map ready with iOS-specific optimizations
  const handleMapReady = (map: L.Map) => {
    mapRef.current = map;
    setMapReady(true);
    
    console.log('🗺️ Map container ready for iOS Capacitor');
    
    // iOS Capacitor fixes - multiple invalidations for proper rendering
    const invalidateMap = () => {
      if (map) {
        map.invalidateSize();
        console.log('🗺️ Map size invalidated');
      }
    };
    
    // Immediate invalidation
    setTimeout(invalidateMap, 100);
    
    // Additional iOS-specific fixes
    setTimeout(() => {
      if (map) {
        map.invalidateSize();
        map.setView(mapCenter, map.getZoom());
        console.log('🗺️ Map re-centered and invalidated for iOS');
      }
    }, 500);
    
    // Final invalidation for iOS viewport
    setTimeout(invalidateMap, 1000);
  };

  // Force map update on mount for iOS Capacitor
  useEffect(() => {
    console.log('🗺️ MapContainer mounted - iOS Capacitor mode');
    
    const timer = setTimeout(() => {
      if (mapRef.current && mapReady) {
        mapRef.current.invalidateSize();
        console.log('🗺️ Map force invalidated on mount for iOS');
      }
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [mapReady]);

  // Handle whenReady event for iOS
  const handleWhenReady = () => {
    console.log('🗺️ Leaflet map ready event fired');
  };

  // iOS-specific map container style
  const mapContainerStyle = {
    height: '100%', 
    width: '100%',
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1
  };

  console.log('🗺️ Rendering MapContainer with', currentWeekAreas.length, 'BUZZ areas');

  return (
    <div 
      className="map-container-wrapper"
      style={{
        height: '100%',
        width: '100%',
        position: 'relative',
        minHeight: '400px' // Ensure minimum height for iOS
      }}
    >
      <LeafletMapContainer 
        center={DEFAULT_LOCATION} 
        zoom={13}
        style={mapContainerStyle}
        className="map-container z-10"
        zoomControl={false}
        scrollWheelZoom={true}
        doubleClickZoom={true}
        dragging={true}
        zoomAnimation={true}
        fadeAnimation={true}
        markerZoomAnimation={true}
        inertia={true}
        whenReady={handleWhenReady}
        // iOS-specific props
        preferCanvas={true}
        // Disable problematic animations on iOS
        zoomAnimationThreshold={4}
      >
        {/* Dark tiles optimized for iOS */}
        <TileLayer
          attribution='&copy; CartoDB'
          url='https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
          maxZoom={18}
          minZoom={3}
          // iOS optimization
          updateWhenIdle={true}
          updateWhenZooming={false}
          keepBuffer={2}
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
          handleBuzz={handleBuzz}
          showHelpDialog={showHelpDialog}
          mapCenter={mapCenter}
          onAreaGenerated={(lat, lng, radius) => {
            console.log('🎯 Area generated:', { lat, lng, radius });
            reloadAreas();
          }}
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
