
import React from 'react';
import LocationButton from './LocationButton';
import SearchAreaButton from './SearchAreaButton';
import BuzzMapButton from '@/components/map/BuzzMapButton';
import MapInstructionsOverlay from './MapInstructionsOverlay';
import HelpDialog from '../HelpDialog';

interface MapControlsProps {
  requestLocationPermission: () => void;
  toggleAddingSearchArea: () => void;
  isAddingSearchArea: boolean;
  handleBuzz: () => void;
  isAddingMapPoint: boolean;
  showHelpDialog: boolean;
  setShowHelpDialog: (show: boolean) => void;
  mapCenter?: [number, number];
  onAreaGenerated?: (lat: number, lng: number, radius: number) => void;
}

const MapControls: React.FC<MapControlsProps> = ({
  requestLocationPermission,
  toggleAddingSearchArea,
  isAddingSearchArea,
  handleBuzz,
  isAddingMapPoint,
  showHelpDialog,
  setShowHelpDialog,
  mapCenter,
  onAreaGenerated
}) => {
  return (
    <>
      {/* Use the LocationButton component */}
      <LocationButton requestLocationPermission={requestLocationPermission} />

      {/* Use the SearchAreaButton component */}
      <SearchAreaButton 
        toggleAddingSearchArea={toggleAddingSearchArea} 
        isAddingSearchArea={isAddingSearchArea} 
      />

      {/* CRITICAL: Use BuzzMapButton component that ALWAYS requires Stripe payment */}
      <BuzzMapButton 
        onBuzzPress={handleBuzz} 
        mapCenter={mapCenter}
        onAreaGenerated={onAreaGenerated}
      />

      {/* Use the MapInstructionsOverlay component */}
      <MapInstructionsOverlay 
        isAddingSearchArea={isAddingSearchArea} 
        isAddingMapPoint={isAddingMapPoint} 
      />

      <HelpDialog open={showHelpDialog} setOpen={setShowHelpDialog} />
    </>
  );
};

export default MapControls;
