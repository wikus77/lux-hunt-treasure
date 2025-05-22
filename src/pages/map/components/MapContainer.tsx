import React from 'react';
import { MapContainer as LeafletMapContainer, TileLayer } from 'react-leaflet';
import MapEventHandler from './MapEventHandler';
import { getDefaultMapSettings } from '@/utils/mapUtils';

interface MapContainerProps {
  center: [number, number];
  handleMapLoad: () => void;
  markers: Array<any>;
  isAddingMarker: boolean;
  handleMapClickMarker: (e: any) => void;
  activeMarker: string | null;
  setActiveMarker: (id: string | null) => void;
  saveMarkerNote: (id: string, note: string) => void;
  deleteMarker: (id: string) => void;
  currentLocation?: [number, number] | null;
}

const MapContainer: React.FC<MapContainerProps> = ({
  center,
  handleMapLoad,
  markers,
  isAddingMarker,
  handleMapClickMarker,
  activeMarker,
  setActiveMarker,
  saveMarkerNote,
  deleteMarker,
  currentLocation
}) => {
  const { tileUrl, attribution } = getDefaultMapSettings();
  
  return (
    <LeafletMapContainer
      center={center}
      zoom={13}
      style={{ height: '100%', width: '100%' }}
      whenReady={handleMapLoad}
    >
      <TileLayer
        url={tileUrl}
        attribution={attribution}
      />
      
      {/* Map markers would go here */}
      
      {/* Map event handlers */}
      <MapEventHandler
        isAddingMarker={isAddingMarker}
        handleMapClickMarker={handleMapClickMarker}
        markers={markers}
        currentLocation={currentLocation}
      />
    </LeafletMapContainer>
  );
};

export default MapContainer;
