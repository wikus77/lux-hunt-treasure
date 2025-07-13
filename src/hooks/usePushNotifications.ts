
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { 
  requestNotificationPermission, 
  setupMessageListener,
  getMessagingInstance
} from '@/integrations/firebase/firebase-client';
import { useNotificationManager } from '@/hooks/useNotificationManager';

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

  // Setup message listener
  useEffect(() => {
    if (isSupported && permission === 'granted') {
      setupMessageListener((payload) => {
        // Create an in-app notification
        if (payload.notification) {
          const { title, body } = payload.notification;
          createNotification(title || 'Nuova notifica', body || '');
          
          // Show toast
          toast(title || 'Nuova notifica', {
            description: body || '',
            duration: 5000,
          });
        }
      });
    }
  }, [isSupported, permission, createNotification]);

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
  }, [isSupported, createNotification]);

  return {
    isSupported,
    permission,
    token,
    loading,
    requestPermission,
  };
};
