
import React from 'react';
import { Marker, Circle } from '@react-google-maps/api';

interface MapMarkersProps {
  userLocation: [number, number] | null;
  prizeLocation: [number, number] | null;
  bufferRadius: number | null;
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
        <Marker
          position={{ lat: userLocation[0], lng: userLocation[1] }}
          icon={{
            url: '/assets/marker-icon.png',
            scaledSize: new window.google.maps.Size(30, 30),
            origin: new window.google.maps.Point(0, 0),
            anchor: new window.google.maps.Point(15, 15),
          }}
        />
      )}
      
      {/* Prize location circle */}
      {prizeLocation && bufferRadius && (
        <Circle
          center={{ lat: prizeLocation[0], lng: prizeLocation[1] }}
          options={{
            strokeColor: '#00D1FF',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: '#00D1FF',
            fillOpacity: 0.2,
            clickable: false,
            draggable: false,
            editable: false,
            visible: true,
            radius: bufferRadius,
            zIndex: 1,
          }}
        />
      )}
    </>
  );
};

export default MapMarkers;
