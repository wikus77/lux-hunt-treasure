// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
// UNIFIED MAP CONTAINER - Single source of truth for all map layers

import React, { useState, useRef, useEffect } from 'react';
import { MapContainer as LeafletMapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Import ONLY the main map components - no duplicates
import { QRMapDisplay } from './QRMapDisplay';
import BuzzMapAreas from '@/pages/map/components/BuzzMapAreas';
import SearchAreaMapLayer from '@/pages/map/SearchAreaMapLayer';
import MapPopupManager from './MapPopupManager';
import MapEventHandler from './MapEventHandler';
import { CenterOnUserOnce } from './CenterOnUserOnce';

// Import buttons and controls
import BuzzMapButton from '@/components/map/BuzzMapButton';
import MapControls from './MapControls';
import MapZoomControls from './MapZoomControls';
import HelpDialog from './HelpDialog';

// Import required hooks and utilities
import { useBuzzMapLogic } from '@/hooks/useBuzzMapLogic';
import { useGeolocation } from '@/hooks/useGeolocation';

const DEFAULT_LOCATION: [number, number] = [45.4642, 9.19];

interface UnifiedMapContainerProps {
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
  isAddingSearchArea?: boolean;
  handleMapClickArea?: (e: any) => void;
  searchAreas?: any[];
  setActiveSearchArea?: (id: string | null) => void;
  deleteSearchArea?: (id: string) => Promise<boolean>;
  setPendingRadius?: (value: number) => void;
  handleBuzz?: () => void;
  requestLocationPermission?: () => void;
  toggleAddingSearchArea?: () => void;
}

const UnifiedMapContainer: React.FC<UnifiedMapContainerProps> = ({
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
  isAddingSearchArea = false,
  handleMapClickArea = () => {},
  searchAreas = [],
  setActiveSearchArea = () => {},
  deleteSearchArea = async () => false,
  setPendingRadius = () => {},
  handleBuzz = () => {},
  requestLocationPermission = () => {},
  toggleAddingSearchArea = () => {}
}) => {
  const [mapReady, setMapReady] = useState(false);
  const [showHelpDialog, setShowHelpDialog] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>(DEFAULT_LOCATION);
  const mapRef = useRef<L.Map | null>(null);
  const { status, position, enabled } = useGeolocation();
  const geoEnabled = enabled && status === 'granted';
  
  // SINGLE SOURCE: Get BUZZ areas
  const { currentWeekAreas, reloadAreas } = useBuzzMapLogic();

  // Handle map ready
  const handleMapReady = (map: L.Map) => {
    mapRef.current = map;
    setMapReady(true);
    console.log('🗺️ UNIFIED: Map ready with', currentWeekAreas.length, 'BUZZ areas');
    
    // iOS optimizations
    setTimeout(() => {
      if (map) {
        map.invalidateSize();
        console.log('🗺️ UNIFIED: Map invalidated for iOS');
      }
    }, 100);
  };

  return (
    <div className="map-container-wrapper w-full h-full">
      <LeafletMapContainer 
        center={DEFAULT_LOCATION} 
        zoom={13}
        className="map-container w-full h-full"
        zoomControl={false}
        scrollWheelZoom={true}
        doubleClickZoom={true}
        dragging={true}
        zoomAnimation={true}
        fadeAnimation={true}
        markerZoomAnimation={true}
        inertia={true}
        whenReady={() => {
          const map = mapRef.current;
          if (map) handleMapReady(map);
        }}
      >
        {/* SINGLE TILE LAYER - No duplicates */}
        <TileLayer
          attribution='&copy; CartoDB'
          url='https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        />
        
        {/* User location marker */}
        <CenterOnUserOnce />
        
        {/* SINGLE INSTANCE: BUZZ Map Areas */}
        <BuzzMapAreas areas={currentWeekAreas} />
        
        {/* SINGLE INSTANCE: QR Map Display */}
        <QRMapDisplay userLocation={geoEnabled ? position : null} />
        
        {/* SINGLE INSTANCE: Search Areas */}
        <SearchAreaMapLayer 
          searchAreas={searchAreas} 
          setActiveSearchArea={setActiveSearchArea}
          deleteSearchArea={deleteSearchArea}
        />
        
        {/* SINGLE INSTANCE: Map Popup Manager */}
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
        
        {/* SINGLE INSTANCE: Map Event Handler */}
        <MapEventHandler 
          isAddingSearchArea={isAddingSearchArea} 
          handleMapClickArea={handleMapClickArea}
          searchAreas={searchAreas}
          setPendingRadius={setPendingRadius}
          isAddingMapPoint={isAddingPoint} 
          onMapPointClick={addNewPoint}
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
          console.log('🎯 UNIFIED: Area generated:', { lat, lng, radius });
          reloadAreas();
        }}
      />
      
      {/* Help Dialog */}
      <HelpDialog open={showHelpDialog} setOpen={setShowHelpDialog} />
    </div>
  );
};

export default UnifiedMapContainer;