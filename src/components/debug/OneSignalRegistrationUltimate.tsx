// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
// ULTIMATE ONESIGNAL REGISTRATION - Single Point of Truth
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { supabase } from '@/integrations/supabase/client';

// Global state to prevent multiple initializations
declare global {
  interface Window {
    OneSignalUltimateState?: {
      isInitialized: boolean;
      isInitializing: boolean;
      playerId?: string;
    };
  }
}

export const OneSignalRegistrationUltimate = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('Starting ultimate registration...');
  const { user } = useUnifiedAuth();

  useEffect(() => {
    initializeUltimate();
  }, []);

  const initializeUltimate = async () => {
    try {
      console.log('🚀 ULTIMATE: Starting OneSignal ultimate initialization...');
      setDebugInfo('🚀 Initializing ultimate OneSignal...');

      // Check if already initialized globally
      if (window.OneSignalUltimateState?.isInitialized) {
        console.log('✅ ULTIMATE: Already initialized');
        await checkExistingRegistration();
        return;
      }

      // Initialize global state
      window.OneSignalUltimateState = {
        isInitialized: false,
        isInitializing: true
      };

      // Wait for OneSignal SDK to be loaded
      let attempts = 0;
      while (!(window as any).OneSignal && attempts < 20) {
        console.log(`🔄 ULTIMATE: Waiting for OneSignal SDK... attempt ${attempts + 1}`);
        await new Promise(resolve => setTimeout(resolve, 500));
        attempts++;
      }

      if (!(window as any).OneSignal) {
        throw new Error('OneSignal SDK not loaded after 10 seconds');
      }

      console.log('✅ ULTIMATE: OneSignal SDK detected');
      setDebugInfo('✅ SDK loaded, initializing...');

      // Check if OneSignal is already initialized
      try {
        const permission = await (window as any).OneSignal.Notifications.permission;
        console.log('✅ ULTIMATE: OneSignal already initialized, permission:', permission);
        window.OneSignalUltimateState.isInitialized = true;
        window.OneSignalUltimateState.isInitializing = false;
        await checkExistingRegistration();
        return;
      } catch (error) {
        console.log('🔄 ULTIMATE: OneSignal not initialized yet, proceeding...');
      }

      // Initialize OneSignal ONLY if not already done
      console.log('🔄 ULTIMATE: Initializing OneSignal...');
      await (window as any).OneSignal.init({
        appId: "50cb75f7-f065-4626-9a63-ce5692fa7e70",
        allowLocalhostAsSecureOrigin: true
      });

      console.log('✅ ULTIMATE: OneSignal initialized successfully');
      window.OneSignalUltimateState.isInitialized = true;
      window.OneSignalUltimateState.isInitializing = false;
      
      setDebugInfo('✅ OneSignal initialized');
      await checkExistingRegistration();

    } catch (error: any) {
      console.error('❌ ULTIMATE: Initialization failed:', error);
      setDebugInfo(`❌ Init failed: ${error.message}`);
      
      if (window.OneSignalUltimateState) {
        window.OneSignalUltimateState.isInitializing = false;
      }
    }
  };

  const checkExistingRegistration = async () => {
    try {
      if (!(window as any).OneSignal) return;

      const permission = await (window as any).OneSignal.Notifications.permission;
      console.log('🔍 ULTIMATE: Checking permission:', permission);

      if (permission === 'granted') {
        const id = await (window as any).OneSignal.User.PushSubscription.id;
        console.log('🔍 ULTIMATE: Player ID:', id);

        if (id) {
          setPlayerId(id);
          setIsRegistered(true);
          setDebugInfo('✅ Already registered and working');
          
          if (window.OneSignalUltimateState) {
            window.OneSignalUltimateState.playerId = id;
          }
        } else {
          setDebugInfo('⚠️ Permission granted but no Player ID');
        }
      } else {
        setDebugInfo(`🔍 Permission: ${permission}`);
      }
    } catch (error: any) {
      console.error('❌ ULTIMATE: Check failed:', error);
      setDebugInfo(`❌ Check failed: ${error.message}`);
    }
  };

  const registerUltimate = async () => {
    console.log('🚀 ULTIMATE: Starting registration process...');
    setIsRegistering(true);
    setDebugInfo('🚀 Requesting permission...');

    try {
      if (!(window as any).OneSignal) {
        throw new Error('OneSignal not available');
      }

      if (!window.OneSignalUltimateState?.isInitialized) {
        throw new Error('OneSignal not properly initialized');
      }

      // Check current permission first
      const currentPermission = await (window as any).OneSignal.Notifications.permission;
      console.log('🔍 ULTIMATE: Current permission before request:', currentPermission);

      if (currentPermission === 'granted') {
        console.log('✅ ULTIMATE: Permission already granted, getting ID...');
        const id = await (window as any).OneSignal.User.PushSubscription.id;
        
        if (id) {
          setPlayerId(id);
          setIsRegistered(true);
          setDebugInfo('✅ Already had permission, registered successfully');
          await saveToDatabase(id);
          return;
        }
      }

      // Request permission
      console.log('🔄 ULTIMATE: Requesting permission...');
      const hasPermission = await (window as any).OneSignal.Notifications.requestPermission();
      console.log('🔍 ULTIMATE: Permission request result:', hasPermission);

      if (hasPermission) {
        setDebugInfo('✅ Permission granted, waiting for ID...');
        
        // Wait for OneSignal to process
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Get player ID with retry
        let id = null;
        for (let i = 0; i < 5; i++) {
          id = await (window as any).OneSignal.User.PushSubscription.id;
          if (id) break;
          console.log(`🔄 ULTIMATE: Waiting for Player ID... attempt ${i + 1}`);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

        if (id) {
          setPlayerId(id);
          setIsRegistered(true);
          setDebugInfo('✅ Registration completed successfully!');
          
          if (window.OneSignalUltimateState) {
            window.OneSignalUltimateState.playerId = id;
          }
          
          await saveToDatabase(id);
          
          toast.success('🎉 REGISTRAZIONE RIUSCITA!', {
            description: `Player ID: ${id.substring(0, 12)}...`
          });
        } else {
          throw new Error('No Player ID received after 5 attempts');
        }
      } else {
        throw new Error('Permission denied by user');
      }

    } catch (error: any) {
      console.error('❌ ULTIMATE: Registration failed:', error);
      setDebugInfo(`❌ Registration failed: ${error.message}`);
      
      toast.error('❌ Registrazione fallita', {
        description: error.message
      });
    } finally {
      setIsRegistering(false);
    }
  };

  const saveToDatabase = async (playerIdToSave: string) => {
    if (!user) return;

    try {
      console.log('💾 ULTIMATE: Saving to database...');
      
      const { error } = await supabase
        .from('device_tokens')
        .upsert({
          user_id: user.id,
          token: playerIdToSave,
          device_type: 'onesignal',
          last_used: new Date().toISOString(),
          created_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,device_type'
        });

      if (error) {
        console.error('❌ ULTIMATE: Database save failed:', error);
        toast.error('⚠️ Registrato ma non salvato nel DB');
      } else {
        console.log('✅ ULTIMATE: Saved to database successfully');
        toast.success('💾 Salvato nel database!');
      }
    } catch (error) {
      console.error('❌ ULTIMATE: Database error:', error);
    }
  };

  return (
    <Card className="mb-6 border-green-500/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-400">
          🚀 ULTIMATE OneSignal Registration
          <Badge variant={isRegistered ? 'default' : 'destructive'}>
            {isRegistered ? 'ATTIVO' : 'NON ATTIVO'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className={isRegistered ? 'border-green-500' : 'border-orange-500'}>
          <AlertDescription>
            <strong>STATO:</strong> {debugInfo}
          </AlertDescription>
        </Alert>

        {!isRegistered && (
          <Button
            onClick={registerUltimate}
            disabled={isRegistering}
            className="w-full bg-green-600 hover:bg-green-700"
            size="lg"
          >
            {isRegistering ? '🔄 REGISTRANDO...' : '🚀 REGISTRATI ULTIMATE'}
          </Button>
        )}

        {isRegistered && (
          <Alert className="border-green-500">
            <AlertDescription>
              <strong>🎉 PERFETTO!</strong> Le notifiche push sono ora attive e funzionanti.
            </AlertDescription>
          </Alert>
        )}

        <div className="text-xs text-muted-foreground space-y-1 bg-gray-800 p-3 rounded">
          <p><strong>Status:</strong> {isRegistered ? '✅ ATTIVO' : '❌ NON ATTIVO'}</p>
          <p><strong>Debug:</strong> {debugInfo}</p>
          <p><strong>OneSignal SDK:</strong> {typeof (window as any).OneSignal !== 'undefined' ? '✅ Loaded' : '❌ Not Loaded'}</p>
          <p><strong>Global State:</strong> {window.OneSignalUltimateState?.isInitialized ? '✅ Initialized' : '❌ Not Initialized'}</p>
          <p><strong>Is Registering:</strong> {isRegistering ? '🔄 TRUE' : '✅ FALSE'}</p>
          {playerId && <p><strong>Player ID:</strong> {playerId}</p>}
          <p><strong>User:</strong> {user?.id || 'Non autenticato'}</p>
        </div>
      </CardContent>
    </Card>
  );
};