// © 2025 Joseph MULÉ – M1SSION™
// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';

interface PushSetupProps {
  className?: string;
}

const PushSetup: React.FC<PushSetupProps> = ({ className = "" }) => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { user } = useUnifiedAuth();
  const { toast } = useToast();

  useEffect(() => {
    // Check browser support
    const supported = 'serviceWorker' in navigator && 'Notification' in window;
    setIsSupported(supported);
    
    if (supported) {
      setPermission(Notification.permission);
      checkSubscription();
    }
  }, []);

  const checkSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch (error) {
      console.error('Error checking push subscription:', error);
    }
  };

  const requestPermission = async () => {
    if (!isSupported) {
      toast({
        title: "❌ Non supportato",
        description: "Il tuo browser non supporta le notifiche push.",
        variant: "destructive"
      });
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setPermission(permission);

      if (permission === 'granted') {
        await subscribeToNotifications();
        toast({
          title: "✅ Notifiche attivate",
          description: "Riceverai notifiche push da M1SSION™",
        });
      } else {
        toast({
          title: "⚠️ Permesso negato",
          description: "Non riceverai notifiche push.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      toast({
        title: "❌ Errore",
        description: "Impossibile attivare le notifiche.",
        variant: "destructive"
      });
    }
  };

  const subscribeToNotifications = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      
      // Use unified VAPID key - import from single source
      const { getAppServerKey } = await import('@/lib/vapid');
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: getAppServerKey() as unknown as BufferSource
      });

      // Save subscription to database
      if (user) {
        const { error } = await supabase
          .from('device_tokens')
          .upsert({
            user_id: user.id,
            token: JSON.stringify(subscription),
            device_type: 'web_push',
            last_used: new Date().toISOString()
          }, {
            onConflict: 'user_id,token'
          });

        if (error) {
          console.error('Error saving push subscription:', error);
        } else {
          setIsSubscribed(true);
        }
      }
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      throw error;
    }
  };

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  if (!isSupported) {
    return null;
  }

  if (permission === 'granted' && isSubscribed) {
    return null; // Already set up
  }

  return (
    <div className={`${className}`}>
      {permission === 'default' && (
        <Button
          onClick={requestPermission}
          variant="ghost"
          className="text-white/70 hover:text-white hover:bg-white/10"
        >
          🔔 Attiva notifiche push
        </Button>
      )}
    </div>
  );
};

export default PushSetup;