
import React from 'react';
import { TileLayer } from 'react-leaflet';

interface MapLayersProps {
  searchAreas: any[];
  setActiveSearchArea: (id: string | null) => void;
  deleteSearchArea: (id: string) => Promise<boolean>;
}

const MapLayers: React.FC<MapLayersProps> = ({
  searchAreas,
  setActiveSearchArea,
  deleteSearchArea
}) => {
  console.log('🗺️ MapLayers rendering with search areas:', searchAreas.length);

  return (
    <>
      {/* Base tile layer */}
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      
      {/* Note: Search areas are now rendered by SearchAreaMapLayer component */}
      {/* This component only handles the base tile layer */}
    </>
  );
};

export default MapLayers;
