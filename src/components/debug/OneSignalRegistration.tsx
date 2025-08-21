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
  const { user } = useUnifiedAuth();

  useEffect(() => {
    // Check if OneSignal is available and user is subscribed
    const checkOneSignal = async () => {
      if (typeof window !== 'undefined' && (window as any).OneSignal) {
        try {
          // Wait for OneSignal to be ready
          await (window as any).OneSignal.push(async () => {
            const isEnabled = await (window as any).OneSignal.Notifications.permission;
            setIsRegistered(isEnabled === 'granted');
            
            if (isEnabled === 'granted') {
              const userId = (window as any).OneSignal.User.PushSubscription.id;
              if (userId) {
                setPlayerId(userId);
              }
            }
          });
        } catch (error) {
          console.error('Error checking OneSignal status:', error);
        }
      }
    };

    checkOneSignal();
  }, []);

  const registerForNotifications = async () => {
    setIsRegistering(true);
    
    try {
      if (!(window as any).OneSignal) {
        throw new Error('OneSignal not loaded');
      }

      // Request permission using the new OneSignal API
      await (window as any).OneSignal.push(async () => {
        try {
          // Request notification permission
          const permission = await (window as any).OneSignal.Notifications.requestPermission();
          
          if (permission) {
            // Wait a moment for the subscription to be created
            setTimeout(async () => {
              const userId = (window as any).OneSignal.User.PushSubscription.id;
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
            }, 2000);
          } else {
            toast.error('❌ Registrazione fallita', {
              description: 'Permesso negato dall\'utente'
            });
          }
        } catch (innerError) {
          console.error('Inner OneSignal error:', innerError);
          toast.error('❌ Errore durante registrazione', {
            description: 'OneSignal non disponibile'
          });
        }
      });

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
        </div>
      </CardContent>
    </Card>
  );
};