
import React, { useMemo, useCallback, useEffect, useRef } from 'react';
import { MapContainer as LeafletMapContainer } from 'react-leaflet';
import { useMapView } from '../hooks/useMapView';
import { MapContent } from './MapContent';
import MapEventHandler from './MapEventHandler';

export interface MapContainerProps {
  mapRef: React.RefObject<any>;
  onMapClick: (e: any) => void;
  selectedWeek: number;
  isAddingPoint: boolean;
  setIsAddingPoint: React.Dispatch<React.SetStateAction<boolean>>;
  addNewPoint: (lat: number, lng: number) => void;
  mapPoints: {
    id: string;
    lat: number;
    lng: number;
    title: string;
    note: string;
    position: { lat: number; lng: number };
  }[];
  activeMapPoint: string | null;
  setActiveMapPoint: React.Dispatch<React.SetStateAction<string | null>>;
  handleUpdatePoint: (id: string, title: string, note: string) => Promise<boolean>;
  deleteMapPoint: (id: string) => Promise<boolean>;
  newPoint: any | null;
  handleSaveNewPoint: (title: string, note: string) => void;
  handleCancelNewPoint: () => void;
  handleBuzz: () => void;
  requestLocationPermission: () => void;
  isAddingSearchArea: boolean;
  handleMapClickArea: (e: any) => void;
  searchAreas: any[];
  setActiveSearchArea: React.Dispatch<React.SetStateAction<string | null>>;
  deleteSearchArea: (id: string) => Promise<boolean>;
  setPendingRadius: (value: number) => void;
  toggleAddingSearchArea: () => void;
  showHelpDialog: boolean;
  setShowHelpDialog: React.Dispatch<React.SetStateAction<boolean>>;
}

export const MapContainer: React.FC<MapContainerProps> = ({
  mapRef,
  onMapClick,
  selectedWeek,
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
  requestLocationPermission,
  isAddingSearchArea,
  handleMapClickArea,
  searchAreas,
  setActiveSearchArea,
  deleteSearchArea,
  setPendingRadius,
  toggleAddingSearchArea,
  showHelpDialog,
  setShowHelpDialog
}) => {
  const { center, zoom } = useMapView();
  const mapInstanceRef = useRef<any>(null);

  // Stable values to prevent re-renders
  const stableCenter = useMemo(() => center, [center[0], center[1]]);
  const stableZoom = useMemo(() => zoom, [zoom]);

  // Handle map ready and force proper sizing
  const handleMapReady = useCallback((mapInstance: any) => {
    console.log('🗺️ Map instance ready');
    mapInstanceRef.current = mapInstance;
    
    // Critical fix: Force map to recognize container size
    setTimeout(() => {
      if (mapInstance) {
        mapInstance.invalidateSize({ animate: false });
        console.log('🗺️ Map size invalidated');
      }
    }, 100);
    
    // Additional resize after tiles load
    setTimeout(() => {
      if (mapInstance) {
        mapInstance.invalidateSize({ animate: true });
        console.log('🗺️ Map size re-invalidated');
      }
    }, 1000);
  }, []);

  // Force resize on window resize (important for Capacitor)
  useEffect(() => {
    const handleResize = () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="relative w-full h-full">
      <LeafletMapContainer
        center={stableCenter}
        zoom={stableZoom}
        className="w-full h-full"
        style={{ 
          width: '100%', 
          height: '100%',
          minHeight: '500px',
          zIndex: 1,
          backgroundColor: '#1a1a1a'
        }}
        zoomControl={true}
        scrollWheelZoom={true}
        doubleClickZoom={true}
        dragging={true}
        whenReady={handleMapReady}
        key={`map-${stableCenter[0]}-${stableCenter[1]}-${stableZoom}`}
      >
        <MapContent 
          selectedWeek={selectedWeek} 
          mapPoints={mapPoints}
          activeMapPoint={activeMapPoint}
          setActiveMapPoint={setActiveMapPoint}
          handleUpdatePoint={handleUpdatePoint}
          deleteMapPoint={deleteMapPoint}
          newPoint={newPoint}
          handleSaveNewPoint={handleSaveNewPoint}
          handleCancelNewPoint={handleCancelNewPoint}
        />
        
        <MapEventHandler
          onMapClick={onMapClick}
          isAddingPoint={isAddingPoint}
          setIsAddingPoint={setIsAddingPoint}
          addNewPoint={addNewPoint}
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
          searchAreas={searchAreas}
          setActiveSearchArea={setActiveSearchArea}
          deleteSearchArea={deleteSearchArea}
          setPendingRadius={setPendingRadius}
        />
      </LeafletMapContainer>

      {/* Help Dialog Overlay */}
      {showHelpDialog && (
        <div className="absolute inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-black/90 backdrop-blur-xl p-6 rounded-xl border border-cyan-500/30 max-w-md">
            <h3 className="text-lg font-bold text-white mb-4">Aiuto Mappa</h3>
            <div className="text-gray-300 space-y-2 text-sm">
              <p>• <strong>Aggiungi Punto:</strong> Attiva modalità e clicca sulla mappa</p>
              <p>• <strong>BUZZ Mappa:</strong> Genera aree di ricerca dinamiche</p>
              <p>• <strong>Zoom:</strong> Usa rotella mouse o pinch</p>
              <p>• <strong>Esplora:</strong> Trascina per navigare</p>
            </div>
            <button
              onClick={() => setShowHelpDialog(false)}
              className="mt-4 w-full bg-cyan-500 hover:bg-cyan-600 text-black font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Chiudi
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapContainer;
