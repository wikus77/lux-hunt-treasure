// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Service Worker Update Banner Component

import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { listenSWUpdates, applyUpdate } from '@/lib/sw/updateBanner';

export const UpdateBanner: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    listenSWUpdates({
      onUpdateAvailable: () => {
        console.log('[UpdateBanner] Update available, showing banner');
        setShowBanner(true);
      },
      autoReload: false, // Manual user action required
    });
  }, []);

  if (!showBanner) return null;

  const handleUpdate = () => {
    console.log('[UpdateBanner] User triggered update');
    applyUpdate();
  };

  const handleDismiss = () => {
    console.log('[UpdateBanner] User dismissed banner');
    setShowBanner(false);
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-[9999] animate-in slide-in-from-bottom-5">
      <div className="bg-gradient-to-r from-[#4361ee] to-[#7209b7] rounded-xl shadow-2xl border border-white/20 p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
            <RefreshCw className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-white text-sm">
              Nuova versione disponibile
            </h3>
            <p className="text-white/80 text-xs mt-1">
              Un aggiornamento è pronto. Aggiorna ora per le ultime funzionalità.
            </p>
            <div className="flex gap-2 mt-3">
              <Button
                onClick={handleUpdate}
                size="sm"
                className="bg-white text-[#4361ee] hover:bg-white/90 font-semibold"
              >
                Aggiorna
              </Button>
              <Button
                onClick={handleDismiss}
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/20"
              >
                Dopo
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
