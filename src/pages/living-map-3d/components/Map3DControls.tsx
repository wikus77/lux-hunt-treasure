/**
 * Map 3D Controls - Zoom, Reset, Locate, Bearing, 3D Toggle
 */
import React from 'react';
import { Button } from '@/components/ui/button';
import { Box, Map, Crosshair, RotateCcw, Compass } from 'lucide-react';
import { toast } from 'sonner';

interface Map3DControlsProps {
  is3D: boolean;
  onToggle3D: () => void;
  onFocusLocation: () => void;
  onResetView: () => void;
  onResetBearing: () => void;
}

const Map3DControls: React.FC<Map3DControlsProps> = ({
  is3D,
  onToggle3D,
  onFocusLocation,
  onResetView,
  onResetBearing
}) => {
  const handleToggle3D = () => {
    onToggle3D();
    if (!is3D) {
      toast.success('Modalità 3D Terrain attivata', { duration: 2000 });
    } else {
      toast.info('Modalità 2D attivata', { duration: 2000 });
    }
  };

  return (
    <div className="living-map-controls">
      {/* 3D Toggle */}
      <Button
        variant={is3D ? 'default' : 'outline'}
        size="sm"
        onClick={handleToggle3D}
        className="living-map-control-button"
        title={is3D ? 'Passa a 2D' : 'Passa a 3D Terrain'}
      >
        {is3D ? (
          <Box className="w-5 h-5" />
        ) : (
          <Map className="w-5 h-5" />
        )}
      </Button>

      {/* Focus Location */}
      <Button
        variant="outline"
        size="sm"
        onClick={onFocusLocation}
        className="living-map-control-button"
        title="Centra su posizione"
      >
        <Crosshair className="w-5 h-5" />
      </Button>

      {/* Reset View */}
      <Button
        variant="outline"
        size="sm"
        onClick={onResetView}
        className="living-map-control-button"
        title="Reset vista"
      >
        <RotateCcw className="w-5 h-5" />
      </Button>

      {/* Reset Bearing */}
      <Button
        variant="outline"
        size="sm"
        onClick={onResetBearing}
        className="living-map-control-button"
        title="Reset orientamento"
      >
        <Compass className="w-5 h-5" />
      </Button>
    </div>
  );
};

export default Map3DControls;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
