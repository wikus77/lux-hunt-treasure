
import React from 'react';
import LocationButton from './LocationButton';
import SearchAreaButton from './SearchAreaButton';
import BuzzButton from './BuzzButton';
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
}

const MapControls: React.FC<MapControlsProps> = ({
  requestLocationPermission,
  toggleAddingSearchArea,
  isAddingSearchArea,
  handleBuzz,
  isAddingMapPoint,
  showHelpDialog,
  setShowHelpDialog
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

      {/* Use the BuzzButton component */}
      <BuzzButton handleBuzz={handleBuzz} />

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
