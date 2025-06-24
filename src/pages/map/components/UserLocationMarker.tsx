
import React from 'react';
import { Marker } from 'react-leaflet';

interface UserLocationMarkerProps {
  position?: [number, number];
}

const UserLocationMarker: React.FC<UserLocationMarkerProps> = ({ position }) => {
  if (!position || !Array.isArray(position) || position.length !== 2) {
    return null;
  }
  
  return <Marker position={position} />;
};

export default UserLocationMarker;
