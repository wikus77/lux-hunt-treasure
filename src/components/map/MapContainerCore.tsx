
import React from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import MapInitializer from '@/pages/map/components/MapInitializer';
import MapController from '@/pages/map/components/MapController';
import BuzzMapAreas from '@/pages/map/components/BuzzMapAreas';
import SearchAreaMapLayer from '@/pages/map/SearchAreaMapLayer';
import MapPopupManager from '@/pages/map/components/MapPopupManager';
import MapEventHandler from '@/pages/map/components/MapEventHandler';
import L from 'leaflet';

interface MapContainerCoreProps {
  onMapReady: (map: L.Map) => void;
  isAddingPoint: boolean;
  setIsAddingPoint: (value: boolean) => void;
  onAddNewPoint: (lat: number, lng: number) => void;
  mapPoints: any[];
  activeMapPoint: string | null;
  setActiveMapPoint: (id: string | null) => void;
  handleUpdatePoint: (id: string, title: string, note: string) => Promise<boolean>;
  deleteMapPoint: (id: string) => Promise<boolean>;
  newPoint: any | null;
  handleSaveNewPoint: (title: string, note: string) => void;
  handleCancelNewPoint: () => void;
  isAddingSearchArea?: boolean;
  handleMapClickArea?: (e: any) => void;
  searchAreas?: any[];
  setActiveSearchArea?: (id: string | null) => void;
  deleteSearchArea?: (id: string) => Promise<boolean>;
  setPendingRadius?: (value: number) => void;
  currentWeekAreas: any[];
  defaultLocation: [number, number];
}

const MapContainerCore: React.FC<MapContainerCoreProps> = ({
  onMapReady,
  isAddingPoint,
  setIsAddingPoint,
  onAddNewPoint,
  mapPoints,
  activeMapPoint,
  setActiveMapPoint,
  handleUpdatePoint,
  deleteMapPoint,
  newPoint,
  handleSaveNewPoint,
  handleCancelNewPoint,
  isAddingSearchArea = false,
  handleMapClickArea = () => {},
  searchAreas = [],
  setActiveSearchArea = () => {},
  deleteSearchArea = async () => false,
  setPendingRadius = () => {},
  currentWeekAreas,
  defaultLocation
}) => {
  return (
    <MapContainer 
      center={defaultLocation} 
      zoom={15}
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
      <MapInitializer onMapReady={onMapReady} />
      
      <MapController 
        isAddingPoint={isAddingPoint}
        setIsAddingPoint={setIsAddingPoint}
        addNewPoint={onAddNewPoint}
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
      
      {/* Visualizza le aree BUZZ MAPPA */}
      <BuzzMapAreas areas={currentWeekAreas} />
      
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
        onMapPointClick={onAddNewPoint}
      />
    </MapContainer>
  );
};

export default MapContainerCore;
