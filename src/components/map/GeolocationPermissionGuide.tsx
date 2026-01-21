// © 2025 M1SSION™ – NIYVORA KFT – Joseph MULÉ

import React from 'react';
import { AlertTriangle, Settings, Smartphone, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { openAppSettings, isNativeApp } from '@/lib/native-settings';

interface GeolocationPermissionGuideProps {
  isIOS?: boolean;
  isPWA?: boolean;
  onRetry?: () => void;
}

export const GeolocationPermissionGuide: React.FC<GeolocationPermissionGuideProps> = ({
  isIOS = false,
  isPWA = false,
  onRetry
}) => {
  const openSettings = async () => {
    // M1SSION™ WRAP FIX: Use native bridge in Capacitor apps
    if (isNativeApp()) {
      const opened = await openAppSettings();
      if (opened) return; // Successfully opened native settings
    }
    
    // Fallback for PWA/web
    if (isIOS) {
      // iOS PWA/Safari - guide user manually
      alert('Apri Impostazioni > Privacy e Sicurezza > Localizzazione');
    } else {
      // For other browsers, guide user to browser settings
      alert('Apri le impostazioni del browser e abilita la geolocalizzazione per questo sito');
    }
  };

  return (
    <Card className="glass-card bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-red-500/10 border-amber-500/30 p-6 m-4">
      <div className="text-center space-y-4">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500/30 to-red-500/30 flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.4)]">
            <AlertTriangle className="w-8 h-8 text-amber-400" />
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-white">
          Geolocalizzazione Bloccata
        </h3>

        {/* Description */}
        <p className="text-gray-300 text-sm leading-relaxed">
          {isIOS && isPWA ? (
            <>
              La geolocalizzazione è stata bloccata per questa app. 
              Per utilizzare le funzioni di mappa e localizzazione, 
              devi abilitarla manualmente nelle impostazioni.
            </>
          ) : (
            <>
              La geolocalizzazione è bloccata per questo sito. 
              Abilita l'accesso alla posizione nelle impostazioni del browser.
            </>
          )}
        </p>

        {/* Instructions */}
        <div className="bg-gradient-to-r from-[#00D1FF]/10 to-[#FF1493]/10 rounded-lg p-4 border border-[#00D1FF]/20">
          <div className="flex items-start gap-3 text-left">
            <Settings className="w-5 h-5 text-[#00D1FF] mt-0.5 flex-shrink-0" />
            <div className="text-sm text-gray-300 space-y-2">
              {isIOS ? (
                <>
                  <p className="font-medium text-white">Istruzioni per iOS:</p>
                  <ol className="list-decimal list-inside space-y-1 text-xs">
                    <li>Apri l'app <strong>Impostazioni</strong></li>
                    <li>Vai su <strong>Privacy e Sicurezza</strong></li>
                    <li>Seleziona <strong>Localizzazione</strong></li>
                    <li>Assicurati che "Servizi di localizzazione" sia <strong>attivo</strong></li>
                    <li>Scorri fino a <strong>Safari</strong> e selezionalo</li>
                    <li>Scegli <strong>"Durante l'uso dell'app"</strong></li>
                    {isPWA && (
                      <li>Riavvia l'app M1SSION™ dal tuo schermo home</li>
                    )}
                  </ol>
                </>
              ) : (
                <>
                  <p className="font-medium text-white">Istruzioni per il browser:</p>
                  <ol className="list-decimal list-inside space-y-1 text-xs">
                    <li>Clicca sull'icona del <strong>lucchetto</strong> nella barra degli indirizzi</li>
                    <li>Seleziona <strong>"Autorizzazioni del sito"</strong></li>
                    <li>Cambia "Posizione" da <strong>"Blocca"</strong> a <strong>"Consenti"</strong></li>
                    <li>Ricarica la pagina</li>
                  </ol>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={openSettings}
            className="flex-1 border-amber-500/50 text-amber-400 hover:bg-amber-500/10"
          >
            <Settings className="w-4 h-4 mr-2" />
            Apri Impostazioni
          </Button>
          
          {onRetry && (
            <Button
              onClick={onRetry}
              className="flex-1 bg-gradient-to-r from-[#00D1FF] to-[#FF1493] text-white font-medium hover:shadow-[0_0_20px_rgba(0,209,255,0.4)]"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Riprova
            </Button>
          )}
        </div>

        {/* Additional Help */}
        <div className="text-xs text-gray-500 space-y-1">
          <p>💡 <strong>Suggerimento:</strong> Dopo aver modificato le impostazioni, 
            {isPWA ? ' riavvia l\'app' : ' ricarica la pagina'} per applicare le modifiche.
          </p>
          {isIOS && (
            <p>📱 Su iOS, potresti dover chiudere completamente Safari e riaprirlo.</p>
          )}
        </div>
      </div>
    </Card>
  );
};

export default GeolocationPermissionGuide;