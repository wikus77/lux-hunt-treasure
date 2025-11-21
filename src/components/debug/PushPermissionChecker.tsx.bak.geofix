// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
// Push Permission Diagnostic and Fix Component
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

export const PushPermissionChecker = () => {
  const [browserPermission, setBrowserPermission] = useState<string>('checking...');
  const [isHttps, setIsHttps] = useState<boolean>(false);
  const [canShowInstructions, setCanShowInstructions] = useState<boolean>(false);
  const [browserInfo, setBrowserInfo] = useState<string>('');

  useEffect(() => {
    checkPermissionStatus();
  }, []);

  const checkPermissionStatus = async () => {
    try {
      // Check HTTPS
      const httpsCheck = window.location.protocol === 'https:' || window.location.hostname === 'localhost';
      setIsHttps(httpsCheck);

      // Check browser support
      const hasNotifications = 'Notification' in window;
      const hasServiceWorker = 'serviceWorker' in navigator;
      
      setBrowserInfo(`Notifications: ${hasNotifications ? '✅' : '❌'}, SW: ${hasServiceWorker ? '✅' : '❌'}, HTTPS: ${httpsCheck ? '✅' : '❌'}`);

      if (!hasNotifications) {
        setBrowserPermission('not-supported');
        return;
      }

      // Check current permission
      const permission = Notification.permission;
      setBrowserPermission(permission);
      console.log('🔔 BROWSER PERMISSION:', permission);

      if (permission === 'denied') {
        setCanShowInstructions(true);
      }

    } catch (error) {
      console.error('❌ Permission check error:', error);
      setBrowserPermission('error');
    }
  };

  const requestBrowserPermission = async () => {
    try {
      console.log('🔔 Requesting browser permission...');
      
      if (!('Notification' in window)) {
        toast.error('❌ Browser non supportato', {
          description: 'Questo browser non supporta le notifiche push'
        });
        return;
      }

      const permission = await Notification.requestPermission();
      console.log('🔔 Browser permission result:', permission);
      setBrowserPermission(permission);

      if (permission === 'granted') {
        toast.success('✅ Permesso concesso!', {
          description: 'Ora puoi ricevere notifiche push'
        });
        setCanShowInstructions(false);
      } else if (permission === 'denied') {
        setCanShowInstructions(true);
        toast.error('❌ Permesso negato', {
          description: 'Segui le istruzioni per abilitare manualmente'
        });
      }

    } catch (error: any) {
      console.error('❌ Browser permission error:', error);
      toast.error('❌ Errore browser', {
        description: error.message
      });
    }
  };

  const testNotification = () => {
    if (Notification.permission === 'granted') {
      new Notification('🔔 Test M1SSION™', {
        body: 'Le notifiche push funzionano!',
        icon: '/favicon.ico'
      });
      toast.success('✅ Notifica test inviata!');
    } else {
      toast.error('❌ Permesso necessario', {
        description: 'Abilita prima i permessi'
      });
    }
  };

  const getPermissionBadge = () => {
    switch (browserPermission) {
      case 'granted':
        return <Badge className="bg-green-600">✅ CONCESSO</Badge>;
      case 'denied':
        return <Badge variant="destructive">❌ NEGATO</Badge>;
      case 'default':
        return <Badge variant="secondary">⚠️ NON RICHIESTO</Badge>;
      case 'not-supported':
        return <Badge variant="destructive">❌ NON SUPPORTATO</Badge>;
      default:
        return <Badge variant="outline">🔄 {browserPermission}</Badge>;
    }
  };

  return (
    <Card className="mb-6 border-orange-500/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🔧 Push Permission Diagnostic
          {getPermissionBadge()}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        <Alert className={browserPermission === 'granted' ? 'border-green-500' : 'border-orange-500'}>
          <AlertDescription>
            <strong>Status Browser:</strong> {browserPermission}<br/>
            <strong>Support:</strong> {browserInfo}<br/>
            <strong>URL:</strong> {window.location.href}
          </AlertDescription>
        </Alert>

        {/* Test Notification Button */}
        {browserPermission === 'granted' && (
          <Button
            onClick={testNotification}
            className="w-full bg-green-600 hover:bg-green-700"
            size="lg"
          >
            🔔 TEST NOTIFICA PUSH
          </Button>
        )}

        {/* Request Permission Button */}
        {(browserPermission === 'default' || browserPermission === 'denied') && (
          <Button
            onClick={requestBrowserPermission}
            className="w-full bg-orange-600 hover:bg-orange-700"
            size="lg"
          >
            🔓 RICHIEDI PERMESSO BROWSER
          </Button>
        )}

        {/* Manual Instructions */}
        {canShowInstructions && (
          <Alert className="border-red-500">
            <AlertDescription>
              <strong>🚨 PERMESSO NEGATO - RISOLUZIONE MANUALE:</strong><br/>
              <br/>
              <strong>Chrome/Edge:</strong><br/>
              1. Clicca sull'icona 🔒 o ℹ️ nella barra URL<br/>
              2. Cambia "Notifiche" da "Blocca" a "Consenti"<br/>
              3. Ricarica la pagina<br/>
              <br/>
              <strong>Firefox:</strong><br/>
              1. Clicca sull'icona 🛡️ nella barra URL<br/>
              2. Rimuovi il blocco notifiche<br/>
              3. Ricarica la pagina<br/>
              <br/>
              <strong>Safari:</strong><br/>
              1. Safari &gt; Preferenze &gt; Siti web &gt; Notifiche<br/>
              2. Trova questo sito e imposta "Consenti"<br/>
              3. Ricarica la pagina
            </AlertDescription>
          </Alert>
        )}

        {/* Success Message */}
        {browserPermission === 'granted' && (
          <Alert className="border-green-500">
            <AlertDescription>
              ✅ <strong>PERFETTO!</strong> Il browser è configurato correttamente per le notifiche push. 
              Ora OneSignal dovrebbe funzionare senza problemi.
            </AlertDescription>
          </Alert>
        )}

        <div className="text-xs text-muted-foreground">
          <p><strong>Refresh Status:</strong> <Button variant="outline" size="sm" onClick={checkPermissionStatus}>🔄 Ricontrolla</Button></p>
        </div>
      </CardContent>
    </Card>
  );
};