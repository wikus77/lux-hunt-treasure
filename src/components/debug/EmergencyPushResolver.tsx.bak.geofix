// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
// EMERGENCY PUSH PERMISSION RESOLVER - Componente di emergenza
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

export const EmergencyPushResolver = () => {
  const [step, setStep] = useState<number>(1);
  const [browserType, setBrowserType] = useState<string>('');
  const [permissionStatus, setPermissionStatus] = useState<string>('');

  useEffect(() => {
    // Detect browser
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Chrome')) setBrowserType('Chrome');
    else if (userAgent.includes('Firefox')) setBrowserType('Firefox');
    else if (userAgent.includes('Safari')) setBrowserType('Safari');
    else setBrowserType('Unknown');

    // Check permission
    if ('Notification' in window) {
      setPermissionStatus(Notification.permission);
    }
  }, []);

  const testBrowserPermission = async () => {
    try {
      const permission = await Notification.requestPermission();
      setPermissionStatus(permission);
      
      if (permission === 'granted') {
        // Test notification
        new Notification('🚀 SUCCESS M1SSION™', {
          body: 'I permessi push funzionano! Ora puoi usare OneSignal.',
          icon: '/favicon.ico'
        });
        toast.success('✅ RISOLTO! Permessi attivi');
        setStep(5);
      } else {
        setStep(3);
      }
    } catch (error) {
      console.error('Permission test failed:', error);
      setStep(3);
    }
  };

  const resetBrowserSettings = () => {
    toast.info('🔧 Segui le istruzioni per resettare', {
      description: 'Usa le istruzioni specifiche per il tuo browser'
    });
    setStep(4);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <Alert className="border-red-500">
              <AlertDescription>
                <strong>🚨 PROBLEMA IDENTIFICATO:</strong><br/>
                Il browser sta bloccando i permessi push.<br/>
                <strong>Browser:</strong> {browserType}<br/>
                <strong>Permesso attuale:</strong> {permissionStatus}
              </AlertDescription>
            </Alert>
            
            <Button 
              onClick={testBrowserPermission}
              className="w-full bg-red-600 hover:bg-red-700"
              size="lg"
            >
              🔧 STEP 1: TEST PERMESSI BROWSER
            </Button>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <Alert className="border-orange-500">
              <AlertDescription>
                <strong>⚠️ PERMESSI BLOCCATI DAL BROWSER</strong><br/>
                Il browser ha negato i permessi. Devi sbloccarli manualmente.
              </AlertDescription>
            </Alert>
            
            <Button 
              onClick={resetBrowserSettings}
              className="w-full bg-orange-600 hover:bg-orange-700"
              size="lg"
            >
              🔧 STEP 2: ISTRUZIONI SPECIFICHE
            </Button>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <Alert className="border-blue-500">
              <AlertDescription>
                <strong>🛠️ ISTRUZIONI SPECIFICHE PER {browserType.toUpperCase()}:</strong><br/>
                <br/>
                {browserType === 'Chrome' && (
                  <>
                    <strong>CHROME:</strong><br/>
                    1. Clicca sull'icona 🔒 o ℹ️ a sinistra dell'URL<br/>
                    2. Trova "Notifiche" e cambia da "Blocca" a "Consenti"<br/>
                    3. Ricarica questa pagina (F5)<br/>
                    4. Riprova il test permessi<br/>
                  </>
                )}
                {browserType === 'Firefox' && (
                  <>
                    <strong>FIREFOX:</strong><br/>
                    1. Clicca sull'icona 🛡️ a sinistra dell'URL<br/>
                    2. Clicca su "Rimuovi blocco" per le notifiche<br/>
                    3. Ricarica questa pagina (F5)<br/>
                    4. Riprova il test permessi<br/>
                  </>
                )}
                {browserType === 'Safari' && (
                  <>
                    <strong>SAFARI:</strong><br/>
                    1. Safari → Preferenze → Siti web → Notifiche<br/>
                    2. Trova questo sito e imposta "Consenti"<br/>
                    3. Ricarica questa pagina (F5)<br/>
                    4. Riprova il test permessi<br/>
                  </>
                )}
              </AlertDescription>
            </Alert>
            
            <div className="flex gap-2">
              <Button 
                onClick={() => window.location.reload()}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                🔄 RICARICA PAGINA
              </Button>
              <Button 
                onClick={testBrowserPermission}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                🧪 RITEST PERMESSI
              </Button>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <Alert className="border-green-500">
              <AlertDescription>
                <strong>✅ PROBLEMA RISOLTO!</strong><br/>
                I permessi push sono attivi. Ora OneSignal dovrebbe funzionare correttamente.
                Puoi usare il componente "OneSignal v16 COMPLETELY FIXED" qui sotto.
              </AlertDescription>
            </Alert>
            
            <Button 
              onClick={() => {
                toast.success('🎉 M1SSION™ push notifications attive!');
                window.scrollTo(0, 400); // Scroll to OneSignal component
              }}
              className="w-full bg-green-600 hover:bg-green-700"
              size="lg"
            >
              🎯 VAI AL COMPONENTE ONESIGNAL
            </Button>
          </div>
        );

      default:
        return (
          <Button onClick={() => setStep(1)} className="w-full">
            🔄 RICOMINCIA DIAGNOSI
          </Button>
        );
    }
  };

  return (
    <Card className="mb-6 border-red-500/50 bg-red-50/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-400">
          🚨 EMERGENCY PUSH RESOLVER - RISOLUZIONE FORZATA
        </CardTitle>
      </CardHeader>
      <CardContent>
        {renderStep()}
        
        <div className="mt-4 text-xs text-muted-foreground">
          <p><strong>Step corrente:</strong> {step}/5</p>
          <p><strong>Browser:</strong> {browserType}</p>
          <p><strong>Permission:</strong> {permissionStatus}</p>
        </div>
      </CardContent>
    </Card>
  );
};