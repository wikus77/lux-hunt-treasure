
import React from 'react';
import { TileLayer } from 'react-leaflet';
import SearchAreaMapLayer from '../SearchAreaMapLayer';

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
  return (
    <>
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
      
      {/* Display search areas */}
      <SearchAreaMapLayer 
        searchAreas={searchAreas} 
        setActiveSearchArea={setActiveSearchArea}
        deleteSearchArea={deleteSearchArea}
      />
    </>
  );
};

export default MapLayers;
