// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
/* Web Push Toggle Component - Unified W3C Standard */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Bell, BellOff, AlertCircle, RefreshCw, Loader2 } from 'lucide-react';
import { 
  webPushManager, 
  isWebPushSupported, 
  isPWAMode 
} from '@/lib/push/webPushManager';

const WebPushToggle: React.FC = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [supportReason, setSupportReason] = useState<string>('');

  // Check support on mount
  useEffect(() => {
    console.log('[WEBPUSH-TOGGLE] Initializing...');
    
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
      setSupportReason('On iOS, add this app to your home screen first');
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
        console.log('[WEBPUSH-TOGGLE] Current subscription active');
      } else {
        console.log('[WEBPUSH-TOGGLE] No active subscription');
      }
    } catch (error) {
      console.error('[WEBPUSH-TOGGLE] Error checking status:', error);
    }
  };

  const handleToggle = async () => {
    if (!isSupported) return;

    setIsLoading(true);
    try {
      if (!isEnabled) {
        // Subscribe
        console.log('[WEBPUSH-TOGGLE] Starting subscription...');
        await webPushManager.subscribe();
        setIsEnabled(true);
        console.log('[WEBPUSH-TOGGLE] ✅ Subscribed successfully');
      } else {
        // Unsubscribe
        console.log('[WEBPUSH-TOGGLE] Unsubscribing...');
        await webPushManager.unsubscribe();
        setIsEnabled(false);
        console.log('[WEBPUSH-TOGGLE] ✅ Unsubscribed successfully');
      }
    } catch (error) {
      console.error('[WEBPUSH-TOGGLE] ❌ Error:', error);
      
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
  };

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
    <div className="flex items-center gap-2">
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
        {isLoading ? 'Attendere...' : (isEnabled ? 'Notifiche Attive' : 'Abilita Notifiche')}
      </Button>
      
      <Button
        onClick={refreshStatus}
        variant="ghost"
        size="sm"
        className="h-8 px-2"
        title="Refresh status"
        disabled={isLoading}
      >
        <RefreshCw className="w-3 h-3" />
      </Button>
    </div>
  );
};

export default WebPushToggle;
