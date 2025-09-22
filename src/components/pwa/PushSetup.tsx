// © 2025 Joseph MULÉ – M1SSION™
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { canUseNotifications, canUseServiceWorker, isIOSDevice, isPWAMode, detectPushProvider, getPlatformInfo } from '@/utils/push/support';

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
    // Safe feature detection
    const supported = canUseNotifications() && canUseServiceWorker();
    setIsSupported(supported);
    
    if (supported) {
      const permission = canUseNotifications() ? Notification.permission : 'denied';
      setPermission(permission as NotificationPermission);
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
    // iOS PWA gating
    if (isIOSDevice() && !isPWAMode()) {
      toast({
        title: "📱 iPhone/iPad",
        description: "Per le notifiche push devi aggiungere M1SSION alla Home. Tocca il pulsante Condividi e poi 'Aggiungi alla schermata Home'.",
        variant: "default",
        duration: 8000
      });
      return;
    }

    if (!canUseNotifications()) {
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
      if (!canUseServiceWorker()) {
        throw new Error('Service Worker not supported');
      }

      const registration = await navigator.serviceWorker.ready;
      
      // Use unified VAPID key from M1SSION™
      const VAPID_PUBLIC_KEY = 'BMkETBgIgFEj0MOINyixtfrde9ZiMbj-5YEtsX8GpnuXpABax28h6dLjmJ7RK6rlZXUJg1N_z3ba0X6E7Qmjj7A';
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      });

      // Detect provider and platform
      const provider = detectPushProvider(subscription.endpoint);
      const platformInfo = getPlatformInfo();

      // Save subscription to push_subscriptions table
      if (user) {
        const p256dhKey = subscription.getKey('p256dh');
        const authKey = subscription.getKey('auth');
        
        if (!p256dhKey || !authKey) {
          throw new Error('Failed to get subscription keys');
        }

        const { error } = await supabase
          .from('push_subscriptions')
          .upsert({
            user_id: user.id,
            endpoint: subscription.endpoint,
            p256dh: btoa(String.fromCharCode(...new Uint8Array(p256dhKey))),
            auth: btoa(String.fromCharCode(...new Uint8Array(authKey))),
            platform: platformInfo.platform,
            provider,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'endpoint'
          });

        if (error) {
          console.error('Error saving push subscription:', error);
          throw error;
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