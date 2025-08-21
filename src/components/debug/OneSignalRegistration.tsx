// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
// COMPLETAMENTE NUOVO - OneSignal v16 Registration Component - SOSTITUISCE IL VECCHIO
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';

export const OneSignalRegistration = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('Initializing...');
  const { user } = useUnifiedAuth();

  useEffect(() => {
    const initOneSignalV16 = async () => {
      try {
        console.log('🔔 V16 INIT: Starting OneSignal v16 initialization...');
        setDebugInfo('Checking OneSignal v16...');

        // Wait for OneSignal to be available
        let attempts = 0;
        while (!(window as any).OneSignal && attempts < 10) {
          console.log(`🔔 V16 INIT: Waiting for OneSignal... attempt ${attempts + 1}`);
          await new Promise(resolve => setTimeout(resolve, 500));
          attempts++;
        }

        if (!(window as any).OneSignal) {
          console.error('❌ V16 INIT: OneSignal SDK not loaded after 5 seconds');
          setDebugInfo('❌ OneSignal SDK not loaded');
          return;
        }

        console.log('✅ V16 INIT: OneSignal SDK detected');
        setDebugInfo('OneSignal SDK loaded, initializing...');

        // Initialize with v16 syntax
        await (window as any).OneSignal.init({
          appId: "50cb75f7-f065-4626-9a63-ce5692fa7e70",
          allowLocalhostAsSecureOrigin: true
        });

        console.log('✅ V16 INIT: OneSignal initialized');
        setDebugInfo('✅ OneSignal v16 initialized');

        // Check current permission status
        await checkPermissionStatus();

      } catch (error) {
        console.error('❌ V16 INIT ERROR:', error);
        setDebugInfo(`❌ Init error: ${error}`);
      }
    };

    const checkPermissionStatus = async () => {
      try {
        // Use v16 API to check permission
        const permission = await (window as any).OneSignal.Notifications.permission;
        console.log('🔔 V16 CHECK: Current permission:', permission);
        
        if (permission === 'granted') {
          setIsRegistered(true);
          setDebugInfo('✅ Already registered');
          
          // Try to get player ID
          try {
            const id = await (window as any).OneSignal.User.PushSubscription.id;
            if (id) {
              setPlayerId(id);
              console.log('✅ V16 CHECK: Player ID found:', id);
            }
          } catch (e) {
            console.log('⚠️ V16 CHECK: Could not get player ID:', e);
          }
        } else {
          setDebugInfo(`Permission: ${permission}`);
        }
      } catch (error) {
        console.error('❌ V16 CHECK ERROR:', error);
        setDebugInfo(`❌ Check error: ${error}`);
      }
    };

    initOneSignalV16();
  }, []);

  const registerForNotifications = async () => {
    console.log('🔔 V16 REGISTER: Starting registration...');
    setIsRegistering(true);
    setDebugInfo('Requesting permission...');

    // CRITICAL: Timeout per evitare blocchi infiniti
    const timeoutId = setTimeout(() => {
      console.log('⏰ TIMEOUT: Registration taking too long, resetting...');
      setIsRegistering(false);
      setDebugInfo('❌ Timeout - Registration took too long');
      toast.error('❌ Timeout', {
        description: 'La registrazione ha impiegato troppo tempo'
      });
    }, 10000); // 10 secondi timeout

    try {
      // Check if OneSignal is available
      if (!(window as any).OneSignal) {
        throw new Error('OneSignal not available');
      }

      console.log('🔔 V16 REGISTER: Requesting permission...');
      
      // Prova approccio alternativo con wrapper
      let hasPermission = false;
      
      try {
        // Tentativo 1: API v16 standard
        console.log('🔔 Attempt 1: Standard v16 API...');
        setDebugInfo('Attempt 1: Standard v16 API...');
        hasPermission = await Promise.race([
          (window as any).OneSignal.Notifications.requestPermission(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('API timeout')), 5000))
        ]);
        console.log('✅ Standard API result:', hasPermission);
      } catch (apiError) {
        console.log('⚠️ Standard API failed, trying alternative...', apiError);
        
        // Tentativo 2: Approccio alternativo
        try {
          console.log('🔔 Attempt 2: Alternative approach...');
          setDebugInfo('Attempt 2: Alternative approach...');
          
          // Controlla permesso corrente
          const currentPermission = await (window as any).OneSignal.Notifications.permission;
          console.log('Current permission:', currentPermission);
          
          if (currentPermission === 'default') {
            // Forza la richiesta usando l'API browser nativa
            const browserPermission = await Notification.requestPermission();
            hasPermission = browserPermission === 'granted';
            console.log('Browser native permission:', browserPermission);
          } else {
            hasPermission = currentPermission === 'granted';
          }
        } catch (altError) {
          console.log('⚠️ Alternative approach failed:', altError);
          
          // Tentativo 3: Fallback completo
          console.log('🔔 Attempt 3: Complete fallback...');
          setDebugInfo('Attempt 3: Complete fallback...');
          
          if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            hasPermission = permission === 'granted';
          }
        }
      }

      console.log('🔔 Final permission result:', hasPermission);

      if (hasPermission) {
        setDebugInfo('Permission granted, getting ID...');
        
        // Wait a moment for OneSignal to process
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Get player ID con timeout
        try {
          const id = await Promise.race([
            (window as any).OneSignal.User.PushSubscription.id,
            new Promise((_, reject) => setTimeout(() => reject(new Error('ID timeout')), 3000))
          ]);
          
          console.log('🔔 V16 REGISTER: Player ID:', id);

          if (id) {
            setPlayerId(id);
            setIsRegistered(true);
            setDebugInfo('✅ Registration successful!');
            
            toast.success('✅ Registrato con successo!', {
              description: `ID: ${id.substring(0, 12)}...`
            });
          } else {
            throw new Error('No player ID received');
          }
        } catch (idError) {
          console.log('⚠️ Could not get player ID:', idError);
          // Considera comunque successo se il permesso è stato dato
          setIsRegistered(true);
          setDebugInfo('✅ Permission granted (ID pending)');
          toast.success('✅ Permesso concesso!', {
            description: 'Player ID sarà disponibile a breve'
          });
        }
      } else {
        throw new Error('Permission denied');
      }

    } catch (error: any) {
      console.error('❌ V16 REGISTER ERROR:', error);
      setDebugInfo(`❌ Registration failed: ${error.message}`);
      
      toast.error('❌ Registrazione fallita', {
        description: error.message
      });
    } finally {
      clearTimeout(timeoutId); // Cancella timeout
      console.log('🔔 V16 REGISTER: Resetting isRegistering to false');
      setIsRegistering(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🆕 OneSignal v16 COMPLETELY FIXED
          <Badge variant={isRegistered ? 'default' : 'secondary'}>
            {isRegistered ? 'REGISTRATO' : 'NON REGISTRATO'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertDescription>
            <strong>Debug:</strong> {debugInfo}
          </AlertDescription>
        </Alert>

        {!isRegistered && (
          <Button
            onClick={registerForNotifications}
            disabled={isRegistering}
            className="w-full bg-blue-600 hover:bg-blue-700"
            size="lg"
          >
            {isRegistering ? '🔄 Registrando...' : '🔔 REGISTRATI NUOVO V16'}
          </Button>
        )}

        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>Stato:</strong> {isRegistered ? '✅ Registrato' : '❌ Non registrato'}</p>
          <p><strong>Debug Info:</strong> {debugInfo}</p>
          <p><strong>OneSignal SDK:</strong> {typeof (window as any).OneSignal !== 'undefined' ? '✅ Loaded' : '❌ Not Loaded'}</p>
          <p><strong>Is Registering:</strong> {isRegistering ? '🔄 TRUE' : '✅ FALSE'}</p>
          {playerId && <p><strong>Player ID:</strong> {playerId}</p>}
          <p><strong>User ID:</strong> {user?.id || 'Non autenticato'}</p>
        </div>
      </CardContent>
    </Card>
  );
};