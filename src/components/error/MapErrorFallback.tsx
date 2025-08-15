// © 2025 M1SSION™ – Joseph MULÉ – NIYVORA KFT

import React from 'react';
import { Button } from '@/components/ui/button';

export const MapErrorFallback: React.FC = () => {
  return (
    <div className="min-h-[400px] flex items-center justify-center bg-black/40 rounded-lg border border-primary/20">
      <div className="text-center p-6">
        <div className="text-4xl mb-4">🗺️</div>
        <h3 className="text-xl font-bold text-white mb-2">Errore Mappa</h3>
        <p className="text-white/70 mb-4">
          Si è verificato un errore nel caricamento della mappa.
        </p>
        <Button 
          onClick={() => window.location.reload()}
          className="bg-gradient-to-r from-m1ssion-blue to-m1ssion-pink"
        >
          Ricarica Mappa
        </Button>
      </div>
    </div>
  );
};