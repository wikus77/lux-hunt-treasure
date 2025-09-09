// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
/* Web Push Toggle Component for iOS PWA - Stable Version */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Bell, BellOff, AlertCircle, RefreshCw } from 'lucide-react';
import { pushSubscribeStable } from '@/utils/pushSubscribeStable';
import { endpointHost, normalizePlatform } from '@/utils/pushPlatform';
import { supabase } from '@/integrations/supabase/client';

// VAPID Public Key - M1SSION™ UNIFIED 
const VAPID_PUBLIC_KEY = "BMkETBgIgFEj0MOINyixtfrde9ZiMbj-5YEtsX8GpnuXpABax28h6dLjmJ7RK6rlZXUJg1N_z3ba0X6E7Qmjj7A";

// Check if iOS standalone (PWA)
const isIOSStandalone = () => {
  return (
    (window.navigator.standalone === true || 
     window.matchMedia('(display-mode: standalone)').matches) && 
    /iphone|ipod|ipad/i.test(navigator.userAgent)
  );
};

const WebPushToggle: React.FC = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [isControlled, setIsControlled] = useState(false);
  const [supportReason, setSupportReason] = useState<string>('');
  const [syncPending, setSyncPending] = useState(false);
  const [diagnostics, setDiagnostics] = useState<{
    controller?: boolean;
    readyScope?: string;
    subscribed?: boolean;
    endpointHost?: string;
    platformResolved?: string;
    lastUpsertStatus?: string;
    lastUpsertError?: string;
  }>({});

  // Check support
  const checkSupport = () => {
    if (!('serviceWorker' in navigator)) {
      return { supported: false, reason: 'Service Workers not supported' };
    }
    if (!('PushManager' in window)) {
      return { supported: false, reason: 'Push Manager not supported' };
    }
    if (!('Notification' in window)) {
      return { supported: false, reason: 'Notifications not supported' };
    }
    
    // iOS specific check
    const isIOS = /iphone|ipod|ipad/i.test(navigator.userAgent);
    if (isIOS && !isIOSStandalone()) {
      return { 
        supported: false, 
        reason: 'On iOS, add this app to your home screen first' 
      };
    }
    
    return { supported: true };
  };

  useEffect(() => {
    console.log('[WEBPUSH-TOGGLE] Initializing...');
    
    const support = checkSupport();
    setIsSupported(support.supported);
    setSupportReason(support.reason || '');
    
    if (support.supported) {
      refreshStatus();
    }
  }, []);

  const refreshStatus = async () => {
    if (!isSupported) return;
    
    try {
      // Get fresh status
      const controller = !!navigator.serviceWorker.controller;
      const reg = await navigator.serviceWorker.ready;
      const readyScope = reg.scope;
      const subscription = await reg.pushManager.getSubscription();
      const subscribed = !!subscription;
      
      setIsEnabled(subscribed);
      setIsControlled(controller);
      
      // Update diagnostics
      const diagnosticUpdate: typeof diagnostics = {
        controller,
        readyScope,
        subscribed,
        lastUpsertStatus: localStorage.getItem('lastUpsertStatus') || undefined,
        lastUpsertError: localStorage.getItem('lastUpsertError') || undefined
      };
      
      if (subscription) {
        const host = endpointHost(subscription.endpoint);
        const platformResolved = normalizePlatform(subscription.endpoint, 'web');
        diagnosticUpdate.endpointHost = host;
        diagnosticUpdate.platformResolved = platformResolved;
      }
      
      setDiagnostics(diagnosticUpdate);
      
      // Telemetry
      console.info(`push: controller=${controller} ready=${readyScope} host=${diagnosticUpdate.endpointHost || 'none'} subscribed=${subscribed}`);
      
    } catch (error) {
      console.error('[WEBPUSH-TOGGLE] Error refreshing status:', error);
    }
  };

  const handleToggle = async () => {
    if (!isSupported) return;

    setIsLoading(true);
    try {
      if (!isEnabled) {
        console.log('[WEBPUSH-TOGGLE] Starting stable subscription...');
        
        // Get user for authentication
        const { data: { user } } = await supabase.auth.getUser();
        
        // Call stable subscription utility
        const stableResult = await pushSubscribeStable();
        
        // Immediately set toggle to ON (decoupled from backend)
        setIsEnabled(true);
        console.log('[WEBPUSH-TOGGLE] Toggle enabled, starting background upsert...');
        
        // Normalize platform
        const platform = normalizePlatform(stableResult.sub.endpoint, 'web');
        
        // Update diagnostics immediately
        const ready = await navigator.serviceWorker.ready;
        setDiagnostics(prev => ({
          ...prev,
          controller: !!navigator.serviceWorker.controller,
          readyScope: ready.scope,
          subscribed: true,
          endpointHost: stableResult.endpointHost,
          platformResolved: platform
        }));
        
        // Telemetry
        console.info(`push: controller=${!!navigator.serviceWorker.controller} ready=${ready.scope} host=${stableResult.endpointHost} subscribed=true`);
        
        // Prepare payload
        const payload = {
          subscription: {
            endpoint: stableResult.sub.endpoint,
            keys: {
              p256dh: stableResult.p256dh,
              auth: stableResult.auth
            }
          },
          platform,
          user_id: user?.id || null
        };
        
        // Background upsert with retry
        upsertWithRetry(payload);
        
      } else {
        // Disable push notifications
        console.log('[WEBPUSH-TOGGLE] Disabling push notifications...');
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        
        if (subscription) {
          await subscription.unsubscribe();
          setIsEnabled(false);
          setSyncPending(false);
          console.log('[WEBPUSH-TOGGLE] Push notifications disabled');
        }
      }
    } catch (error) {
      console.error('[WEBPUSH-TOGGLE] ❌ Error:', error);
      
      // Only show error if subscription failed (not upsert)
      if (!isEnabled) {
        let errorMessage = 'Errore nell\'abilitare le notifiche push.';
        if (error instanceof Error) {
          if (error.message.includes('PWA mode') || error.message.includes('home screen')) {
            errorMessage = 'Aggiungi l\'app alla home screen per abilitare le notifiche.';
          } else if (error.message.includes('permission')) {
            errorMessage = 'Permessi notifiche negati.';
          } else if (error.message.includes('VAPID')) {
            errorMessage = 'Errore configurazione server.';
          } else if (error.message.includes('Page reloaded')) {
            // Don't show error for page reload
            return;
          }
        }
        
        alert(errorMessage + ' Riprova.');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Background upsert with retry
  const upsertWithRetry = async (payload: any, attempt = 1) => {
    const maxAttempts = 3;
    const delays = [500, 1000, 2000]; // Backoff delays
    
    try {
      setSyncPending(true);
      
      const response = await fetch('https://vkjrqirvdvjbemsfzxof.functions.supabase.co/webpush-upsert', {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      console.info(`upsert: status=${response.status}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      // Success
      setSyncPending(false);
      localStorage.setItem('lastUpsertStatus', `Success ${new Date().toLocaleTimeString()}`);
      localStorage.removeItem('lastUpsertError');
      console.log('[WEBPUSH-TOGGLE] ✅ Background upsert success');
      
    } catch (error) {
      console.error(`[WEBPUSH-TOGGLE] Upsert attempt ${attempt} failed:`, error);
      
      if (attempt < maxAttempts) {
        // Retry with backoff
        setTimeout(() => {
          upsertWithRetry(payload, attempt + 1);
        }, delays[attempt - 1]);
      } else {
        // Final failure - show sync pending but don't disable toggle
        setSyncPending(true);
        const errorMsg = `Server sync failed after ${maxAttempts} attempts`;
        localStorage.setItem('lastUpsertError', errorMsg);
        localStorage.removeItem('lastUpsertStatus');
        console.error('[WEBPUSH-TOGGLE] ❌ All upsert attempts failed, toggle remains ON');
      }
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
      <div className="flex items-center gap-2">
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
        
        {syncPending && (
          <span className="text-xs text-orange-600 font-medium">Server sync pending</span>
        )}
        
        <Button
          onClick={refreshStatus}
          variant="ghost"
          size="sm"
          className="h-8 px-2 text-xs"
          title="Refresh status"
        >
          <RefreshCw className="w-3 h-3" />
        </Button>
      </div>
      
      <div className="text-xs text-muted-foreground">
        <div>Subscribed: {isEnabled ? 'true' : 'false'}</div>
      </div>
      
      {/* Debug panel */}
      <div className="text-xs text-muted-foreground space-y-1 mt-2 p-2 bg-muted/20 rounded">
        <div>Controller: {diagnostics.controller ? '✅' : '❌'} | Ready: {diagnostics.readyScope || 'none'}</div>
        {diagnostics.endpointHost && (
          <div>Host: {diagnostics.endpointHost} | Platform: {diagnostics.platformResolved}</div>
        )}
        {diagnostics.lastUpsertStatus && (
          <div className="text-green-600">✅ {diagnostics.lastUpsertStatus}</div>
        )}
        {diagnostics.lastUpsertError && (
          <div className="text-red-600">❌ {diagnostics.lastUpsertError}</div>
        )}
      </div>
    </div>
  );
};

export default WebPushToggle;