// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
// DETAILED BROWSER PERMISSION CHECKER
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

export const DetailedPermissionChecker = () => {
  const [browserInfo, setBrowserInfo] = useState<any>({});
  const [permissionState, setPermissionState] = useState<string>('checking...');
  const [hasOneSignal, setHasOneSignal] = useState<boolean>(false);

  useEffect(() => {
    runDetailedCheck();
  }, []);

  const runDetailedCheck = async () => {
    const info: any = {};
    
    // 1. Browser Detection
    const ua = navigator.userAgent;
    if (ua.includes('Chrome')) info.browser = 'Chrome';
    else if (ua.includes('Firefox')) info.browser = 'Firefox';
    else if (ua.includes('Safari')) info.browser = 'Safari';
    else info.browser = 'Unknown';
    
    // 2. URL and Protocol
    info.url = window.location.href;
    info.protocol = window.location.protocol;
    info.isHTTPS = window.location.protocol === 'https:';
    info.isLocalhost = window.location.hostname === 'localhost';
    
    // 3. Browser Support
    info.hasNotifications = 'Notification' in window;
    info.hasServiceWorker = 'serviceWorker' in navigator;
    
    // 4. Permission Status
    if (info.hasNotifications) {
      info.permission = Notification.permission;
      setPermissionState(Notification.permission);
    } else {
      info.permission = 'not-supported';
      setPermissionState('not-supported');
    }
    
    // 5. OneSignal Check
    info.hasOneSignalGlobal = typeof (window as any).OneSignal !== 'undefined';
    info.oneSignalType = typeof (window as any).OneSignal;
    setHasOneSignal(info.hasOneSignalGlobal);
    
    // 6. Previous permissions attempts
    info.canRequestPermission = info.permission === 'default' || info.permission === 'denied';
    
    setBrowserInfo(info);
    
    console.log('🔍 DETAILED CHECK RESULTS:', info);
  };

  const forcePermissionRequest = async () => {
    try {
      console.log('🔔 FORCING permission request...');
      
      if (!browserInfo.hasNotifications) {
        toast.error('❌ Browser non supportato');
        return;
      }
      
      // Direct browser API call
      const result = await Notification.requestPermission();
      console.log('🔔 Browser permission result:', result);
      
      setPermissionState(result);
      
      if (result === 'granted') {
        // Test immediate notification
        const testNotif = new Notification('🎉 M1SSION™ Success!', {
          body: 'I permessi push funzionano correttamente!',
          icon: '/favicon.ico',
          tag: 'test-notification'
        });
        
        setTimeout(() => testNotif.close(), 3000);
        
        toast.success('✅ PERMESSI ATTIVI!', {
          description: 'Ora OneSignal può registrarti'
        });
        
        // Update info
        runDetailedCheck();
      } else {
        toast.error('❌ Permesso negato', {
          description: 'Devi sbloccare manualmente nel browser'
        });
      }
      
    } catch (error: any) {
      console.error('❌ Permission request failed:', error);
      toast.error('❌ Errore permessi', {
        description: error.message
      });
    }
  };

  const getInstructions = () => {
    switch (browserInfo.browser) {
      case 'Chrome':
        return {
          icon: '🔒',
          steps: [
            'Clicca sull\'icona 🔒 o ℹ️ a sinistra dell\'URL',
            'Trova "Notifiche" nella lista',
            'Cambia da "Blocca" a "Consenti"',
            'Ricarica la pagina (F5)',
            'Clicca "FORZA PERMESSI" qui sotto'
          ]
        };
      case 'Firefox':
        return {
          icon: '🛡️',
          steps: [
            'Clicca sull\'icona 🛡️ a sinistra dell\'URL',
            'Cerca la sezione "Autorizzazioni"',
            'Trova "Notifiche" e rimuovi il blocco',
            'Ricarica la pagina (F5)',
            'Clicca "FORZA PERMESSI" qui sotto'
          ]
        };
      case 'Safari':
        return {
          icon: '⚙️',
          steps: [
            'Safari → Preferenze → Siti web',
            'Seleziona "Notifiche" nella lista a sinistra',
            'Trova questo sito e imposta "Consenti"',
            'Ricarica la pagina (F5)',
            'Clicca "FORZA PERMESSI" qui sotto'
          ]
        };
      default:
        return {
          icon: '❓',
          steps: ['Browser non riconosciuto. Controlla le impostazioni del sito.']
        };
    }
  };

  const instructions = getInstructions();

  return (
    <Card className="mb-6 border-purple-500/50">
      <CardHeader>
        <CardTitle className="text-purple-400">
          🔍 DETAILED PERMISSION CHECKER - DIAGNOSI COMPLETA
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* Current Status */}
        <Alert className={permissionState === 'granted' ? 'border-green-500' : 'border-red-500'}>
          <AlertDescription>
            <strong>STATO ATTUALE:</strong> {permissionState === 'granted' ? '✅ PERMESSI ATTIVI' : '❌ PERMESSI BLOCCATI'}
          </AlertDescription>
        </Alert>

        {/* Detailed Info */}
        <div className="bg-gray-800 p-4 rounded text-sm space-y-1">
          <p><strong>Browser:</strong> {browserInfo.browser}</p>
          <p><strong>URL:</strong> {browserInfo.url}</p>
          <p><strong>HTTPS:</strong> {browserInfo.isHTTPS ? '✅' : '❌'}</p>
          <p><strong>Supporto Notifiche:</strong> {browserInfo.hasNotifications ? '✅' : '❌'}</p>
          <p><strong>Service Worker:</strong> {browserInfo.hasServiceWorker ? '✅' : '❌'}</p>
          <p><strong>OneSignal SDK:</strong> {hasOneSignal ? '✅' : '❌'}</p>
          <p><strong>Permesso Browser:</strong> {permissionState}</p>
        </div>

        {/* Action Button */}
        {permissionState !== 'granted' && (
          <Button
            onClick={forcePermissionRequest}
            className="w-full bg-purple-600 hover:bg-purple-700"
            size="lg"
          >
            🚀 FORZA PERMESSI BROWSER
          </Button>
        )}

        {/* Instructions */}
        {permissionState === 'denied' && (
          <Alert className="border-orange-500">
            <AlertDescription>
              <strong>🛠️ ISTRUZIONI PER {browserInfo.browser?.toUpperCase()}:</strong><br/>
              {instructions.steps.map((step, index) => (
                <span key={index}>
                  {index + 1}. {step}<br/>
                </span>
              ))}
            </AlertDescription>
          </Alert>
        )}

        {/* Success */}
        {permissionState === 'granted' && (
          <Alert className="border-green-500">
            <AlertDescription>
              <strong>🎉 PERFETTO!</strong> I permessi sono attivi. 
              Ora vai al componente "OneSignal v16 COMPLETELY FIXED" e prova la registrazione.
            </AlertDescription>
          </Alert>
        )}

        <Button 
          onClick={runDetailedCheck}
          variant="outline"
          className="w-full"
        >
          🔄 AGGIORNA DIAGNOSI
        </Button>
      </CardContent>
    </Card>
  );
};