// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
// COMPLETAMENTE NUOVO - OneSignal v16 Registration Component
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';

export const OneSignalRegistrationFixed = () => {
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

    try {
      // Check if OneSignal is available
      if (!(window as any).OneSignal) {
        throw new Error('OneSignal not available');
      }

      console.log('🔔 V16 REGISTER: Requesting permission...');
      
      // Request permission with v16 API
      const hasPermission = await (window as any).OneSignal.Notifications.requestPermission();
      console.log('🔔 V16 REGISTER: Permission result:', hasPermission);

      if (hasPermission) {
        setDebugInfo('Permission granted, getting ID...');
        
        // Wait a moment for OneSignal to process
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Get player ID
        const id = await (window as any).OneSignal.User.PushSubscription.id;
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
      console.log('🔔 V16 REGISTER: Resetting isRegistering to false');
      setIsRegistering(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🆕 OneSignal v16 FIXED Registration
          <Badge variant={isRegistered ? 'default' : 'secondary'}>
            {isRegistered ? 'REGISTRATO' : 'NON REGISTRATO'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertDescription>
            {debugInfo}
          </AlertDescription>
        </Alert>

        {!isRegistered && (
          <Button
            onClick={registerForNotifications}
            disabled={isRegistering}
            className="w-full"
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