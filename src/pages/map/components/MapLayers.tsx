
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
  // Define the pulse animation for map points
  const mapPointPulseStyle = `
    @keyframes mapPointPulse {
      0% { box-shadow: 0 0 0 0 rgba(0, 240, 255, 0.4); }
      70% { box-shadow: 0 0 0 10px rgba(0, 240, 255, 0); }
      100% { box-shadow: 0 0 0 0 rgba(0, 240, 255, 0); }
    }
    .map-point {
      background-color: #00f0ff;
      border-radius: 50%;
      animation: mapPointPulse 2s infinite;
    }
  `;

  return (
    <>
      {/* Add the map point pulse style */}
      <style>{mapPointPulseStyle}</style>
      
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
