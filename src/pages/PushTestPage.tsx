// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
// Push Notification Test Page - Production Only

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { isPushDisabled, disablePush, enablePush } from '@/utils/pushKillSwitch';

interface PushTestState {
  supported: boolean;
  permission: NotificationPermission | null;
  subscription: PushSubscription | null;
  isIOS: boolean;
  isPWA: boolean;
  swRegistration: ServiceWorkerRegistration | null;
}

const VAPID_PUBLIC = import.meta.env.VITE_VAPID_PUBLIC_KEY || 'BBjgzWK_1_PBZXGLQb-xQjSEUH5jLsNNgx8N0LgOcKUkZeCUaNV_gRE-QM5pKS2bPKUhVJLn0Q-H3BNGnOOjy8Q';

export default function PushTestPage() {
  const [state, setState] = useState<PushTestState>({
    supported: false,
    permission: null,
    subscription: null,
    isIOS: false,
    isPWA: false,
    swRegistration: null
  });
  
  const [loading, setLoading] = useState(false);
  const [testPayload, setTestPayload] = useState({
    title: 'M1SSION™ Test',
    body: '🚀 Push notification test successful!',
    url: '/'
  });

  // Feature detection
  useEffect(() => {
    const detect = async () => {
      const isSupported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
      const userAgent = navigator.userAgent.toLowerCase();
      const isIOS = /iphone|ipad|ipod/.test(userAgent);
      const isPWA = window.matchMedia('(display-mode: standalone)').matches || 
                     (navigator as any).standalone === true;
      
      let swReg: ServiceWorkerRegistration | null = null;
      let currentSub: PushSubscription | null = null;
      
      if (isSupported && !isPushDisabled()) {
        try {
          swReg = await navigator.serviceWorker.ready;
          currentSub = await swReg.pushManager.getSubscription();
        } catch (error) {
          console.warn('[PUSH-TEST] SW ready failed:', error);
        }
      }

      setState({
        supported: isSupported,
        permission: Notification.permission,
        subscription: currentSub,
        isIOS,
        isPWA,
        swRegistration: swReg
      });
    };

    detect();
  }, []);

  // Convert VAPID key from base64url to Uint8Array
  const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
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

  // Enable notifications
  const enableNotifications = async () => {
    if (isPushDisabled()) {
      toast.error('Push disabled by kill switch');
      return;
    }

    setLoading(true);
    try {
      // Request permission
      const permission = await Notification.requestPermission();
      
      if (permission !== 'granted') {
        toast.error('Permission denied');
        return;
      }

      // Wait for service worker with timeout
      if (!state.swRegistration) {
        const swPromise = navigator.serviceWorker.ready;
        const timeoutPromise = new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('SW timeout')), 8000)
        );
        
        const registration = await Promise.race([swPromise, timeoutPromise]);
        setState(prev => ({ ...prev, swRegistration: registration }));
      }

      // Subscribe to push
      const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC);
      const subscription = await state.swRegistration!.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey
      });

      // Save to Supabase with UNIFIED payload format
      const subscriptionJson = subscription.toJSON();
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.functions.invoke('push_subscribe', {
        body: {
          subscription: subscriptionJson, // Complete subscription with endpoint and keys
          user_id: user?.id || null,
          client: 'test_page',
          ua: navigator.userAgent,
          platform: state.isIOS ? 'iOS' : 'desktop'
        }
      });

      if (error) {
        console.error('Save subscription error:', error);
        toast.error('Failed to save subscription');
      } else {
        setState(prev => ({ 
          ...prev, 
          subscription, 
          permission: 'granted' 
        }));
        toast.success('Notifications enabled successfully!');
      }

    } catch (error) {
      console.error('Enable notifications error:', error);
      toast.error(`Failed to enable: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // Send test notification
  const sendTestNotification = async () => {
    if (!state.subscription) {
      toast.error('No subscription available');
      return;
    }

    setLoading(true);
    try {
      const subscriptionJson = state.subscription.toJSON();
      const { data, error } = await supabase.functions.invoke('push_send', {
        body: {
          endpoint: subscriptionJson.endpoint,
          payload: testPayload
        }
      });

      if (error) {
        console.error('Send test error:', error);
        toast.error('Failed to send test notification');
      } else {
        console.log('Send test success:', data);
        toast.success('Test notification sent! Check your device.');
      }

    } catch (error) {
      console.error('Send test error:', error);
      toast.error('Failed to send test notification');
    } finally {
      setLoading(false);
    }
  };

  // Only show in production
  if (!window.location.hostname.includes('m1ssion.eu') && !window.location.hostname.includes('m1ssion-pwa.pages.dev')) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">Push test page only available in production</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🔔 Push Notification Test
            {isPushDisabled() && <Badge variant="destructive">DISABLED</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status Display */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Browser Support</label>
              <Badge variant={state.supported ? "default" : "destructive"}>
                {state.supported ? "✅ Supported" : "❌ Not Supported"}
              </Badge>
            </div>
            
            <div>
              <label className="text-sm font-medium">Platform</label>
              <Badge variant="outline">
                {state.isIOS ? (state.isPWA ? "📱 iOS PWA" : "📱 iOS Web") : "🖥️ Desktop"}
              </Badge>
            </div>
            
            <div>
              <label className="text-sm font-medium">Permission</label>
              <Badge variant={
                state.permission === 'granted' ? "default" : 
                state.permission === 'denied' ? "destructive" : "secondary"
              }>
                {state.permission || "default"}
              </Badge>
            </div>
            
            <div>
              <label className="text-sm font-medium">Subscription</label>
              <Badge variant={state.subscription ? "default" : "secondary"}>
                {state.subscription ? "✅ Active" : "❌ None"}
              </Badge>
            </div>
          </div>

          {/* Kill Switch Controls */}
          <div className="p-4 border rounded-lg">
            <h3 className="font-medium mb-2">Kill Switch Controls</h3>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="destructive" 
                onClick={disablePush}
              >
                Disable Push
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={enablePush}
              >
                Enable Push
              </Button>
            </div>
          </div>

          {/* Enable Button */}
          {state.supported && !state.subscription && !isPushDisabled() && (
            <Button 
              onClick={enableNotifications}
              disabled={loading}
              className="w-full"
            >
              {loading ? "Enabling..." : "🔔 Enable Notifications"}
            </Button>
          )}

          {/* Subscription JSON */}
          {state.subscription && (
            <div>
              <label className="text-sm font-medium mb-2 block">Subscription JSON</label>
              <Textarea
                value={JSON.stringify(state.subscription.toJSON(), null, 2)}
                readOnly
                className="font-mono text-xs"
                rows={8}
              />
            </div>
          )}

          {/* Test Payload */}
          {state.subscription && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Test Payload</label>
              <Input
                placeholder="Title"
                value={testPayload.title}
                onChange={(e) => setTestPayload(prev => ({ ...prev, title: e.target.value }))}
              />
              <Input
                placeholder="Body"
                value={testPayload.body}
                onChange={(e) => setTestPayload(prev => ({ ...prev, body: e.target.value }))}
              />
              <Input
                placeholder="URL"
                value={testPayload.url}
                onChange={(e) => setTestPayload(prev => ({ ...prev, url: e.target.value }))}
              />
              <Button 
                onClick={sendTestNotification}
                disabled={loading}
                className="w-full"
              >
                {loading ? "Sending..." : "🚀 Send Test"}
              </Button>
            </div>
          )}

          {/* Debug Info */}
          <details className="text-xs">
            <summary className="cursor-pointer font-medium">Debug Info</summary>
            <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
              {JSON.stringify({
                userAgent: navigator.userAgent,
                standalone: (navigator as any).standalone,
                displayMode: window.matchMedia('(display-mode: standalone)').matches,
                pushDisabled: isPushDisabled(),
                vapidKey: VAPID_PUBLIC.substring(0, 20) + '...'
              }, null, 2)}
            </pre>
          </details>
        </CardContent>
      </Card>
    </div>
  );
}