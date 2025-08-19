// 🔧 FILE CREATO O MODIFICATO — BY JOSEPH MULE
import React, { lazy, Suspense } from 'react';
import MapLoadingFallback from './MapLoadingFallback';

// Lazy load heavy map components
const MapContainer = lazy(() => import('./MapContainer'));

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
}) => {
  return (
    <div className="m1ssion-glass-card p-4 sm:p-6 mb-6" style={{ marginTop: "20px" }}>
      {/* Titoli sopra la mappa - BY JOSEPH MULE */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-orbitron font-bold mb-1">
          <span className="text-[#00ffff]">BUZZ</span>
          <span className="text-white"> MAPPA</span>
        </h1>
        <h2 className="text-base text-white/80 font-medium">Mappa Operativa</h2>
      </div>
      {/* Container mappa con fix overflow - BY JOSEPH MULE */}
      <div className="relative rounded-lg overflow-hidden border border-white/10" 
           style={{ minHeight: "400px", marginTop: "0px" }}>
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
          />
        </Suspense>
      </div>
    </div>
  );
};

export default MapSection;