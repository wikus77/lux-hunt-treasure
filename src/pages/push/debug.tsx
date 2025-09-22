// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
// Push Notification Diagnostics Page

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { canUseNotifications, canUseServiceWorker, isIOSDevice, isPWAMode, isAppleWebPush, getPlatformInfo, detectPushProvider } from '@/utils/push/support';
import { supabase } from '@/integrations/supabase/client';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';

const PushDebugPage = () => {
  const [diagnostics, setDiagnostics] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useUnifiedAuth();

  useEffect(() => {
    runDiagnostics();
  }, []);

  const runDiagnostics = async () => {
    setLoading(true);
    
    try {
      const platform = getPlatformInfo();
      
      // Get current subscription
      let currentSub = null;
      let swRegistration = null;
      let pushSubscription = null;
      
      if (canUseServiceWorker()) {
        try {
          swRegistration = await navigator.serviceWorker.ready;
          pushSubscription = await swRegistration.pushManager.getSubscription();
          
          if (pushSubscription) {
            currentSub = {
              endpoint: pushSubscription.endpoint,
              provider: detectPushProvider(pushSubscription.endpoint),
              host: new URL(pushSubscription.endpoint).host,
              hasKeys: !!(pushSubscription.getKey('p256dh') && pushSubscription.getKey('auth'))
            };
          }
        } catch (error) {
          console.error('SW diagnostic error:', error);
        }
      }

      // Get saved subscriptions from DB
      let dbSubscriptions = [];
      if (user) {
        const { data } = await supabase
          .from('push_subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        dbSubscriptions = data || [];
      }

      const diag = {
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        platform,
        features: {
          canUseNotifications: canUseNotifications(),
          canUseServiceWorker: canUseServiceWorker(),
          isIOSDevice: isIOSDevice(),
          isPWAMode: isPWAMode(),
          isAppleWebPush: isAppleWebPush()
        },
        permission: platform.permission,
        serviceWorker: {
          supported: 'serviceWorker' in navigator,
          ready: !!swRegistration,
          pushManager: !!(swRegistration?.pushManager)
        },
        currentSubscription: currentSub,
        dbSubscriptions,
        navigator: {
          standalone: (navigator as any).standalone,
          platform: navigator.platform,
          maxTouchPoints: navigator.maxTouchPoints
        }
      };

      setDiagnostics(diag);
      setSubscription(currentSub);
    } catch (error) {
      console.error('Diagnostics error:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatusBadge = ({ condition, trueText = 'OK', falseText = 'NO' }: any) => (
    <Badge variant={condition ? 'default' : 'destructive'}>
      {condition ? `✅ ${trueText}` : `❌ ${falseText}`}
    </Badge>
  );

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Caricamento diagnostica...</div>
      </div>
    );
  }

  if (!diagnostics) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center text-red-500">Errore durante la diagnostica</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">🔧 Push Debug</h1>
        <Button onClick={runDiagnostics} variant="outline">
          Aggiorna
        </Button>
      </div>

      {/* Platform Detection */}
      <Card>
        <CardHeader>
          <CardTitle>📱 Platform Detection</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <strong>Platform:</strong> {diagnostics.platform.platform}
            </div>
            <div>
              <strong>Permission:</strong> {diagnostics.platform.permission || 'null'}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <StatusBadge condition={diagnostics.features.canUseNotifications} trueText="Notifications" falseText="No Notifications" />
            <StatusBadge condition={diagnostics.features.canUseServiceWorker} trueText="Service Worker" falseText="No SW" />
            <StatusBadge condition={diagnostics.features.isIOSDevice} trueText="iOS Device" falseText="Not iOS" />
            <StatusBadge condition={diagnostics.features.isPWAMode} trueText="PWA Mode" falseText="Browser Mode" />
            <StatusBadge condition={diagnostics.features.isAppleWebPush} trueText="Apple Web Push" falseText="Standard Push" />
          </div>
        </CardContent>
      </Card>

      {/* Current Subscription */}
      <Card>
        <CardHeader>
          <CardTitle>🔔 Current Subscription</CardTitle>
        </CardHeader>
        <CardContent>
          {subscription ? (
            <div className="space-y-2">
              <div><strong>Provider:</strong> {subscription.provider}</div>
              <div><strong>Host:</strong> {subscription.host}</div>
              <div><strong>Has Keys:</strong> {subscription.hasKeys ? '✅' : '❌'}</div>
              <div className="text-xs text-gray-500 break-all">
                <strong>Endpoint:</strong> {subscription.endpoint.substring(0, 100)}...
              </div>
            </div>
          ) : (
            <div className="text-gray-500">Nessuna subscription attiva</div>
          )}
        </CardContent>
      </Card>

      {/* Database Subscriptions */}
      <Card>
        <CardHeader>
          <CardTitle>💾 Database Subscriptions ({diagnostics.dbSubscriptions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {diagnostics.dbSubscriptions.length > 0 ? (
            <div className="space-y-2">
              {diagnostics.dbSubscriptions.map((sub: any, idx: number) => (
                <div key={idx} className="p-2 border rounded text-sm">
                  <div className="flex justify-between">
                    <span><strong>Provider:</strong> {sub.provider || 'unknown'}</span>
                    <span className="text-gray-500">{new Date(sub.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="text-xs text-gray-500 break-all">
                    {sub.endpoint.substring(0, 80)}...
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500">Nessuna subscription nel database</div>
          )}
        </CardContent>
      </Card>

      {/* Raw Data */}
      <Card>
        <CardHeader>
          <CardTitle>🔍 Raw Diagnostics</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto max-h-96">
            {JSON.stringify(diagnostics, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
};

export default PushDebugPage;