// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
/* Push Toggle V2 - Complete Pipeline with Backend Upsert */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Bell, BellOff, AlertCircle, Loader2 } from 'lucide-react';
import { subscribeFlow, type SubscribeFlowResult } from '@/lib/push/subscribeFlow';
import { 
  isWebPushSupported, 
  isPWAMode,
  webPushManager
} from '@/lib/push/webPushManager';

const PushToggleV2: React.FC = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [supportReason, setSupportReason] = useState<string>('');
  
  const lastClickRef = useRef<number>(0);

  // Check support on mount
  useEffect(() => {
    console.info('[PUSH-V2] Initializing...');
    
    const supported = isWebPushSupported();
    setIsSupported(supported);
    
    if (!supported) {
      setSupportReason('Push notifications not supported');
      return;
    }
    
    // iOS specific check
    const isIOS = /iphone|ipod|ipad/i.test(navigator.userAgent);
    if (isIOS && !isPWAMode()) {
      setIsSupported(false);
      setSupportReason('Su iOS, aggiungi questa app alla home screen prima');
      console.info('[PUSH-V2] iOS non-standalone detected, showing install guide');
      return;
    }
    
    // Check current status
    refreshStatus();
    
    // Refresh on visibility change
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        refreshStatus();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', refreshStatus);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', refreshStatus);
    };
  }, []);

  const refreshStatus = async () => {
    if (!isWebPushSupported()) return;
    
    try {
      const subscription = await webPushManager.getCurrent();
      setIsEnabled(!!subscription);
      
      if (subscription) {
        console.info('[PUSH-V2] Current subscription active');
      } else {
        console.info('[PUSH-V2] No active subscription');
      }
    } catch (error) {
      console.error('[PUSH-V2] Error checking status:', error);
    }
  };

  const handleToggle = useCallback(async () => {
    if (!isSupported) return;

    // Throttle: prevent double-tap (500ms)
    const now = Date.now();
    if (now - lastClickRef.current < 500) {
      console.info('[PUSH-V2] Throttled: click too soon');
      return;
    }
    lastClickRef.current = now;

    setIsLoading(true);
    
    try {
      if (!isEnabled) {
        // Subscribe using COMPLETE pipeline (same as "Ripara" button)
        console.info('[PUSH-V2] Starting subscribeFlow()...');
        const t0 = performance.now();
        
        const result: SubscribeFlowResult = await subscribeFlow();
        
        const elapsed = Math.round(performance.now() - t0);
        console.info(`[PUSH-V2] subscribeFlow() completed in ${elapsed}ms:`, result);
        
        if (result.ok) {
          setIsEnabled(true);
          console.info('[PUSH-V2] ✅ Subscription successful with backend upsert');
        } else {
          // Fallback silently - don't throw, don't change state
          console.warn('[PUSH-V2] ⚠️ Subscription failed:', result.error || result.message);
          
          // User-friendly message
          let errorMessage = 'Impossibile attivare le notifiche.';
          if (result.status === 'permission_denied') {
            errorMessage = 'Permesso notifiche negato. Controlla le impostazioni del browser.';
          } else if (result.error?.includes('home screen')) {
            errorMessage = 'Aggiungi l\'app alla home screen per abilitare le notifiche.';
          }
          
          alert(errorMessage);
        }
      } else {
        // Unsubscribe
        console.info('[PUSH-V2] Unsubscribing...');
        await webPushManager.unsubscribe();
        setIsEnabled(false);
        console.info('[PUSH-V2] ✅ Unsubscribed successfully');
      }
    } catch (error) {
      // Error boundary: catch all uncaught errors
      console.error('[PUSH-V2] ❌ Uncaught error:', error);
      
      let errorMessage = 'Errore nell\'abilitare le notifiche push.';
      if (error instanceof Error) {
        if (error.message.includes('home screen')) {
          errorMessage = 'Aggiungi l\'app alla home screen per abilitare le notifiche.';
        } else if (error.message.includes('permission')) {
          errorMessage = 'Permessi notifiche negati.';
        } else if (error.message.includes('VAPID')) {
          errorMessage = 'Errore configurazione server. Contatta l\'assistenza.';
        }
      }
      
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [isEnabled, isSupported]);

  // Don't render if not supported
  if (!isSupported) {
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

  return (
    <div className="flex items-center gap-2" data-push-toggle-v2>
      <Button
        onClick={handleToggle}
        disabled={isLoading}
        variant={isEnabled ? "default" : "outline"}
        size="sm"
        className="flex items-center gap-2"
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : isEnabled ? (
          <Bell className="w-4 h-4" />
        ) : (
          <BellOff className="w-4 h-4" />
        )}
        {isLoading ? 'Attendere...' : (isEnabled ? 'Notifiche Attive (V2)' : 'Abilita Notifiche (V2)')}
      </Button>
    </div>
  );
};

export default PushToggleV2;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
