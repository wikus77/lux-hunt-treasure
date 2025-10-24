/**
 * THE PULSE™ — Accessibility Toggle
 * Toggle per ridurre animazioni, ottimizzato per utenti con esigenze di accessibilità
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Eye } from 'lucide-react';

interface PulseAccessibilityToggleProps {
  onToggle?: (reduced: boolean) => void;
}

export const PulseAccessibilityToggle = ({ onToggle }: PulseAccessibilityToggleProps) => {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    // Check system preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduceMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => {
      setReduceMotion(e.matches);
      onToggle?.(e.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [onToggle]);

  const handleToggle = (checked: boolean) => {
    setReduceMotion(checked);
    onToggle?.(checked);

    // Save preference
    localStorage.setItem('pulse_reduce_motion', checked ? 'true' : 'false');
  };

  return (
    <div className="flex items-center justify-between gap-3 p-3 bg-muted/50 rounded-lg">
      <div className="flex items-center gap-2 flex-1">
        <Eye className="w-4 h-4 text-muted-foreground shrink-0" />
        <div className="min-w-0">
          <Label htmlFor="reduce-motion" className="text-sm font-medium cursor-pointer">
            Riduci animazioni
          </Label>
          <p className="text-xs text-muted-foreground mt-0.5">
            Disabilita effetti visivi intensi
          </p>
        </div>
      </div>
      <Switch
        id="reduce-motion"
        checked={reduceMotion}
        onCheckedChange={handleToggle}
        aria-label="Riduci animazioni Pulse"
      />
    </div>
  );
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
