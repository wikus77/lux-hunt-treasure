
import React from 'react';
import { TileLayer } from 'react-leaflet';
import BuzzMapAreas from './BuzzMapAreas';
import UserLocationMarker from './UserLocationMarker';
import MapMarkers from './MapMarkers';
import SearchAreaMapLayer from '../SearchAreaMapLayer';
import PrizeLocationCircle from './PrizeLocationCircle';
import { useBuzzMapLogic } from '@/hooks/useBuzzMapLogic';

export interface MapContentProps {
  selectedWeek: number;
}

export const MapContent: React.FC<MapContentProps> = ({ selectedWeek }) => {
  const { currentWeekAreas } = useBuzzMapLogic();
  
  return (
    <>
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        subdomains="abcd"
        maxZoom={19}
      />
      
      <BuzzMapAreas areas={currentWeekAreas} selectedWeek={selectedWeek} />
      <SearchAreaMapLayer />
      <UserLocationMarker />
      <MapMarkers />
      <PrizeLocationCircle />
    </>
  );
};

export default MapContent;
