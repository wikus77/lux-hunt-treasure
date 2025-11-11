
// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import React from 'react';
import { Button } from '@/components/ui/button';
import { RotateCw } from 'lucide-react';
import { toast } from 'sonner';
import LocationButton from './LocationButton';
import SearchAreaButton from './SearchAreaButton';
import BuzzMapButtonSecure from '@/components/map/BuzzMapButtonSecure';
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
  onRefresh?: () => void;
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
  onRefresh,
  onAreaGenerated
}) => {
  const handleRefreshClick = () => {
    if (onRefresh) {
      onRefresh();
      toast.success('🔄 Mappa aggiornata');
    }
  };
  return (
    <>
      {/* Use the LocationButton component */}
      <LocationButton requestLocationPermission={requestLocationPermission} />

      {/* Use the SearchAreaButton component */}
      <SearchAreaButton 
        toggleAddingSearchArea={toggleAddingSearchArea} 
        isAddingSearchArea={isAddingSearchArea} 
      />

      {/* Refresh Button - Reload Neon 3D Style */}
      {onRefresh && (
        <div className="absolute top-4 right-32 z-50">
          <Button
            onClick={handleRefreshClick}
            size="sm"
            className="h-10 w-10 rounded-full bg-black/70 border border-cyan-500/30 hover:bg-black/90 hover:border-cyan-500/60 p-0"
            title="Aggiorna Mappa"
          >
            <RotateCw className="h-4 w-4 text-cyan-400" />
          </Button>
        </div>
      )}

{/* M1SSION™ SECURE: Use BuzzMapButtonSecure component that ALWAYS requires payment */}
      <BuzzMapButtonSecure 
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
