// © 2025 All Rights Reserved – M1SSION™ – NIYVORA KFT Joseph MULÉ
import { useState, useRef } from 'react';
import { MapContainer as LeafletMapContainer, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './leaflet-fixes.css';
import '@/styles/marker-styles.css';

// Component imports
import { QRMapDisplay } from './QRMapDisplay';
import BuzzMapAreas from '@/pages/map/components/BuzzMapAreas';
import SearchAreaMapLayer from '@/pages/map/SearchAreaMapLayer';
import MapPopupManager from './MapPopupManager';
import MapEventHandler from './MapEventHandler';
import { CenterOnUserOnce } from './CenterOnUserOnce';
import BuzzMapButton from './BuzzMapButton';
import MapControls from './MapControls';
import MapZoomControls from './MapZoomControls';
import HelpDialog from './HelpDialog';

// Hooks
import { useBuzzMapLogic } from '@/hooks/useBuzzMapLogic';
import { useGeolocation } from '@/hooks/useGeolocation';

// Europe center location for initial map view
const EUROPE_CENTER: [number, number] = [54.5260, 15.2551];

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

const MapContainer = ({
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
}: MapContainerProps) => {
  const [mapReady, setMapReady] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>(EUROPE_CENTER);
  const mapRef = useRef<L.Map | null>(null);
  
  // Get user location and BUZZ areas
  const { status, position, enabled } = useGeolocation();
  const geoEnabled = enabled && status === 'granted';
  const { currentWeekAreas, reloadAreas } = useBuzzMapLogic();

  // Handle map ready with proper iOS optimizations
  const handleMapReady = (map: L.Map) => {
    mapRef.current = map;
    setMapReady(true);
    console.log('🗺️ Map ready with', currentWeekAreas.length, 'BUZZ areas');
    
    // iOS optimizations
    setTimeout(() => {
      if (map) {
        map.invalidateSize();
        console.log('🗺️ Map invalidated for iOS');
      }
    }, 100);
  };

  return (
    <div 
      className="flex-1 relative w-full border border-muted/20 rounded-lg overflow-hidden bg-muted/10"
      style={{
        height: 'calc(100dvh - 60px - 80px)', // Header + BottomNav
        minHeight: '400px',
        margin: '8px'
      }}
    >
      <LeafletMapContainer 
        center={EUROPE_CENTER} 
        zoom={5} // Europe-wide view
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
        {/* SINGLE TILE LAYER */}
        <TileLayer
          attribution='&copy; CartoDB'
          url='https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
          maxZoom={18}
          minZoom={3}
        />
        
        {/* User location marker */}
        <CenterOnUserOnce />
        
        {/* BUZZ Map Areas */}
        <BuzzMapAreas areas={currentWeekAreas} />
        
        {/* QR Map Display */}
        <QRMapDisplay userLocation={geoEnabled ? position : null} />
        
        {/* Search Areas */}
        <SearchAreaMapLayer 
          searchAreas={searchAreas} 
          setActiveSearchArea={setActiveSearchArea}
          deleteSearchArea={deleteSearchArea}
        />
        
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