
import React, { useMemo } from 'react';
import { MapContainer as LeafletMapContainer } from 'react-leaflet';
import { useMapView } from '../hooks/useMapView';
import { MapContent } from './MapContent';
import { MapControls } from './MapControls';
import TechnicalStatus from './TechnicalStatus';

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
  const mapView = useMapView();
  const { mapCenter, mapZoom } = mapView || { 
    mapCenter: [45.4642, 9.1900] as [number, number], 
    mapZoom: 6 
  };

  const mapProps = useMemo(() => ({
    center: mapCenter,
    zoom: mapZoom,
    className: "w-full h-full relative z-0",
    zoomControl: false,
    attributionControl: false,
    onClick: onMapClick
  }), [mapCenter, mapZoom, onMapClick]);

  return (
    <div className="relative w-full h-full">
      <LeafletMapContainer 
        ref={mapRef}
        {...mapProps}
      >
        <MapContent selectedWeek={selectedWeek} />
        <MapControls />
      </LeafletMapContainer>
      
      <TechnicalStatus />
    </div>
  );
};

export default MapContainer;
