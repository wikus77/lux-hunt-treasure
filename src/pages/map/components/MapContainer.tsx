
import React, { useState, useRef, lazy, Suspense, useMemo, useEffect } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
// No default location fallback - GPS only
import MapController from './MapController';
import MapPopupManager from './MapPopupManager';
import SearchAreaMapLayer from '../SearchAreaMapLayer';
import MapEventHandler from './MapEventHandler';
import BuzzMapButtonSecure from '@/components/map/BuzzMapButtonSecure';
import LocationButton from './LocationButton';
import MapInstructionsOverlay from './MapInstructionsOverlay';
import SearchAreaButton from './SearchAreaButton';
import HelpDialog from '../HelpDialog';
import BuzzMapAreas from './BuzzMapAreas';
import MapInitializer from './MapInitializer';
import { useBuzzMapLogic } from '@/hooks/useBuzzMapLogic';
import { useMapStore } from '@/stores/mapStore';
import { QRMapDisplay } from '@/components/map/QRMapDisplay';
import { useSimpleGeolocation } from '@/hooks/useSimpleGeolocation';
import { useIPGeolocation } from '@/hooks/useIPGeolocation';
import { createTerrainLayer } from '@/lib/terrain/terrainLayer';

const LivingMap = lazy(() => import('@/features/living-map'));

import L from 'leaflet';
import { toast } from 'sonner';
import { GeoDebugOverlay } from '@/components/map/GeoDebugOverlay';
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
  onToggle3D?: (is3D: boolean) => void;
  onFocusLocation?: () => void;
  onResetView?: () => void;
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
  setShowHelpDialog = () => {},
  onToggle3D,
  onFocusLocation,
  onResetView
}) => {
  const [mapCenter, setMapCenter] = useState<[number, number]>([46.0, 8.0]); // European view
  const geo = useSimpleGeolocation();
  const ipGeo = useIPGeolocation();
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerDivRef = useRef<HTMLDivElement>(null);
  const [terrainLayer, setTerrainLayer] = useState<ReturnType<typeof createTerrainLayer> | null>(null);
  const [is3DActive, setIs3DActive] = useState(false);
  
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

  // AUTO-START IP GEOLOCATION immediatamente
  React.useEffect(() => {
    console.log('🌍 AUTO-START: Avviando geolocalizzazione IP automaticamente...');
    ipGeo.getLocationByIP();
  }, []);

  // ZOOM AUTOMATICO SULLA POSIZIONE (GPS o IP)
  React.useEffect(() => {
    const coords = geo.coords || ipGeo.coords;
    if (coords && mapRef.current) {
      console.log('🎯 AUTO-ZOOM: Centrando mappa su:', coords);
      
      mapRef.current.setView([coords.lat, coords.lng], 15, {
        animate: true,
        duration: 1.5
      });
    }
  }, [geo.coords, ipGeo.coords]);

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

  // Living Map center/zoom - riusa variabili esistenti
  const lmCenter = useMemo(() => {
    if (!mapCenter) return { lat: 41.9028, lng: 12.4964 };
    return { lat: mapCenter[0], lng: mapCenter[1] };
  }, [mapCenter]);
  const lmZoom = mapRef?.current?.getZoom?.() ?? 12;

  // M1_FOCUS event listener for Living Map badge focus
  useEffect(() => {
    const handleFocus = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail && mapRef.current) {
        mapRef.current.flyTo([detail.lat, detail.lng], detail.zoom || 15, { duration: 0.6 });
      }
    };
    window.addEventListener('M1_FOCUS', handleFocus);
    return () => window.removeEventListener('M1_FOCUS', handleFocus);
  }, []);

  // Initialize terrain layer when map is ready
  useEffect(() => {
    if (!mapRef.current || terrainLayer) return;

    const demUrl = import.meta.env.VITE_TERRAIN_URL;
    if (demUrl) {
      const layer = createTerrainLayer({
        demUrl,
        hillshade: true,
        sky: false
      });
      setTerrainLayer(layer);
    }
  }, [mapRef.current]);

  // Handle 3D toggle from parent
  useEffect(() => {
    if (!terrainLayer || !mapRef.current) return;

    const handle3DToggle = (is3D: boolean) => {
      setIs3DActive(is3D);
      
      if (is3D) {
        if (!terrainLayer.isReady()) {
          terrainLayer.addTo(mapRef.current!);
        }
        terrainLayer.show();
        terrainLayer.setPitch(45);
        
        // Apply subtle tilt effect to container
        if (mapContainerDivRef.current) {
          const mapPane = mapContainerDivRef.current.querySelector('.leaflet-container');
          if (mapPane) {
            (mapPane as HTMLElement).style.transform = 'perspective(1200px) rotateX(5deg)';
          }
        }
      } else {
        terrainLayer.hide();
        terrainLayer.setPitch(0);
        
        // Remove tilt
        if (mapContainerDivRef.current) {
          const mapPane = mapContainerDivRef.current.querySelector('.leaflet-container');
          if (mapPane) {
            (mapPane as HTMLElement).style.transform = '';
          }
        }
      }
    };

    if (onToggle3D) {
      onToggle3D(is3DActive);
    }
  }, [terrainLayer, onToggle3D, is3DActive]);

  // Handle focus location from dock
  const handleFocusLocation = () => {
    const coords = geo.coords || ipGeo.coords;
    if (coords && mapRef.current) {
      mapRef.current.flyTo([coords.lat, coords.lng], 15, { duration: 1 });
    } else {
      requestLocationPermission();
    }
  };

  // Handle reset view from dock
  const handleResetView = () => {
    if (mapRef.current) {
      mapRef.current.setView([54.5260, 15.2551], 4);
    }
  };

  // Expose handlers to parent via callback
  useEffect(() => {
    if (onFocusLocation) {
      onFocusLocation();
    }
  }, []);

  useEffect(() => {
    if (onResetView) {
      onResetView();
    }
  }, []);

  return (
    <div 
      ref={mapContainerDivRef}
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
        <QRMapDisplay userLocation={geo.coords || ipGeo.coords} />
        
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

      {/* DISABILITO GeoDebugOverlay per evitare conflitti */}
      {/* {import.meta.env.DEV && <GeoDebugOverlay />} */}


      {/* Use the LocationButton component */}
      <LocationButton requestLocationPermission={async () => {
        console.log('🎯 LOCATION BUTTON: Pressed!');
        
        // Attiva immediatamente IP geolocation
        const ipLocationPromise = ipGeo.getLocationByIP();
        
        // Prova GPS in parallelo con timeout molto breve
        const gpsPromise = new Promise((resolve) => {
          setTimeout(() => {
            console.log('🎯 GPS timeout reached, IP geolocation should be active');
            resolve(null);
          }, 1000); // 1 secondo timeout per GPS
          
          geo.requestLocation().then(resolve).catch(() => resolve(null));
        });
        
        // Usa la prima che risponde
        await Promise.race([ipLocationPromise, gpsPromise]);
      }} />

      {/* Add SearchAreaButton component */}
      <SearchAreaButton 
        toggleAddingSearchArea={toggleAddingSearchArea} 
        isAddingSearchArea={isAddingSearchArea} 
      />

      {/* CRITICAL: Use BuzzMapButtonSecure component that ALWAYS requires payment */}
      <BuzzMapButtonSecure 
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

      {/* === Living Map™ Overlay (non-distruttivo) === */}
      {import.meta.env.VITE_ENABLE_LIVING_MAP === 'true' && (
        <div
          aria-hidden
          style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1001 }}
        >
          <Suspense fallback={null}>
            <LivingMap center={lmCenter} zoom={lmZoom} mapContainerRef={mapContainerDivRef} />
          </Suspense>
        </div>
      )}
      {/* === /Living Map™ Overlay === */}
    </div>
  );
};

export default MapContainerComponent;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
