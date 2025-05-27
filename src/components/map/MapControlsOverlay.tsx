
import React from 'react';
import LocationButton from '@/pages/map/components/LocationButton';
import SearchAreaButton from '@/pages/map/components/SearchAreaButton';
import BuzzButton from '@/pages/map/components/BuzzButton';
import MapInstructionsOverlay from '@/pages/map/components/MapInstructionsOverlay';
import HelpDialog from '@/pages/map/HelpDialog';

interface MapControlsOverlayProps {
  requestLocationPermission: () => void;
  toggleAddingSearchArea: () => void;
  isAddingSearchArea: boolean;
  handleBuzz: () => void;
  mapCenter: [number, number];
  onAreaGenerated: (lat: number, lng: number, radiusKm: number) => void;
  isAddingMapPoint: boolean;
  showHelpDialog?: boolean;
  setShowHelpDialog?: (show: boolean) => void;
}

const MapControlsOverlay: React.FC<MapControlsOverlayProps> = ({
  requestLocationPermission,
  toggleAddingSearchArea,
  isAddingSearchArea,
  handleBuzz,
  mapCenter,
  onAreaGenerated,
  isAddingMapPoint,
  showHelpDialog = false,
  setShowHelpDialog = () => {}
}) => {
  return (
    <>
      {/* Use the LocationButton component */}
      <LocationButton requestLocationPermission={requestLocationPermission} />

      {/* Add SearchAreaButton component */}
      <SearchAreaButton 
        toggleAddingSearchArea={toggleAddingSearchArea} 
        isAddingSearchArea={isAddingSearchArea} 
      />

      {/* Use the BuzzButton component with map center and area generation callback */}
      <BuzzButton 
        handleBuzz={handleBuzz} 
        mapCenter={mapCenter}
        onAreaGenerated={onAreaGenerated}
      />

      {/* Use the MapInstructionsOverlay component */}
      <MapInstructionsOverlay 
        isAddingSearchArea={isAddingSearchArea} 
        isAddingMapPoint={isAddingMapPoint}
      />
      
      {/* Help Dialog */}
      {setShowHelpDialog && 
        <HelpDialog open={showHelpDialog || false} setOpen={setShowHelpDialog} />
      }
    </>
  );
};

export default MapControlsOverlay;
