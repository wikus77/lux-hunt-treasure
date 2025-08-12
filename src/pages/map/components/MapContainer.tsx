
import React, { useState, useRef } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { DEFAULT_LOCATION } from '../useMapLogic';
import MapController from './MapController';
import MapPopupManager from './MapPopupManager';
import SearchAreaMapLayer from '../SearchAreaMapLayer';
import MapEventHandler from './MapEventHandler';
import BuzzMapButton from '@/components/map/BuzzMapButton';
import LocationButton from './LocationButton';
import MapInstructionsOverlay from './MapInstructionsOverlay';
import SearchAreaButton from './SearchAreaButton';
import HelpDialog from '../HelpDialog';
import BuzzMapAreas from './BuzzMapAreas';
import MapInitializer from './MapInitializer';
import { useBuzzMapLogic } from '@/hooks/useBuzzMapLogic';
import { useMapStore } from '@/stores/mapStore';
import { QRMapDisplay } from '@/components/map/QRMapDisplay';
import { useGeolocation } from '@/hooks/useGeolocation';
import { GeoToggle } from '@/components/ui/GeoToggle';
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
const { status, position, enable, disable } = useGeolocation();
const geoEnabled = status === 'granted';
  const mapRef = useRef<L.Map | null>(null);
  
  // CRITICAL: Use the hook to get BUZZ areas with real-time updates
  const { currentWeekAreas, loading: areasLoading, reloadAreas } = useBuzzMapLogic();
  
  // Use Zustand store for consistent state management
  const { isAddingMapPoint, mapStatus } = useMapStore();

  // Get user location for QR proximity
  // CRITICAL: Debug logging for BUZZ areas
  React.useEffect(() => {
    if (import.meta.env.DEV) console.debug("🗺️ MapContainer - BUZZ areas updated:", {
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
    if (import.meta.env.DEV) console.debug("🔄 MapContainer - State from Zustand:", { 
      isAddingPoint, 
      isAddingMapPoint, 
      mapStatus 
    });
  }, [isAddingPoint, isAddingMapPoint, mapStatus]);

  // Toast on geolocation denied/error
  React.useEffect(() => {
    if (status === 'denied' || status === 'error') {
      try { toast.error('Geolocalizzazione non disponibile. Abilitala nelle impostazioni del browser.'); } catch {}
    }
  }, [status]);

  // Listen for BUZZ area creation events and auto-center map
  React.useEffect(() => {
    const handleBuzzAreaCreated = (event: CustomEvent) => {
      if (import.meta.env.DEV) console.debug('📍 MapContainer - Received BUZZ area creation event:', event.detail);
      if (event.detail && mapRef.current) {
        const { lat, lng, radius_km } = event.detail;
        handleAreaGeneratedCallback(lat, lng, radius_km);
      }
    };

    window.addEventListener('buzzAreaCreated', handleBuzzAreaCreated as EventListener);
    return () => {
      window.removeEventListener('buzzAreaCreated', handleBuzzAreaCreated as EventListener);
    };
  }, []);

  // Create utility functions using the extracted helpers
  const handleMapMoveCallback = handleMapMove(mapRef, setMapCenter);
  const handleMapReadyCallback = handleMapReady(mapRef, handleMapMoveCallback);
  const handleAddNewPointCallback = handleAddNewPoint(isAddingPoint, addNewPoint, setIsAddingPoint);
  
  // CRITICAL: Enhanced area generation callback with auto-zoom
  const handleAreaGeneratedCallback = (lat: number, lng: number, radiusKm: number) => {
    if (import.meta.env.DEV) console.debug('🎯 MapContainer - Area generated, auto-centering map:', { lat, lng, radiusKm });
    
    // FORCE reload areas first
    reloadAreas();
    
    // Auto-center and zoom map to show the new area after a short delay
    setTimeout(() => {
      if (import.meta.env.DEV) console.debug('📍 MapContainer - Auto-centering map on new area');
      const zoom = radiusKm <= 5 ? 12 : radiusKm <= 10 ? 11 : 10;
      
      // Set view to area center with appropriate zoom
      if (mapRef.current) {
        mapRef.current.setView([lat, lng], zoom);
        
        // Also create bounds to ensure the entire area is visible
        const radiusMeters = radiusKm * 1000;
        const bounds = L.latLng(lat, lng).toBounds(radiusMeters * 2);
        
        setTimeout(() => {
          if (mapRef.current) {
            mapRef.current.fitBounds(bounds, { padding: [20, 20] });
          }
        }, 200);
      }
    }, 1000);
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
        center={[54.5260, 15.2551]} 
        zoom={4}
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
        
        {/* QR Map Display - Show QR codes on map */}
        <QRMapDisplay userLocation={geoEnabled ? position : null} />
        
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

      {/* Geo Toggle overlay */}
      <div className="absolute top-3 right-3 z-[1000] flex items-center gap-2 bg-black/50 text-white px-2 py-1 rounded">
        <span className="text-xs">Geolocalizzazione</span>
        <GeoToggle enabled={geoEnabled} onChange={(v)=> v ? enable() : disable()} />
      </div>

      {/* Use the LocationButton component */}
      <LocationButton requestLocationPermission={requestLocationPermission} />

      {/* Add SearchAreaButton component */}
      <SearchAreaButton 
        toggleAddingSearchArea={toggleAddingSearchArea} 
        isAddingSearchArea={isAddingSearchArea} 
      />

      {/* CRITICAL: Use BuzzMapButton component that ALWAYS requires Stripe payment */}
      <BuzzMapButton 
        onBuzzPress={handleBuzz} 
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
