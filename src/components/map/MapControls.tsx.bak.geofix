
import React from 'react';
import { Button } from '@/components/ui/button';
import { Locate, HelpCircle } from 'lucide-react';

interface MapControlsProps {
  requestLocationPermission: () => void;
  toggleAddingSearchArea: () => void;
  isAddingSearchArea: boolean;
  isAddingMapPoint: boolean;
  setShowHelpDialog: (show: boolean) => void;
}

const MapControls: React.FC<MapControlsProps> = ({
  requestLocationPermission,
  toggleAddingSearchArea,
  isAddingSearchArea,
  isAddingMapPoint,
  setShowHelpDialog
}) => {
  return (
    <>
      {/* Location Button */}
      <div className="absolute top-4 right-16 z-50">
        <Button
          onClick={requestLocationPermission}
          size="sm"
          className="h-10 w-10 rounded-full bg-black/70 border border-cyan-500/30 hover:bg-black/90 hover:border-cyan-500/60 p-0"
        >
          <Locate className="h-4 w-4 text-cyan-400" />
        </Button>
      </div>

      {/* Help Button */}
      <div className="absolute bottom-4 left-4 z-50">
        <Button
          onClick={() => setShowHelpDialog(true)}
          size="sm"
          className="h-10 w-10 rounded-full bg-black/70 border border-cyan-500/30 hover:bg-black/90 hover:border-cyan-500/60 p-0"
        >
          <HelpCircle className="h-4 w-4 text-cyan-400" />
        </Button>
      </div>

      {/* Instructions Overlay */}
      {(isAddingMapPoint || isAddingSearchArea) && (
        <div className="absolute top-16 left-0 right-0 z-50 flex justify-center pointer-events-none">
          <div className="bg-black/80 text-white px-4 py-2 rounded-lg shadow-lg border border-white/10 backdrop-blur-md">
            {isAddingMapPoint && (
              <p className="text-sm">
                <span className="text-cyan-400 font-medium">Clicca sulla mappa</span> per aggiungere un punto di interesse
              </p>
            )}
            
            {isAddingSearchArea && (
              <p className="text-sm">
                <span className="text-cyan-400 font-medium">Clicca sulla mappa</span> per creare un'area di ricerca
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default MapControls;
