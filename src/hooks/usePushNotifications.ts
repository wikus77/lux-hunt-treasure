
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { 
  requestNotificationPermission, 
  setupMessageListener,
  getMessagingInstance
} from '@/integrations/firebase/firebase-client';
import { useNotificationManager } from '@/hooks/useNotificationManager';
import { supabase } from '@/integrations/supabase/client';

export const usePushNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState<boolean | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { createNotification } = useNotificationManager();

  // Check if notifications are supported
  useEffect(() => {
    const checkSupport = async () => {
      setIsSupported('Notification' in window);
      
      if ('Notification' in window) {
        setPermission(Notification.permission);
      }

      // Check if messaging is supported
      const messaging = await getMessagingInstance();
      if (!messaging) {
        setIsSupported(false);
      }
    };
    
    checkSupport();
  }, []);

  // Setup message listener for clue notifications
  useEffect(() => {
    if (isSupported && permission === 'granted') {
      setupMessageListener((payload) => {
        // Check if this is a clue notification
        if (payload.notification) {
          const { title, body } = payload.notification;
          createNotification(title || 'Nuovo indizio', body || '');
          
          // Show toast
          toast(title || 'Nuovo indizio', {
            description: body || '',
            duration: 5000,
            action: {
              label: "View Clue",
              onClick: () => {
                // Navigate to clues page
                window.location.href = payload.notification?.clickAction || '/clues';
              },
            },
          });
        }
      });
    }
  }, [isSupported, permission, createNotification]);

  // Save device token to Supabase
  const saveDeviceToken = useCallback(async (newToken: string) => {
    try {
      const { data: session } = await supabase.auth.getSession();
      
      if (!session.session) {
        console.log('Cannot save device token: User not logged in');
        return;
      }
      
      // Check if token already exists
      const { data: existingToken } = await supabase
        .from('device_tokens')
        .select('id')
        .eq('token', newToken)
        .eq('user_id', session.session.user.id)
        .single();
      
      if (existingToken) {
        // Update last_used timestamp
        await supabase
          .from('device_tokens')
          .update({ last_used: new Date().toISOString() })
          .eq('id', existingToken.id);
      } else {
        // Insert new token
        await supabase
          .from('device_tokens')
          .insert({
            user_id: session.session.user.id,
            token: newToken,
            device_type: /Android/i.test(navigator.userAgent) ? 'android' : 
                         /iPad|iPhone|iPod/.test(navigator.userAgent) ? 'ios' : 'web'
          });
      }
    } catch (error) {
      console.error('Error saving device token:', error);
    }
  }, []);

  // Request permission
  const requestPermission = useCallback(async () => {
    if (!isSupported) {
      toast.error('Le notifiche non sono supportate in questo browser');
      return { success: false };
    }
    
    setLoading(true);
    
    try {
      const result = await requestNotificationPermission();
      
      if (result.success) {
        setPermission('granted');
        // Only set token if it exists in the result
        if (result.token) {
          setToken(result.token);
          // Save token to Supabase
          await saveDeviceToken(result.token);
        }
        toast.success('Notifiche attivate con successo!');
      } else {
        if (result.reason === 'permission-denied') {
          setPermission('denied');
          toast.error('Permesso negato per le notifiche', {
            description: 'Puoi abilitarle nelle impostazioni del browser'
          });
        } else {
          toast.error('Non è stato possibile attivare le notifiche');
        }
      }
      
      setLoading(false);
      return result;
    } catch (error) {
      console.error('Error in requestPermission:', error);
      toast.error('Errore durante l\'attivazione delle notifiche');
      setLoading(false);
      return { success: false, error };
    }
  }, [isSupported, saveDeviceToken]);

  return {
    isSupported,
    permission,
    token,
    loading,
    requestPermission,
  };
};
