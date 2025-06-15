
import React from 'react';
import { TileLayer } from 'react-leaflet';
import { BuzzMapAreas } from './BuzzMapAreas';
import { UserLocationMarker } from './UserLocationMarker';
import { MapMarkers } from './MapMarkers';
import { SearchAreaMapLayer } from '../SearchAreaMapLayer';
import { PrizeLocationCircle } from './PrizeLocationCircle';

interface MapContentProps {
  selectedWeek: number;
}

export const MapContent: React.FC<MapContentProps> = ({ selectedWeek }) => {
  return (
    <>
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        subdomains="abcd"
        maxZoom={19}
      />
      
      <BuzzMapAreas selectedWeek={selectedWeek} />
      <SearchAreaMapLayer />
      <UserLocationMarker />
      <MapMarkers />
      <PrizeLocationCircle />
    </>
  );
};
