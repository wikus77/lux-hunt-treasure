// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import OneSignal from 'react-onesignal';

export const OneSignalRegistration = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const { user } = useUnifiedAuth();

  useEffect(() => {
    // Check if OneSignal is available and user is subscribed
    const checkOneSignal = async () => {
      try {
        // Wait for OneSignal to be initialized
        let attempts = 0;
        while (attempts < 50 && !(window as any).OneSignalInitialized) {
          await new Promise(resolve => setTimeout(resolve, 100));
          attempts++;
        }

        if ((window as any).OneSignalInitialized) {
          const permission = await OneSignal.Notifications.permission;
          setIsRegistered(permission === true);
          
          if (permission === true) {
            const userId = await OneSignal.User.PushSubscription.id;
            if (userId) {
              setPlayerId(userId);
            }
          }
        }
      } catch (error) {
        console.error('Error checking OneSignal status:', error);
      }
    };

    checkOneSignal();
  }, []);

  const registerForNotifications = async () => {
    setIsRegistering(true);
    
    try {
      // Check if OneSignal is initialized
      if (!(window as any).OneSignalInitialized) {
        toast.error('❌ OneSignal non inizializzato', {
          description: 'Ricarica la pagina e riprova'
        });
        return;
      }

      console.log('🔔 Starting OneSignal registration...');
      
      // Request notification permission using OneSignal v16 API
      try {
        await OneSignal.Notifications.requestPermission();
        console.log('🔔 Permission request completed');
        
        // Check permission status after request
        const permission = await OneSignal.Notifications.permission;
        console.log('🔔 Current permission:', permission);
        
        if (permission === true) {
          console.log('✅ Permission granted, getting player ID...');
          
          // Wait for subscription to be created
          let attempts = 0;
          let userId = null;
          
          while (!userId && attempts < 10) {
            try {
              userId = await OneSignal.User.PushSubscription.id;
              if (userId) break;
            } catch (e) {
              console.log('Waiting for player ID...');
            }
            await new Promise(resolve => setTimeout(resolve, 1000));
            attempts++;
          }
          
          if (userId) {
            setPlayerId(userId);
            setIsRegistered(true);
            toast.success('✅ Registrato per le notifiche!', {
              description: `Player ID: ${userId.substring(0, 8)}...`
            });
          } else {
            toast.error('❌ Player ID non trovato', {
              description: 'Riprova tra qualche secondo'
            });
          }
        } else {
          console.log('❌ Permission denied');
          toast.error('❌ Registrazione fallita', {
            description: 'Permesso negato dall\'utente'
          });
        }
      } catch (permissionError) {
        console.error('Permission request error:', permissionError);
        toast.error('❌ Errore richiesta permesso', {
          description: 'Problema nella richiesta di autorizzazione'
        });
      }

    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error('Errore registrazione', {
        description: error.message
      });
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🔔 Registrazione OneSignal
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
            disabled={isRegistering}
            className="w-full"
            size="lg"
          >
            {isRegistering ? '🔄 Registrando...' : '🔔 REGISTRATI PER NOTIFICHE'}
          </Button>
        )}

        <div className="text-xs text-muted-foreground">
          <p><strong>Stato:</strong> {isRegistered ? '✅ Pronto per notifiche' : '❌ Non registrato'}</p>
          {playerId && <p><strong>Player ID:</strong> {playerId}</p>}
          <p><strong>User ID:</strong> {user?.id || 'Non autenticato'}</p>
          <p><strong>OneSignal Init:</strong> {(window as any).OneSignalInitialized ? '✅ OK' : '❌ Not Ready'}</p>
        </div>
      </CardContent>
    </Card>
  );
};