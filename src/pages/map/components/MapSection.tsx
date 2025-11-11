// 🔧 FILE CREATO O MODIFICATO — BY JOSEPH MULE
import React, { lazy, Suspense } from 'react';
import MapLoadingFallback from './MapLoadingFallback';
import LivingMapOverlay from '@/components/living/LivingMapOverlay';
import MapDock from '@/components/map/MapDock';
import PortalContainer from '@/components/map/PortalContainer';
import MapLayerToggle from '@/components/map/MapLayerToggle';
import '@/styles/map-dock.css';
import '@/styles/portal-container.css';
import '@/styles/maplibre-tron.css';

// Lazy load MapLibre-based map container (MapTiler + 3D)
const MapContainer = lazy(() => import('../MapContainerMapLibre'));

interface MapSectionProps {
  isAddingPoint: boolean;
  setIsAddingPoint: (value: boolean) => void;
  addNewPoint: (lat: number, lng: number) => void;
  mapPoints: any[];
  activeMapPoint: any;
  setActiveMapPoint: (point: any) => void;
  updateMapPoint: (id: string, title: string, note: string) => Promise<boolean>;
  deleteMapPoint: (id: string) => Promise<boolean>;
  newPoint: any;
  savePoint: (title: string, note: string) => Promise<void>;
  handleBuzz: () => void;
  requestLocationPermission: () => void;
  isAddingSearchArea: boolean;
  handleMapClickArea: (e: any) => void;
  searchAreas: any[];
  setActiveSearchArea: (area: any) => void;
  deleteSearchArea: (id: string) => Promise<boolean>;
  setPendingRadius: (radius: number) => void;
  toggleAddingSearchArea: () => void;
  showHelpDialog: boolean;
  setShowHelpDialog: (show: boolean) => void;
  // Handlers from NewMapPage
  onToggle3D?: (is3D: boolean) => void;
  onFocusLocation?: () => void;
  onResetView?: () => void;
  onRegisterToggle3D?: (handler: (is3D: boolean) => void) => void;
  onRegisterFocusLocation?: (handler: () => void) => void;
  onRegisterResetView?: (handler: () => void) => void;
}

const MapSection: React.FC<MapSectionProps> = ({
  isAddingPoint,
  setIsAddingPoint,
  addNewPoint,
  mapPoints,
  activeMapPoint,
  setActiveMapPoint,
  updateMapPoint,
  deleteMapPoint,
  newPoint,
  savePoint,
  handleBuzz,
  requestLocationPermission,
  isAddingSearchArea,
  handleMapClickArea,
  searchAreas,
  setActiveSearchArea,
  deleteSearchArea,
  setPendingRadius,
  toggleAddingSearchArea,
  showHelpDialog,
  setShowHelpDialog,
  onToggle3D,
  onFocusLocation,
  onResetView,
  onRegisterToggle3D,
  onRegisterFocusLocation,
  onRegisterResetView,
}) => {
  // P0 FIX: Internal handler refs to bridge MapDock <-> MapContainer
  const toggle3DHandlerRef = React.useRef<((is3D: boolean) => void) | null>(null);
  
  // When MapContainer registers its handler, store it
  const handleRegisterToggle3D = React.useCallback((handler: (is3D: boolean) => void) => {
    toggle3DHandlerRef.current = handler;
    if (onRegisterToggle3D) {
      onRegisterToggle3D(handler);
    }
  }, [onRegisterToggle3D]);
  
  // When MapDock calls onToggle3D, invoke the stored handler
  const handleToggle3D = React.useCallback((is3D: boolean) => {
    if (toggle3DHandlerRef.current) {
      toggle3DHandlerRef.current(is3D);
    }
    if (onToggle3D) {
      onToggle3D(is3D);
    }
  }, [onToggle3D]);

  return (
    <div className="m1ssion-glass-card p-4 sm:p-6 mb-6 m1-dock-enabled" style={{ marginTop: "20px" }}>
      {/* Titoli sopra la mappa - BY JOSEPH MULE */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-orbitron font-bold mb-1">
          <span className="text-[#00ffff]">BUZZ</span>
          <span className="text-white"> MAP</span>
        </h1>
        <h2 className="text-base text-white/80 font-medium">Mappa Operativa</h2>
      </div>
      {/* Container mappa con fix overflow - BY JOSEPH MULE */}
      <div className="relative rounded-lg overflow-hidden border border-white/10" 
           style={{ minHeight: "400px", marginTop: "0px" }}>
        
        {/* Living Map™ Overlay */}
        <LivingMapOverlay mode="auto" />
        
        {/* M1SSION Portal Container - Left Side */}
        <PortalContainer 
          portalCount={12}
          onPortalAction={(type) => console.log('🎯 Portal filter:', type)}
        />
        
        {/* LIVING LAYERS - Top Right */}
        <MapLayerToggle />
        
        {/* M1SSION Map Dock - Unified Controls */}
        <MapDock
          onToggle3D={handleToggle3D}
          onFocus={onFocusLocation}
          onReset={onResetView}
          onBuzz={handleBuzz}
          terrain3DAvailable={!!import.meta.env.VITE_TERRAIN_URL}
        />
        
        <Suspense fallback={<MapLoadingFallback />}>
          <MapContainer
            isAddingPoint={isAddingPoint}
            setIsAddingPoint={setIsAddingPoint}
            addNewPoint={addNewPoint}
            mapPoints={mapPoints.map(p => ({
              id: p.id,
              lat: p.latitude,
              lng: p.longitude,
              title: p.title,
              note: p.note,
              position: { lat: p.latitude, lng: p.longitude }
            }))}
            activeMapPoint={activeMapPoint}
            setActiveMapPoint={setActiveMapPoint}
            handleUpdatePoint={updateMapPoint}
            deleteMapPoint={deleteMapPoint}
            newPoint={newPoint}
            handleSaveNewPoint={savePoint}
            handleCancelNewPoint={() => {
              // Cancel adding new point by saving with empty title
              savePoint('', '');
            }}
            handleBuzz={handleBuzz}
            requestLocationPermission={requestLocationPermission}
            isAddingSearchArea={isAddingSearchArea}
            handleMapClickArea={handleMapClickArea}
            searchAreas={searchAreas}
            setActiveSearchArea={setActiveSearchArea}
            deleteSearchArea={deleteSearchArea}
            setPendingRadius={setPendingRadius}
            toggleAddingSearchArea={toggleAddingSearchArea}
            showHelpDialog={showHelpDialog}
            setShowHelpDialog={setShowHelpDialog}
            onToggle3D={handleRegisterToggle3D}
            onFocusLocation={onRegisterFocusLocation}
            onResetView={onRegisterResetView}
          />
        </Suspense>
      </div>
    </div>
  );
};

export default MapSection;