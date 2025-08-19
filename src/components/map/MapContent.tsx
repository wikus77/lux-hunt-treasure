
import React, { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import UserMapAreas from './UserMapAreas';
import SearchAreaMapLayer from './SearchAreaMapLayer';
import MapPopupManager from './MapPopupManager';
import MapEventHandler from './MapEventHandler';
import PrizeAreaOverlay from './PrizeAreaOverlay';

interface MapContentProps {
  mapRef: React.MutableRefObject<L.Map | null>;
  handleMapLoad: (map: L.Map) => void;
  searchAreas: any[];
  setActiveSearchArea: (id: string | null) => void;
  deleteSearchArea: (id: string) => Promise<boolean>;
  mapPoints: any[];
  activeMapPoint: string | null;
  setActiveMapPoint: (id: string | null) => void;
  handleUpdatePoint: (id: string, title: string, note: string) => Promise<boolean>;
  deleteMapPoint: (id: string) => Promise<boolean>;
  newPoint: any;
  handleSaveNewPoint: (title: string, note: string) => void;
  handleCancelNewPoint: () => void;
  isAddingSearchArea: boolean;
  handleMapClickArea: (e: any) => void;
  setPendingRadius: (value: number) => void;
  isAddingMapPoint: boolean;
  hookHandleMapPointClick: (lat: number, lng: number) => void;
  currentWeekAreas: any[];
}

const MapContent: React.FC<MapContentProps> = ({
  mapRef,
  handleMapLoad,
  searchAreas,
  setActiveSearchArea,
  deleteSearchArea,
  mapPoints,
  activeMapPoint,
  setActiveMapPoint,
  handleUpdatePoint,
  deleteMapPoint,
  newPoint,
  handleSaveNewPoint,
  handleCancelNewPoint,
  isAddingSearchArea,
  handleMapClickArea,
  setPendingRadius,
  isAddingMapPoint,
  hookHandleMapPointClick,
  currentWeekAreas
}) => {
  const map = useMap();
  
  // Initialize map reference
  useEffect(() => {
    if (map && !mapRef.current) {
      mapRef.current = map;
      handleMapLoad(map);
    }
  }, [map, mapRef, handleMapLoad]);

  return (
    <>
      {/* BUZZ Map Areas */}
      <UserMapAreas areas={currentWeekAreas} />
      
      {/* Prize Area Overlay */}
      <PrizeAreaOverlay />
      
      {/* Search Areas Layer */}
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
        isAddingMapPoint={isAddingMapPoint} 
        onMapPointClick={hookHandleMapPointClick}
      />
    </>
  );
};

export default MapContent;
