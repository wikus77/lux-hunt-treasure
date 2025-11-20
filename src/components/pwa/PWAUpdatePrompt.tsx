/**
 * © 2025 Joseph MULÉ – M1SSION™ – PWA UPDATE PROMPT
 * Check for updates button + update notification
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, Download } from 'lucide-react';
import { toast } from 'sonner';
import { checkForSWUpdate, activateWaitingSW } from '@/lib/pwa/serviceWorker';
import { APP_BUILD, getAppVersion } from '@/lib/app-version';

export const PWAUpdatePrompt: React.FC = () => {
  const [checking, setChecking] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    // Listen for SW update notifications
    const handleSWUpdate = (event: any) => {
      console.log('[PWAUpdate] Update available:', event.detail);
      setUpdateAvailable(true);
      toast.info('🔄 Aggiornamento app disponibile!', {
        duration: 10000,
        action: {
          label: 'Aggiorna',
          onClick: applyUpdate
        }
      });
    };

    window.addEventListener('sw-update-available', handleSWUpdate);

    return () => {
      window.removeEventListener('sw-update-available', handleSWUpdate);
    };
  }, []);

  const checkForUpdates = async () => {
    setChecking(true);
    try {
      const hasUpdate = await checkForSWUpdate();
      
      if (hasUpdate) {
        setUpdateAvailable(true);
        toast.success('🔄 Aggiornamento trovato!');
      } else {
        toast.success('✅ App già aggiornata');
      }
    } catch (error: any) {
      console.error('[PWAUpdate] Check failed:', error);
      toast.error('❌ Errore verifica aggiornamenti');
    } finally {
      setChecking(false);
    }
  };

  const applyUpdate = async () => {
    try {
      await activateWaitingSW();
      toast.success('✅ Aggiornamento in corso...');
      
      // Reload after a brief delay
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error: any) {
      console.error('[PWAUpdate] Apply failed:', error);
      toast.error('❌ Errore applicazione aggiornamento');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="w-5 h-5" />
          Aggiornamenti App
        </CardTitle>
        <CardDescription>
          Versione corrente: {getAppVersion()}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-sm space-y-1 opacity-70">
          <div>Build: {APP_BUILD.version}</div>
          <div>Environment: {APP_BUILD.env}</div>
          <div>Timestamp: {new Date(APP_BUILD.build).toLocaleString('it-IT')}</div>
        </div>

        <Button
          onClick={checkForUpdates}
          disabled={checking}
          className="w-full"
          variant="outline"
        >
          {checking ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Controllo...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              Cerca Aggiornamenti
            </>
          )}
        </Button>

        {updateAvailable && (
          <Button
            onClick={applyUpdate}
            className="w-full"
            variant="default"
          >
            <Download className="w-4 h-4 mr-2" />
            Installa Aggiornamento
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
