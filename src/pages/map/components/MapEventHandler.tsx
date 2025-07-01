
import React, { useEffect } from 'react';
import { useMapEvents } from 'react-leaflet';
import UserLocationMarker from './UserLocationMarker';
import MapMarkers from './MapMarkers';
import MapSearchAreas from './MapSearchAreas';

interface MapEventHandlerProps {
  onMapClick: (e: any) => void;
  isAddingPoint: boolean;
  setIsAddingPoint: React.Dispatch<React.SetStateAction<boolean>>;
  addNewPoint: (lat: number, lng: number) => void;
  mapPoints: any[];
  activeMapPoint: string | null;
  setActiveMapPoint: React.Dispatch<React.SetStateAction<string | null>>;
  handleUpdatePoint: (id: string, title: string, note: string) => Promise<boolean>;
  deleteMapPoint: (id: string) => Promise<boolean>;
  newPoint: any | null;
  handleSaveNewPoint: (title: string, note: string) => void;
  handleCancelNewPoint: () => void;
  isAddingSearchArea: boolean;
  handleMapClickArea: (e: any) => void;
  searchAreas: any[];
  setActiveSearchArea: React.Dispatch<React.SetStateAction<string | null>>;
  deleteSearchArea: (id: string) => Promise<boolean>;
  setPendingRadius: (value: number) => void;
}

const MapEventHandler: React.FC<MapEventHandlerProps> = ({
  onMapClick,
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
  isAddingSearchArea,
  handleMapClickArea,
  searchAreas,
  setActiveSearchArea,
  deleteSearchArea,
  setPendingRadius
}) => {
  // Handle map events
  const map = useMapEvents({
    click: (e) => {
      console.log('🗺️ Map click detected at:', e.latlng);
      
      if (isAddingPoint) {
        console.log('📍 Adding new point at:', e.latlng.lat, e.latlng.lng);
        addNewPoint(e.latlng.lat, e.latlng.lng);
        setIsAddingPoint(false);
      } else if (isAddingSearchArea) {
        console.log('🔍 Adding search area at:', e.latlng.lat, e.latlng.lng);
        handleMapClickArea(e);
      } else {
        onMapClick(e);
      }
    },
    
    zoomend: () => {
      console.log('🔍 Map zoom changed to:', map.getZoom());
    },
    
    moveend: () => {
      const center = map.getCenter();
      console.log('🗺️ Map moved to:', center.lat, center.lng);
    }
  });

  // Log map readiness
  useEffect(() => {
    if (map) {
      console.log('🗺️ Map events handler ready');
      
      // Force map to invalidate size after mount
      setTimeout(() => {
        map.invalidateSize();
      }, 100);
    }
  }, [map]);

  return (
    <>
      {/* User location marker */}
      <UserLocationMarker />
      
      {/* Map points/markers */}
      <MapMarkers
        mapPoints={mapPoints}
        activeMapPoint={activeMapPoint}
        setActiveMapPoint={setActiveMapPoint}
        handleUpdatePoint={handleUpdatePoint}
        deleteMapPoint={deleteMapPoint}
        newPoint={newPoint}
        handleSaveNewPoint={handleSaveNewPoint}
        handleCancelNewPoint={handleCancelNewPoint}
      />
      
      {/* Search areas */}
      <MapSearchAreas
        searchAreas={searchAreas}
        setActiveSearchArea={setActiveSearchArea}
        deleteSearchArea={deleteSearchArea}
        setPendingRadius={setPendingRadius}
      />
    </>
  );
};

export default MapEventHandler;
