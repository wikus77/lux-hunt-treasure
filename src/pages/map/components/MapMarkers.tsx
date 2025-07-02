
import React from 'react';
import { Marker, Circle } from 'react-leaflet';

interface MapMarkersProps {
  userLocation?: [number, number] | null;
  prizeLocation?: [number, number] | null;
  bufferRadius?: number | null;
}

const MapMarkers: React.FC<MapMarkersProps> = ({ 
  userLocation, 
  prizeLocation, 
  bufferRadius 
}) => {
  return (
    <>
      {/* User marker */}
      {userLocation && (
        <Marker position={userLocation} />
      )}
      
      {/* Prize location circle */}
      {prizeLocation && bufferRadius && (
        <Circle
          center={prizeLocation}
          radius={bufferRadius}
          pathOptions={{
            color: '#00D1FF',
            fillColor: '#00D1FF',
            fillOpacity: 0.2,
            weight: 2
          }}
        />
      )}
    </>
  );
};

export default MapMarkers;
