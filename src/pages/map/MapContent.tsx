
import React, { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import UserMapAreas from './components/UserMapArea';
import SearchAreaMapLayer from './SearchAreaMapLayer';
import MapPopupManager from '../../components/map/MapPopupManager';
import MapEventHandler from '../../components/map/MapEventHandler';
import PrizeAreaOverlay from './components/PrizeAreaOverlay';

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
  
  useEffect(() => {
    if (map && !mapRef.current) {
      mapRef.current = map;
      handleMapLoad(map);
    }
  }, [map, mapRef, handleMapLoad]);

  return (
    <>
      <UserMapAreas areas={currentWeekAreas} />
      
      <PrizeAreaOverlay />
      
      <SearchAreaMapLayer 
        searchAreas={searchAreas}
        setActiveSearchArea={setActiveSearchArea}
        deleteSearchArea={deleteSearchArea}
      />
      
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
