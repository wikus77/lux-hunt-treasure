import { Button } from '@/components/ui/button';
import { Crosshair, RotateCcw, Zap } from 'lucide-react';
import Map3DToggle from './Map3DToggle';


interface MapDockProps {
  onToggle3D?: (is3D: boolean) => void;
  is3DEnabled?: boolean;
  onFocus?: () => void;
  onReset?: () => void;
  onBuzz?: () => void;
  onLayerChange?: (layerId: string, enabled: boolean) => void;
  terrain3DAvailable?: boolean;
}

const MapDock = ({
  onToggle3D,
  is3DEnabled = false,
  onFocus,
  onReset,
  onBuzz,
  onLayerChange,
  terrain3DAvailable = false
}: MapDockProps) => {
  return (
    <div className="map-dock">
      {/* 3D Toggle */}
      <Map3DToggle 
        onChange={(is3D) => {
          if (onToggle3D) onToggle3D(is3D);
        }}
        disabled={!terrain3DAvailable}
      />


      {/* Focus (GPS Center) */}
      <Button
        variant="outline"
        size="sm"
        onClick={onFocus}
        className="map-dock-button w-11 h-11 p-0"
        title="Centra su posizione"
      >
        <Crosshair className="w-5 h-5" />
      </Button>

      {/* Reset (Fit Bounds) */}
      <Button
        variant="outline"
        size="sm"
        onClick={onReset}
        className="map-dock-button w-11 h-11 p-0"
        title="Reset vista"
      >
        <RotateCcw className="w-5 h-5" />
      </Button>

      {/* P0 FIX: REMOVED - BUZZ solo in BuzzMapButtonSecure centrale */}
      {/* <Button
        variant="default"
        size="sm"
        onClick={onBuzz}
        className="map-dock-button map-dock-buzz w-11 h-11 p-0"
        title="Attiva BUZZ"
      >
        <Zap className="w-5 h-5" />
      </Button> */}
    </div>
  );
};

export default MapDock;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
