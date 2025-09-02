// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
/* Push Debug Page */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RefreshCw, Smartphone, Monitor, AlertCircle, CheckCircle, Send } from 'lucide-react';
import { toast } from 'sonner';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { getVAPIDKeyInfo } from '@/lib/vapid';
import { supabase } from '@/integrations/supabase/client';

interface ServiceWorkerInfo {
  scriptURL: string;
  state: string;
  scope: string;
}

export default function PushDebug() {
  const {
    isSupported,
    permission,
    isSubscribed,
    loading,
    platform,
    endpointShort,
    requestPermission,
    subscribe,
    unsubscribe
  } = usePushNotifications();

  const [swInfo, setSwInfo] = useState<ServiceWorkerInfo[]>([]);
  const [subscriptionJSON, setSubscriptionJSON] = useState<string>('');
  const [vapidInfo, setVapidInfo] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Refresh all debug info
  const refreshDebugInfo = async () => {
    setRefreshing(true);
    
    try {
      // Get service worker registrations
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        const swData = registrations.map(reg => ({
          scriptURL: reg.active?.scriptURL || reg.installing?.scriptURL || reg.waiting?.scriptURL || 'No script',
          state: reg.active?.state || 'inactive',
          scope: reg.scope
        }));
        setSwInfo(swData);

        // Get current subscription JSON
        try {
          const registration = await navigator.serviceWorker.ready;
          const subscription = await registration.pushManager.getSubscription();
          if (subscription) {
            setSubscriptionJSON(JSON.stringify(subscription.toJSON(), null, 2));
          } else {
            setSubscriptionJSON('No active subscription');
          }
        } catch (error) {
          setSubscriptionJSON(`Error getting subscription: ${error}`);
        }
      }

      // Get VAPID info
      setVapidInfo(getVAPIDKeyInfo());
      
    } catch (error) {
      console.error('Error refreshing debug info:', error);
      toast.error('Error refreshing debug info');
    } finally {
      setRefreshing(false);
    }
  };

  // Test push notification via edge function
  const testPushNotification = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (!subscription) {
        toast.error('No subscription found. Enable notifications first.');
        return;
      }

      console.log('Testing push with endpoint:', subscription.endpoint.substring(0, 50) + '...');

      const { data, error } = await supabase.functions.invoke('send-push-canary', {
        body: {
          endpoint: subscription.endpoint,
          title: 'M1SSION™ Debug Test ✅',
          body: 'Push notification system is working perfectly!',
          link: '/push-debug'
        }
      });

      if (error) {
        console.error('Push send error:', error);
        toast.error(`Push failed: ${error.message}`);
        return;
      }

      console.log('Push result:', data);
      
      const sent = data.sent || 0;
      const failed = data.failed || 0;
      
      if (failed === 0 && sent > 0) {
        toast.success(`✅ Test successful! Sent: ${sent}`);
      } else {
        toast.error(`❌ Test failed! Sent: ${sent}, Failed: ${failed}`);
      }

    } catch (error) {
      console.error('Push test error:', error);
      toast.error(`Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Copy subscription to clipboard
  const copySubscription = async () => {
    try {
      await navigator.clipboard.writeText(subscriptionJSON);
      toast.success('Subscription JSON copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  useEffect(() => {
    refreshDebugInfo();
  }, []);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">🔧 Push Debug Console</h1>
        <Button onClick={refreshDebugInfo} disabled={refreshing} variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Platform & Support Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {platform === 'ios_pwa' ? <Smartphone className="h-5 w-5" /> : <Monitor className="h-5 w-5" />}
            Platform & Support
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Platform</p>
              <Badge variant={platform === 'ios_pwa' ? 'default' : 'secondary'}>
                {platform}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Push Support</p>
              <Badge variant={isSupported ? 'default' : 'destructive'}>
                {isSupported ? 'Supported' : 'Not Supported'}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Permission</p>
              <Badge variant={permission === 'granted' ? 'default' : permission === 'denied' ? 'destructive' : 'secondary'}>
                {permission || 'Unknown'}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Subscribed</p>
              <Badge variant={isSubscribed ? 'default' : 'secondary'}>
                {isSubscribed ? 'Yes' : 'No'}
              </Badge>
            </div>
          </div>
          
          {endpointShort && (
            <div>
              <p className="text-sm text-muted-foreground">Endpoint</p>
              <p className="text-sm font-mono bg-muted p-2 rounded">{endpointShort}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Service Workers */}
      <Card>
        <CardHeader>
          <CardTitle>Service Workers</CardTitle>
        </CardHeader>
        <CardContent>
          {swInfo.length === 0 ? (
            <p className="text-muted-foreground">No service workers found</p>
          ) : (
            <div className="space-y-3">
              {swInfo.map((sw, index) => (
                <div key={index} className="border rounded p-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium">{sw.scriptURL.split('/').pop()}</p>
                    <Badge variant={sw.state === 'activated' ? 'default' : 'secondary'}>
                      {sw.state}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">Scope: {sw.scope}</p>
                  <p className="text-xs text-muted-foreground font-mono">{sw.scriptURL}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* VAPID Key Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {vapidInfo?.valid ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-500" />
            )}
            VAPID Key Validation
          </CardTitle>
        </CardHeader>
        <CardContent>
          {vapidInfo ? (
            <div className="space-y-2">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant={vapidInfo.valid ? 'default' : 'destructive'}>
                    {vapidInfo.valid ? 'Valid' : 'Invalid'}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Length</p>
                  <p className="text-sm font-mono">{vapidInfo.length || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">First Byte</p>
                  <p className="text-sm font-mono">{vapidInfo.firstByte || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Key Length</p>
                  <p className="text-sm font-mono">{vapidInfo.fullLength}</p>
                </div>
              </div>
              
              {vapidInfo.error && (
                <div className="bg-destructive/10 border border-destructive/20 p-3 rounded">
                  <p className="text-sm text-destructive">{vapidInfo.error}</p>
                </div>
              )}
              
              <div>
                <p className="text-sm text-muted-foreground">Key Preview</p>
                <p className="text-sm font-mono bg-muted p-2 rounded">{vapidInfo.keyPreview}</p>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">Loading VAPID info...</p>
          )}
        </CardContent>
      </Card>

      {/* Subscription JSON */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Current Subscription
            {subscriptionJSON && subscriptionJSON !== 'No active subscription' && (
              <Button onClick={copySubscription} variant="outline" size="sm">
                Copy JSON
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs bg-muted p-4 rounded overflow-auto max-h-64">
            {subscriptionJSON || 'Loading...'}
          </pre>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {permission !== 'granted' && (
              <Button onClick={requestPermission} disabled={loading}>
                Request Permission
              </Button>
            )}
            
            {platform === 'ios_pwa' ? (
              <Button 
                onClick={subscribe} 
                disabled={loading || permission !== 'granted'}
                variant={isSubscribed ? 'outline' : 'default'}
              >
                {isSubscribed ? 'Resubscribe iOS (VAPID)' : 'Subscribe iOS (VAPID)'}
              </Button>
            ) : (
              <Button 
                onClick={subscribe} 
                disabled={loading || permission !== 'granted'}
                variant={isSubscribed ? 'outline' : 'default'}
              >
                {isSubscribed ? 'Resubscribe Desktop' : 'Subscribe Desktop'}
              </Button>
            )}
            
            <Button 
              onClick={testPushNotification}
              disabled={!isSubscribed}
              variant="secondary"
              className="flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              Send Test (Edge Function)
            </Button>
          </div>
          
          <Separator />
          
          <div className="flex gap-4">
            {isSubscribed && (
              <Button onClick={unsubscribe} disabled={loading} variant="destructive">
                Unsubscribe
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}