
// M1SSION™ - Safe Area Debug Toggle
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';
import { detectCapacitorEnvironment } from '@/utils/iosCapacitorFunctions';

interface SafeAreaToggleProps {
  children: React.ReactNode;
  onToggle?: (visible: boolean) => void;
  initialVisible?: boolean;
}

export const SafeAreaToggle: React.FC<SafeAreaToggleProps> = ({
  children,
  onToggle,
  initialVisible = false
}) => {
  const [visible, setVisible] = useState(initialVisible);
  const isCapacitor = detectCapacitorEnvironment();

  const handleToggle = () => {
    const newVisible = !visible;
    setVisible(newVisible);
    onToggle?.(newVisible);
  };

  return (
    <>
      {children}
      
      {/* Only show toggle in Capacitor environment */}
      {isCapacitor && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleToggle}
          className="fixed top-4 right-4 z-[9999] bg-black/80 text-white border-white/20"
        >
          {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          <span className="ml-2 text-xs">
            {visible ? 'Hide' : 'Show'} Safe Area
          </span>
        </Button>
      )}
    </>
  );
};
