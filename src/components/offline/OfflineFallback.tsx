// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Offline Page Component

import React from 'react';
import { Button } from '../ui/button';

export const OfflineFallback: React.FC = () => {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black text-white p-4">
      <div className="max-w-md w-full space-y-6 text-center">
        {/* Offline Icon */}
        <div className="mx-auto w-20 h-20 rounded-full bg-yellow-500/20 flex items-center justify-center">
          <svg className="w-10 h-10 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636L5.636 18.364m0-12.728L18.364 18.364M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z" />
          </svg>
        </div>

        {/* Offline Message */}
        <div className="space-y-3">
          <h1 className="text-2xl font-bold text-yellow-400">Connessione Assente</h1>
          <p className="text-gray-300">
            Non è possibile raggiungere i server M1SSION™. 
            Verifica la tua connessione internet e riprova.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button 
            onClick={handleRetry}
            className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
            size="lg"
          >
            🔄 Riprova
          </Button>
        </div>

        {/* Tips */}
        <div className="text-left bg-gray-800/50 p-4 rounded text-sm text-gray-400 space-y-2">
          <p className="font-semibold text-white">Suggerimenti:</p>
          <ul className="space-y-1 list-disc list-inside">
            <li>Controlla la connessione Wi-Fi o dati mobili</li>
            <li>Disattiva e riattiva la modalità aereo</li>
            <li>Riavvia l'app M1SSION™</li>
          </ul>
        </div>

        {/* Footer */}
        <p className="text-xs text-gray-500 mt-6">
          M1SSION™ • Modalità Offline
        </p>
      </div>
    </div>
  );
};

export default OfflineFallback;