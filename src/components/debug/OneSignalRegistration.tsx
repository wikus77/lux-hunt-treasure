// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
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
  const [initStatus, setInitStatus] = useState<string>('Checking...');
  const { user } = useUnifiedAuth();

  useEffect(() => {
    // DRASTICO: Inizializzazione OneSignal forzata e semplificata
    const forceInitOneSignal = async () => {
      try {
        console.log('🔔 FORCE INIT: Starting OneSignal force initialization...');
        setInitStatus('Initializing...');

        // Check if OneSignal SDK is loaded from CDN
        if (!(window as any).OneSignal) {
          console.error('❌ OneSignal SDK not loaded from CDN');
          setInitStatus('❌ SDK Not Loaded');
          return;
        }

        console.log('✅ OneSignal SDK detected, initializing...');

        // FORZATURA: Inizializzazione diretta senza controlli complessi
        (window as any).OneSignal.push(() => {
          (window as any).OneSignal.init({
            appId: "50cb75f7-f065-4626-9a63-ce5692fa7e70",
            allowLocalhostAsSecureOrigin: true,
            serviceWorkerPath: '/OneSignalSDKWorker.js',
            serviceWorkerUpdaterPath: '/OneSignalSDKUpdaterWorker.js',
            safari_web_id: "web.onesignal.auto.50cb75f7-f065-4626-9a63-ce5692fa7e70"
          });

          console.log('✅ OneSignal init called');
          (window as any).OneSignalInitialized = true;
          setInitStatus('✅ Initialized');

          // Check current subscription
          checkSubscriptionStatus();
        });

      } catch (error) {
        console.error('❌ FORCE INIT ERROR:', error);
        setInitStatus('❌ Init Failed');
      }
    };

    const checkSubscriptionStatus = async () => {
      try {
        console.log('🔔 Checking subscription with OneSignal v16 API...');
        
        // Use correct OneSignal v16 API
        const permission = await (window as any).OneSignal.Notifications.permission;
        console.log('🔔 Permission status:', permission);
        
        const isSubscribed = permission === 'granted';
        setIsRegistered(isSubscribed);
        
        if (isSubscribed) {
          try {
            const playerId = await (window as any).OneSignal.User.PushSubscription.id;
            console.log('🔔 Player ID:', playerId);
            if (playerId) {
              setPlayerId(playerId);
            }
          } catch (playerError) {
            console.warn('⚠️ Could not get player ID:', playerError);
          }
        }
      } catch (error) {
        console.error('❌ Check subscription error:', error);
      }
    };

    // Start initialization immediately
    forceInitOneSignal();
  }, []);

  const registerForNotifications = async () => {
    setIsRegistering(true);
    
    try {
      console.log('🔔 FORCE REGISTRATION: Starting...');

      if (!(window as any).OneSignal || !(window as any).OneSignalInitialized) {
        toast.error('❌ OneSignal non inizializzato', {
          description: 'Ricarica la pagina e riprova'
        });
        return;
      }

      // Use correct OneSignal v16 API
      try {
        console.log('🔔 Requesting permission via OneSignal v16...');
        
        // Request permission using v16 API
        const permission = await (window as any).OneSignal.Notifications.requestPermission();
        console.log('✅ Permission result:', permission);
        
        if (permission) {
          // Wait a bit for initialization then check subscription
          setTimeout(async () => {
            try {
              const playerId = await (window as any).OneSignal.User.PushSubscription.id;
              if (playerId) {
                setPlayerId(playerId);
                setIsRegistered(true);
                toast.success('✅ Registrato per le notifiche!', {
                  description: `Player ID: ${playerId.substring(0, 8)}...`
                });
              } else {
                toast.error('❌ Registrazione fallita', {
                  description: 'Player ID non ottenuto'
                });
              }
            } catch (playerError) {
              console.error('❌ Player ID error:', playerError);
              toast.error('❌ Errore Player ID', {
                description: 'Non riesco a ottenere il Player ID'
              });
            }
            setIsRegistering(false);
          }, 2000);
        } else {
          toast.error('❌ Registrazione fallita', {
            description: 'Permesso negato dall\'utente'
          });
          setIsRegistering(false);
        }
      } catch (error: any) {
        console.error('❌ Registration error:', error);
        toast.error('❌ Errore registrazione', {
          description: error.message
        });
        setIsRegistering(false);
      }

    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error('Errore registrazione', {
        description: error.message
      });
      setIsRegistering(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🔔 OneSignal FORCE Init Registration
          <Badge variant={isRegistered ? 'default' : 'secondary'}>
            {isRegistered ? 'REGISTRATO' : 'NON REGISTRATO'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertDescription>
            {isRegistered 
              ? `✅ Dispositivo registrato! Player ID: ${playerId?.substring(0, 12)}...`
              : '⚠️ Devi registrarti per ricevere notifiche push.'
            }
          </AlertDescription>
        </Alert>

        {!isRegistered && (
          <Button
            onClick={registerForNotifications}
            disabled={isRegistering || !initStatus.includes('✅')}
            className="w-full"
            size="lg"
          >
            {isRegistering ? '🔄 Registrando...' : '🔔 REGISTRATI PER NOTIFICHE'}
          </Button>
        )}

        <div className="text-xs text-muted-foreground">
          <p><strong>Stato:</strong> {isRegistered ? '✅ Pronto per notifiche' : '❌ Non registrato'}</p>
          <p><strong>Init Status:</strong> {initStatus}</p>
          <p><strong>OneSignal SDK:</strong> {(window as any).OneSignal ? '✅ Loaded' : '❌ Not Loaded'}</p>
          <p><strong>OneSignal Init:</strong> {(window as any).OneSignalInitialized ? '✅ Ready' : '❌ Not Ready'}</p>
          {playerId && <p><strong>Player ID:</strong> {playerId}</p>}
          <p><strong>User ID:</strong> {user?.id || 'Non autenticato'}</p>
        </div>
      </CardContent>
    </Card>
  );
};