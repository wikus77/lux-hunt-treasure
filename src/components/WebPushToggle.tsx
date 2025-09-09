// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
/* Web Push Toggle Component for iOS PWA */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Bell, BellOff, AlertCircle } from 'lucide-react';
import { subscribeWebPush, isWebPushSupported, getCurrentSubscription } from '@/utils/safeWebPushSubscribe';
import { clearSWReloadFlag } from '@/utils/swControl';
import { supabase } from '@/integrations/supabase/client';

// VAPID Public Key - M1SSION™ UNIFIED 
const VAPID_PUBLIC_KEY = "BMkETBgIgFEj0MOINyixtfrde9ZiMbj-5YEtsX8GpnuXpABax28h6dLjmJ7RK6rlZXUJg1N_z3ba0X6E7Qmjj7A";

const WebPushToggle: React.FC = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [isControlled, setIsControlled] = useState(false);
  const [supportReason, setSupportReason] = useState<string>('');

  useEffect(() => {
    const checkSupport = async () => {
      console.log('[WEBPUSH-TOGGLE] Checking support...');
      
      // Clear reload flag from previous operations
      clearSWReloadFlag();
      
      const support = isWebPushSupported();
      setIsSupported(support.supported);
      setSupportReason(support.reason || '');
      
      if (support.supported) {
        // Check current subscription status
        try {
          const status = await getCurrentSubscription();
          setIsEnabled(status.isSubscribed);
          setIsControlled(status.isControlled);
          
          console.log('[WEBPUSH-TOGGLE] Status:', {
            isSubscribed: status.isSubscribed,
            isControlled: status.isControlled
          });
        } catch (error) {
          console.error('[WEBPUSH-TOGGLE] Error checking status:', error);
        }
      }
    };
    
    checkSupport();
  }, []);

  const handleToggle = async () => {
    if (!isSupported) return;

    setIsLoading(true);
    try {
      if (!isEnabled) {
        console.log('[WEBPUSH-TOGGLE] Starting safe subscription...');
        
        // Use the new safe subscription method
        const subscription = await subscribeWebPush(VAPID_PUBLIC_KEY);
        
        if (!subscription) {
          // Page was reloaded for SW control, component will re-initialize
          console.log('[WEBPUSH-TOGGLE] Page reloaded for SW control');
          return;
        }
        
        // Save subscription to Supabase
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          throw new Error('User not authenticated');
        }
        
        console.log('[WEBPUSH-TOGGLE] Saving subscription to Supabase...');
        
        // Prepare payload in the expected format
        const payload = {
          subscription: {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: subscription.p256dh,
              auth: subscription.auth
            }
          },
          platform: 'web',
          user_id: user.id
        };
        
        console.log('[WEBPUSH-TOGGLE] Payload diagnostic:', {
          controller: navigator.serviceWorker?.controller ? 'OK' : 'No',
          readyScope: (await navigator.serviceWorker.ready).scope,
          subscribed: true,
          endpointHost: new URL(subscription.endpoint).hostname,
          payloadFields: {
            endpoint: !!payload.subscription.endpoint,
            p256dhLen: payload.subscription.keys.p256dh.length,
            authLen: payload.subscription.keys.auth.length,
            platform: payload.platform,
            hasUserId: !!payload.user_id
          }
        });

        const response = await fetch('https://vkjrqirvdvjbemsfzxof.functions.supabase.co/webpush-upsert', {
          method: 'POST',
          headers: {
            'content-type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('[WEBPUSH-TOGGLE] Upsert failed:', {
            status: response.status,
            statusText: response.statusText,
            error: errorData
          });
          
          // Clean up failed subscription
          try {
            const reg = await navigator.serviceWorker.ready;
            const sub = await reg.pushManager.getSubscription();
            if (sub) await sub.unsubscribe();
          } catch {}
          
          // Store error status for debug panel
          const errorMsg = errorData.error_code === 'MISSING_FIELD' 
            ? `Campi mancanti: ${errorData.missing?.join(', ') || 'unknown'}`
            : `Server error: ${response.status} - ${errorData.error || response.statusText}`;
          localStorage.setItem('lastUpsertError', errorMsg);
          localStorage.removeItem('lastUpsertStatus');
          
          throw new Error(errorMsg);
        }

        const result = await response.json();
        console.log('[WEBPUSH-TOGGLE] ✅ Upsert success:', result);
        
        // Store success status for debug panel
        localStorage.setItem('lastUpsertStatus', `Success ${new Date().toLocaleTimeString()}`);
        localStorage.removeItem('lastUpsertError');

        setIsEnabled(true);
        setIsControlled(true);
        console.log('[WEBPUSH-TOGGLE] ✅ Push notifications enabled successfully');
        
      } else {
        // Disable push notifications
        console.log('[WEBPUSH-TOGGLE] Disabling push notifications...');
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        
        if (subscription) {
          await subscription.unsubscribe();
          setIsEnabled(false);
          console.log('[WEBPUSH-TOGGLE] Push notifications disabled');
        }
      }
    } catch (error) {
      console.error('[WEBPUSH-TOGGLE] ❌ Error:', error);
      
      let errorMessage = 'Errore nell\'abilitare le notifiche push.';
      if (error instanceof Error) {
        if (error.message.includes('PWA mode')) {
          errorMessage = 'Aggiungi l\'app alla home screen per abilitare le notifiche.';
        } else if (error.message.includes('permission')) {
          errorMessage = 'Permessi notifiche negati.';
        } else if (error.message.includes('VAPID')) {
          errorMessage = 'Errore configurazione server.';
        }
      }
      
      alert(errorMessage + ' Riprova.');
    } finally {
      setIsLoading(false);
    }
  };

  // Only show on supported devices
  if (!isSupported) {
    // Show help message for iOS users not in PWA mode
    if (supportReason) {
      return (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <AlertCircle className="w-3 h-3" />
          <span>{supportReason}</span>
        </div>
      );
    }
    return null;
  }

  // Show controller status for debugging
  const showDebug = true; // Set to false in production
  
  return (
    <div className="flex flex-col gap-1">
      <Button
        onClick={handleToggle}
        disabled={isLoading || !isControlled}
        variant={isEnabled ? "default" : "outline"}
        size="sm"
        className="flex items-center gap-2"
      >
        {isEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
        {isLoading ? 'Attendere...' : (isEnabled ? 'Notifiche Attive' : 'Abilita Notifiche')}
      </Button>
      
      {showDebug && (
        <div className="text-xs text-muted-foreground">
          Controller: {isControlled ? '✅' : '❌'} | SW: {navigator.serviceWorker?.controller ? 'OK' : 'No'}
        </div>
      )}
    </div>
  );
};

export default WebPushToggle;