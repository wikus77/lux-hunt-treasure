
import React from 'react';
import { ZoomControl } from 'react-leaflet';

interface MapZoomControlsProps {
  position?: 'topright' | 'topleft' | 'bottomright' | 'bottomleft';
}

const MapZoomControls: React.FC<MapZoomControlsProps> = ({ 
  position = 'topright' 
}) => {
  return (
    <ZoomControl
      position={position}
      zoomInTitle="Zoom in"
      zoomOutTitle="Zoom out"
    />
  );
};

export default MapZoomControls;
