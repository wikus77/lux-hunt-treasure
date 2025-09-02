// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
/* Web Push Toggle Component for iOS PWA */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Bell, BellOff } from 'lucide-react';
import { enableWebPushIOS } from '@/utils/push-ios';
import { supabase } from '@/integrations/supabase/client';

// VAPID Public Key - UNIFIED FROM ENV
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || "BBjgzWK_1_PBZXGLQb-xQjSEUH5jLsNNgx8N0LgOcKUkZeCUaNV_gRE-QM5pKS2bPKUhVJLn0Q-H3BNGnOOjy8Q";

const WebPushToggle: React.FC = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Check if Web Push is supported and on iOS PWA
    const userAgent = navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(userAgent);
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                        (window.navigator as any).standalone === true;
    const hasSupport = 'serviceWorker' in navigator && 'PushManager' in window;
    
    setIsSupported(hasSupport && isIOS && isStandalone);

    // Check current subscription status
    if (hasSupport && isIOS && isStandalone) {
      navigator.serviceWorker.ready.then(async (registration) => {
        const subscription = await registration.pushManager.getSubscription();
        setIsEnabled(!!subscription);
      });
    }
  }, []);

  const handleToggle = async () => {
    if (!isSupported) return;

    setIsLoading(true);
    try {
      if (!isEnabled) {
        // Enable push notifications
        const subscription = await enableWebPushIOS(VAPID_PUBLIC_KEY);
        
        if (subscription) {
          // Save subscription to Supabase with UNIFIED payload format
          const { data: { user } } = await supabase.auth.getUser();
          
          const { error } = await supabase.functions.invoke('push_subscribe', {
            body: {
              subscription: subscription, // Complete subscription with endpoint and keys
              user_id: user?.id || null,
              client: 'ios_pwa',
              ua: navigator.userAgent,
              platform: 'ios_pwa'
            }
          });

          if (error) {
            console.error('Failed to save subscription:', error);
            throw new Error('Failed to save subscription');
          }

          setIsEnabled(true);
          console.log('[WEB-PUSH] Push notifications enabled successfully');
        } else {
          throw new Error('Failed to get push subscription');
        }
      } else {
        // Disable push notifications
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        
        if (subscription) {
          await subscription.unsubscribe();
          setIsEnabled(false);
          console.log('[WEB-PUSH] Push notifications disabled');
        }
      }
    } catch (error) {
      console.error('[WEB-PUSH] Error toggling push notifications:', error);
      alert('Errore nell\'abilitare le notifiche push. Riprova.');
    } finally {
      setIsLoading(false);
    }
  };

  // Only show on iOS PWA
  if (!isSupported) {
    return null;
  }

  return (
    <Button
      onClick={handleToggle}
      disabled={isLoading}
      variant={isEnabled ? "default" : "outline"}
      size="sm"
      className="flex items-center gap-2"
    >
      {isEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
      {isLoading ? 'Attendere...' : (isEnabled ? 'Notifiche Attive' : 'Abilita Notifiche')}
    </Button>
  );
};

export default WebPushToggle;