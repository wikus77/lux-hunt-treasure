import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Box, Map } from 'lucide-react';
import { toast } from 'sonner';

interface Map3DToggleProps {
  onChange?: (is3D: boolean) => void;
  disabled?: boolean;
}

const STORAGE_KEY = 'm1_3d';

const Map3DToggle = ({ onChange, disabled = false }: Map3DToggleProps) => {
  const [is3D, setIs3D] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === 'true';
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, is3D.toString());
    onChange?.(is3D);
  }, [is3D, onChange]);

  const toggle = () => {
    if (disabled) {
      toast.warning('3D non disponibile', { 
        description: 'Terrain layer non configurato',
        duration: 2000 
      });
      return;
    }

    const newValue = !is3D;
    setIs3D(newValue);
    
    if (newValue) {
      toast.success('Modalità 3D Terrain attivata', { duration: 2000 });
    } else {
      toast.info('Modalità 2D attivata', { duration: 2000 });
    }
  };

  return (
    <Button
      variant={is3D ? 'default' : 'outline'}
      size="sm"
      onClick={toggle}
      disabled={disabled}
      className="map-dock-button w-11 h-11 p-0"
      title={disabled ? '3D non disponibile' : (is3D ? 'Passa a 2D' : 'Passa a 3D Terrain')}
    >
      {is3D ? (
        <Box className="w-5 h-5" />
      ) : (
        <Map className="w-5 h-5" />
      )}
    </Button>
  );
};

export default Map3DToggle;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
