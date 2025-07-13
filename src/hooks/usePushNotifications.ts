import { getSupabaseClient } from "@/integrations/supabase/getClient"
// 🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™

import { useEffect, useState } from 'react';
import { PushNotifications, Token, PushNotificationSchema, ActionPerformed } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { toast } from 'sonner';

export const usePushNotifications = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<string>('prompt');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if push notifications are supported
    const supported = Capacitor.isNativePlatform();
    setIsSupported(supported);

    if (!supported) {
      console.log('🔔 Push notifications available only on native platforms');
      return;
    }

    const setupPushNotifications = async () => {
      const client = await getSupabaseClient();
      try {
        setLoading(true);
        
        // Request permission per le notifiche
        const permissionResult = await PushNotifications.requestPermissions();
        setPermission(permissionResult.receive);
        
        if (permissionResult.receive === 'granted') {
          console.log('✅ Push notification permission granted');
          
          // Registra per ricevere notifiche push
          await PushNotifications.register();
          
          // Event listener per registrazione token
          PushNotifications.addListener('registration', async (token: Token) => {
            console.log('🔑 Push registration success, token: ', token.value);
            
            try {
              const { data: { user } } = await client.auth.getUser();
              
              if (user) {
                // Salva token nel database
                const { error } = await client
                  .from('device_tokens')
                  .upsert({
                    user_id: user.id,
                    token: token.value,
                    device_type: Capacitor.getPlatform(),
                    last_used: new Date().toISOString()
                  }, {
                    onConflict: 'user_id,token'
                  });

                if (error) {
                  console.error('❌ Error saving device token:', error);
                } else {
                  console.log('✅ Device token saved to database');
                }
              }
            } catch (error) {
              console.error('❌ Error processing token registration:', error);
            }
          });

          // Event listener per errori di registrazione
          PushNotifications.addListener('registrationError', (error: any) => {
            console.error('❌ Error on registration: ', error);
          });

          // Event listener per notifiche ricevute
          PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
            console.log('📬 Push notification received: ', notification);
            
            // Mostra toast per notifiche ricevute in foreground
            toast.success(notification.title || 'Nuova notifica', {
              description: notification.body || 'Hai ricevuto una nuova notifica'
            });
          });

          // Event listener per azioni sulle notifiche
          PushNotifications.addListener('pushNotificationActionPerformed', (notification: ActionPerformed) => {
            console.log('🔔 Push notification action performed: ', notification);
            
            // Gestisci l'azione sulla notifica (es. navigate to specific page)
            if (notification.notification.data?.route) {
              // Qui puoi aggiungere logica per navigare a pagine specifiche
              console.log('Navigate to:', notification.notification.data.route);
            }
          });

        } else {
          console.warn('⚠️ Push notification permission denied');
          toast.error('Permessi notifiche richiesti', {
            description: 'Abilita le notifiche nelle impostazioni per ricevere aggiornamenti'
          });
        }
      } catch (error) {
        console.error('❌ Error setting up push notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    setupPushNotifications();

    // Cleanup function
    return () => {
      PushNotifications.removeAllListeners();
    };
  }, []);

  // Funzione per richiedere permessi
  const requestPermission = async (): Promise<{ success: boolean }> => {
    if (!isSupported) {
      return { success: false };
    }

    setLoading(true);
    try {
      const permissionResult = await PushNotifications.requestPermissions();
      setPermission(permissionResult.receive);
      
      if (permissionResult.receive === 'granted') {
        await PushNotifications.register();
        toast.success('Permessi notifiche concessi');
        return { success: true };
      } else {
        toast.error('Permessi notifiche negati');
        return { success: false };
      }
    } catch (error) {
      console.error('❌ Error requesting permission:', error);
      toast.error('Errore durante la richiesta permessi');
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  // Funzione per inviare notifica test
  const sendTestNotification = async () => {
    const client = await getSupabaseClient();
    try {
      const { data: { user } } = await client.auth.getUser();
      
      if (!user) {
        toast.error('Utente non autenticato');
        return;
      }

      const { error } = await client.functions.invoke('send-push-notification', {
        body: {
          userId: user.id,
          title: 'Test M1SSION™',
          body: 'Notifica push di test funzionante! 🚗',
          data: {
            route: '/home'
          }
        }
      });

      if (error) {
        console.error('❌ Error sending test notification:', error);
        toast.error('Errore invio notifica test');
      } else {
        console.log('✅ Test notification sent');
        toast.success('Notifica test inviata!');
      }
    } catch (error) {
      console.error('❌ Error in sendTestNotification:', error);
      toast.error('Errore durante l\'invio della notifica');
    }
  };

  return {
    isSupported,
    permission,
    loading,
    requestPermission,
    sendTestNotification
  };
};