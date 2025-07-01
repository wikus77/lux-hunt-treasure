
import React, { useMemo, useRef, useCallback } from 'react';
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

  // CRITICAL FIX: Memoized map center to prevent constant re-rendering
  const stableCenter = useMemo(() => center, [center[0], center[1]]);
  const stableZoom = useMemo(() => zoom, [zoom]);

  console.log('🗺️ MapContainer rendering with center:', stableCenter, 'zoom:', stableZoom);

  const handleMapReady = useCallback((mapInstance: any) => {
    if (mapRef) {
      mapRef.current = mapInstance;
    }
    console.log('🗺️ Map instance ready and assigned to ref');
  }, [mapRef]);

  return (
    <div 
      className="w-full relative"
      style={{ 
        // CRITICAL FIX: Proper height and overflow for map visibility
        height: '70vh',
        minHeight: '500px',
        maxHeight: '80vh',
        borderRadius: '24px',
        overflow: 'hidden',
        // CRITICAL: Ensure proper z-index and visibility
        zIndex: 1,
        position: 'relative',
        display: 'block',
        visibility: 'visible'
      }}
    >
      {/* CRITICAL FIX: Leaflet Map Container with stable props */}
      <LeafletMapContainer
        center={stableCenter}
        zoom={stableZoom}
        className="w-full h-full rounded-[24px]"
        style={{ 
          // CRITICAL: Ensure map takes full container space
          width: '100%', 
          height: '100%',
          borderRadius: '24px',
          zIndex: 1,
          position: 'relative'
        }}
        zoomControl={true}
        scrollWheelZoom={true}
        doubleClickZoom={true}
        dragging={true}
        whenReady={handleMapReady}
        // CRITICAL: Prevent constant re-mounting
        key={`map-${stableCenter[0]}-${stableCenter[1]}-${stableZoom}`}
      >
        {/* Map content with stable props */}
        <MapContent selectedWeek={selectedWeek} />
        
        {/* Event handlers */}
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
        <div className="absolute inset-0 z-50 bg-black/50 flex items-center justify-center p-4 rounded-[24px]">
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
