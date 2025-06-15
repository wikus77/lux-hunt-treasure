
import React, { useMemo } from 'react';
import { MapContainer as LeafletMapContainer } from 'react-leaflet';
import { useMapView } from '../hooks/useMapView';
import { MapContent } from './MapContent';
import { MapControls } from './MapControls';
import TechnicalStatus from './TechnicalStatus';

interface MapContainerProps {
  mapRef: React.RefObject<any>;
  onMapClick: (e: any) => void;
  selectedWeek: number;
}

export const MapContainer: React.FC<MapContainerProps> = ({
  mapRef,
  onMapClick,
  selectedWeek
}) => {
  const mapView = useMapView();
  const { mapCenter, mapZoom } = mapView || { mapCenter: [45.4642, 9.1900] as [number, number], mapZoom: 6 };

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
