
import React from 'react';
import { ZoomControl } from 'react-leaflet';
import LocationButton from './LocationButton';

export const MapControls: React.FC = () => {
  return (
    <>
      <ZoomControl position="bottomright" />
      <LocationButton />
    </>
  );
};

export default MapControls;
