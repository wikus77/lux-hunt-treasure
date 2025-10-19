import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Box, Map } from 'lucide-react';
import { toast } from 'sonner';

interface PerspectiveToggleProps {
  onChange?: (is3D: boolean) => void;
}

const STORAGE_KEY = 'm1ssion_map_3d_mode';

const PerspectiveToggle = ({ onChange }: PerspectiveToggleProps) => {
  const [is3D, setIs3D] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === 'true';
  });

  useEffect(() => {
    // Apply 3D transform to map container
    const mapContainer = document.querySelector('.leaflet-container');
    if (!mapContainer) return;

    const parent = mapContainer.parentElement;
    if (!parent) return;

    if (is3D) {
      parent.style.perspective = '1200px';
      parent.style.perspectiveOrigin = 'center center';
      (mapContainer as HTMLElement).style.transform = 'rotateX(12deg)';
      (mapContainer as HTMLElement).style.transformStyle = 'preserve-3d';
      toast.success('Modalità 3D attivata (ALPHA)', { duration: 2000 });
    } else {
      parent.style.perspective = '';
      parent.style.perspectiveOrigin = '';
      (mapContainer as HTMLElement).style.transform = '';
      (mapContainer as HTMLElement).style.transformStyle = '';
    }

    // Persist preference
    localStorage.setItem(STORAGE_KEY, is3D.toString());
    
    // Notify parent
    onChange?.(is3D);
  }, [is3D, onChange]);

  const toggle = () => {
    setIs3D((prev) => !prev);
  };

  return (
    <Button
      variant={is3D ? 'default' : 'outline'}
      size="sm"
      onClick={toggle}
      className="living-hud-glass flex items-center gap-2"
      title={is3D ? 'Passa a 2D' : 'Passa a 3D (ALPHA)'}
    >
      {is3D ? (
        <>
          <Box className="w-4 h-4" />
          <span className="text-xs">3D</span>
        </>
      ) : (
        <>
          <Map className="w-4 h-4" />
          <span className="text-xs">2D</span>
        </>
      )}
    </Button>
  );
};

export default PerspectiveToggle;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
