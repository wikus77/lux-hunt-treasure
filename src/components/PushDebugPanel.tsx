import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, RefreshCw, Send, Bug, Zap } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useUnifiedPush } from '@/hooks/useUnifiedPush';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { looksLikeWebPushEndpoint, toDisplayableWebPush } from '@/lib/push/webpush';

const PushDebugPanel: React.FC = () => {
  const { user } = useAuth();
  const {
    isSupported,
    isSubscribed,
    permission,
    isLoading,
    error,
    token,
    subscription,
    webPushSubscription,
    subscriptionType,
    canSubscribe,
    subscribe,
    unsubscribe,
    checkStatus
  } = useUnifiedPush();
  
  const [testLoading, setTestLoading] = useState(false);

  const handleTestPush = async () => {
    if (!isSubscribed) {
      toast.error("Nessuna subscription attiva");
      return;
    }

    setTestLoading(true);
    try {
      let result;

      if (subscriptionType === 'fcm' && token && !looksLikeWebPushEndpoint(token)) {
        // FCM path
        console.log('🔥 [DEBUG] Testing FCM push...');
        result = await supabase.functions.invoke('fcm-test', {
          body: {
            token: token,
            title: 'M1SSION™ Test FCM',
            body: `FCM test alle ${new Date().toLocaleTimeString()}`
          }
        });
      } else if (subscriptionType === 'webpush' && webPushSubscription) {
        // Web Push path
        console.log('🌐 [DEBUG] Testing Web Push...');
        result = await supabase.functions.invoke('webpush-send', {
          body: {
            subscription: webPushSubscription,
            title: 'M1SSION™ Test WebPush',
            body: `WebPush test alle ${new Date().toLocaleTimeString()}`,
            data: { test: true, timestamp: Date.now() }
          }
        });
      } else {
        throw new Error('Nessuna subscription valida trovata');
      }

      if (result?.error) throw result.error;

      toast.success(`✅ Test Push Inviato (${subscriptionType?.toUpperCase()}) - Controlla le notifiche`);
    } catch (error) {
      console.error('Test push failed:', error);
      toast.error(`Errore Test Push: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`);
    } finally {
      setTestLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Testo copiato negli appunti");
    } catch (error) {
      console.error('Copy failed:', error);
      toast.error("Errore durante la copia");
    }
  };

  const getStatusColor = (status: boolean | null) => {
    if (status === null) return 'secondary';
    return status ? 'default' : 'destructive';
  };

  return (
    <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Bug className="w-5 h-5 mr-2" />
          Push Debug Panel - Unified System
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status Overview */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-white/70 text-sm">Browser Support:</span>
              <Badge variant={getStatusColor(isSupported)}>
                {isSupported ? 'Supported' : 'Not Supported'}
              </Badge>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-white/70 text-sm">Permission:</span>
              <Badge variant={permission === 'granted' ? 'default' : permission === 'denied' ? 'destructive' : 'secondary'}>
                {permission || 'Unknown'}
              </Badge>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-white/70 text-sm">Subscribed:</span>
              <Badge variant={getStatusColor(isSubscribed)}>
                {isSubscribed ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </div>

          <div className="space-y-3">
            {isSubscribed && (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Type:</span>
                  <Badge variant={subscriptionType === 'fcm' ? 'default' : 'secondary'}>
                    {subscriptionType?.toUpperCase() || 'N/A'}
                  </Badge>
                </div>
                
                {subscriptionType === 'fcm' && token && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">FCM Token:</span>
                    <span className="text-xs font-mono bg-muted px-2 py-1 rounded">
                      {token.slice(0, 20)}...
                    </span>
                  </div>
                )}
                
                {subscriptionType === 'webpush' && webPushSubscription && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Endpoint:</span>
                      <span className="text-xs font-mono bg-muted px-2 py-1 rounded">
                        {toDisplayableWebPush(webPushSubscription).endpointPrefix}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">p256dh:</span>
                      <span className="text-xs font-mono bg-muted px-2 py-1 rounded">
                        {toDisplayableWebPush(webPushSubscription).p256dhShort}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">auth:</span>
                      <span className="text-xs font-mono bg-muted px-2 py-1 rounded">
                        {toDisplayableWebPush(webPushSubscription).authShort}
                      </span>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-3">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={subscribe}
            disabled={isLoading || !canSubscribe || isSubscribed}
            variant="default"
            size="sm"
          >
            <Zap className="w-4 h-4 mr-2" />
            {isLoading ? 'Subscribing...' : 'Subscribe'}
          </Button>

          <Button
            onClick={unsubscribe}
            disabled={isLoading || !isSubscribed}
            variant="outline"
            size="sm"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Unsubscribe
          </Button>

          <Button
            onClick={handleTestPush}
            disabled={testLoading || !isSubscribed}
            variant="outline"
            size="sm"
          >
            <Send className="w-4 h-4 mr-2" />
            {testLoading ? 'Sending...' : `Test Push ${subscriptionType ? `(${subscriptionType.toUpperCase()})` : ''}`}
          </Button>

          <Button
            onClick={checkStatus}
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Status
          </Button>
        </div>

        {/* Technical Details */}
        <div className="border-t border-white/10 pt-4">
          <details className="text-white/70">
            <summary className="cursor-pointer text-sm font-medium mb-2">
              Technical Information
            </summary>
            <div className="space-y-2 text-xs">
              <div className="bg-gray-800/50 p-2 rounded">
                <strong>Platform:</strong> {navigator.platform}
              </div>
              <div className="bg-gray-800/50 p-2 rounded">
                <strong>User Agent:</strong>
                <div className="mt-1 break-all">{navigator.userAgent}</div>
              </div>
              {subscription && (
                <div className="bg-gray-800/50 p-2 rounded">
                  <strong>Subscription Endpoint:</strong>
                  <div className="mt-1 break-all font-mono">
                    {subscription.endpoint}
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="mt-2"
                    onClick={() => copyToClipboard(subscription.endpoint)}
                  >
                    <Copy className="w-3 h-3 mr-1" />
                    Copy Endpoint
                  </Button>
                </div>
              )}
            </div>
          </details>
        </div>
      </CardContent>
    </Card>
  );
};

export default PushDebugPanel;