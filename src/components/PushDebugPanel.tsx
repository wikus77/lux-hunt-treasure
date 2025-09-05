import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, RefreshCw, Send, Bug } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DebugInfo {
  permission: NotificationPermission | null;
  serviceWorkerReady: boolean;
  tokenPrefix: string;
  platform: string;
  vapidKey: string;
  userAgent: string;
  isPWA: boolean;
  endpoint: string;
}

const PushDebugPanel: React.FC = () => {
  const { user } = useAuth();
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({
    permission: null,
    serviceWorkerReady: false,
    tokenPrefix: 'N/A',
    platform: 'unknown',
    vapidKey: '',
    userAgent: '',
    isPWA: false,
    endpoint: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    refreshDebugInfo();
  }, []);

  const refreshDebugInfo = async () => {
    console.log('🔧 [PushDebugPanel] Refreshing debug info...');
    
    const info: DebugInfo = {
      permission: 'Notification' in window ? Notification.permission : null,
      serviceWorkerReady: false,
      tokenPrefix: 'N/A',
      platform: detectPlatform(),
      vapidKey: 'BLT_uexaFBpPEX-VqzPy9U-7zMW-vVUGOajLUbL6Ny9eXOhO6Y1nMOaWgJCEKCZzG8X2z6WzXPFOA5MxzJ7Q-o8',
      userAgent: navigator.userAgent,
      isPWA: (window.matchMedia?.('(display-mode: standalone)').matches) || 
             (navigator as any).standalone === true,
      endpoint: ''
    };

    // Check service worker
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        info.serviceWorkerReady = !!registration;
        
        // Get existing subscription
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          info.tokenPrefix = subscription.endpoint.substring(0, 30) + '...';
          info.endpoint = subscription.endpoint;
        }
      } catch (error) {
        console.error('SW check failed:', error);
      }
    }

    setDebugInfo(info);
    console.log('🔧 [PushDebugPanel] Debug info updated:', info);
  };

  const detectPlatform = (): string => {
    const ua = navigator.userAgent.toLowerCase();
    if (/ipad|iphone|ipod/.test(ua)) return 'ios';
    if (/android/.test(ua)) return 'android';
    return 'desktop';
  };

  const regenerateToken = async () => {
    if (!user) {
      toast.error('Utente non autenticato');
      return;
    }

    setLoading(true);
    try {
      // Force new subscription
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        const existingSubscription = await registration.pushManager.getSubscription();
        
        if (existingSubscription) {
          await existingSubscription.unsubscribe();
          console.log('🗑️ Old subscription removed');
        }

        // Create new subscription
        const vapidKey = debugInfo.vapidKey;
        const applicationServerKey = urlBase64ToUint8Array(vapidKey);
        
        const newSubscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: applicationServerKey,
        });

        console.log('✅ New subscription created:', newSubscription.endpoint);
        
        // Save to database
        const result = await supabase.functions.invoke('upsert_fcm_subscription', {
          body: {
            user_id: user.id,
            token: newSubscription.endpoint,
            platform: debugInfo.platform,
            device_info: {
              ua: navigator.userAgent,
              regenerated: true,
              timestamp: new Date().toISOString()
            }
          }
        });

        if (result.error) {
          throw new Error(result.error.message);
        }

        toast.success('Token rigenerato con successo');
        await refreshDebugInfo();
      }
    } catch (error) {
      console.error('Token regeneration failed:', error);
      toast.error(`Errore: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const sendTestNotification = async () => {
    if (!user) {
      toast.error('Utente non autenticato');
      return;
    }

    setLoading(true);
    try {
      const result = await supabase.functions.invoke('fcm-test', {
        body: { userId: user.id }
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      toast.success('Notifica test inviata');
    } catch (error) {
      console.error('Test notification failed:', error);
      toast.error(`Errore: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copiato negli appunti');
  };

  // Helper function
  const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
  };

  return (
    <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Bug className="w-5 h-5 mr-2" />
          Debug Push Notifications
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-white/70 text-sm">Permission:</span>
              <Badge variant={debugInfo.permission === 'granted' ? 'default' : 'destructive'}>
                {debugInfo.permission || 'N/A'}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-white/70 text-sm">SW Ready:</span>
              <Badge variant={debugInfo.serviceWorkerReady ? 'default' : 'destructive'}>
                {debugInfo.serviceWorkerReady ? 'Yes' : 'No'}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-white/70 text-sm">Platform:</span>
              <Badge variant="outline">{debugInfo.platform}</Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-white/70 text-sm">PWA:</span>
              <Badge variant={debugInfo.isPWA ? 'default' : 'secondary'}>
                {debugInfo.isPWA ? 'Yes' : 'No'}
              </Badge>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="space-y-1">
              <span className="text-white/70 text-sm">Token Prefix:</span>
              <div className="flex items-center space-x-2">
                <code className="bg-gray-800 px-2 py-1 rounded text-xs text-green-400 flex-1">
                  {debugInfo.tokenPrefix}
                </code>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(debugInfo.endpoint)}
                  disabled={!debugInfo.endpoint}
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            </div>
            
            <div className="space-y-1">
              <span className="text-white/70 text-sm">VAPID Key:</span>
              <div className="flex items-center space-x-2">
                <code className="bg-gray-800 px-2 py-1 rounded text-xs text-blue-400 flex-1">
                  {debugInfo.vapidKey.substring(0, 20)}...
                </code>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(debugInfo.vapidKey)}
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex space-x-2">
          <Button
            onClick={refreshDebugInfo}
            variant="outline"
            size="sm"
            disabled={loading}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          
          <Button
            onClick={regenerateToken}
            variant="outline"
            size="sm"
            disabled={loading || !user}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Regenera Token
          </Button>
          
          <Button
            onClick={sendTestNotification}
            variant="outline"
            size="sm"
            disabled={loading || !user}
          >
            <Send className="w-4 h-4 mr-2" />
            Test Push
          </Button>
        </div>

        <div className="border-t border-white/10 pt-3">
          <details className="text-white/70">
            <summary className="cursor-pointer text-sm font-medium">User Agent</summary>
            <code className="text-xs bg-gray-800 p-2 rounded mt-2 block break-all">
              {debugInfo.userAgent}
            </code>
          </details>
        </div>
      </CardContent>
    </Card>
  );
};

export default PushDebugPanel;