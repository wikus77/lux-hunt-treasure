// M1SSION™ Opera Reset Button - Hard Reset for PWA Issues
// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED

import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export const OperaResetButton: React.FC = () => {
  const handleOperaReset = () => {
    const isOpera = /OPR|Opera/.test(navigator.userAgent);
    const message = isOpera 
      ? 'Rilevato Opera: reindirizzamento alla pagina di reset PWA...'
      : 'Reset PWA disponibile per problemi di caricamento...';
    
    console.log(message);
    window.location.href = '/debug/hard-reset.html?auto=true';
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleOperaReset}
      className="flex items-center gap-2 text-orange-400 border-orange-400/30 hover:bg-orange-400/10"
    >
      <AlertTriangle className="w-4 h-4" />
      Clean SW & Cache (Opera)
    </Button>
  );
};