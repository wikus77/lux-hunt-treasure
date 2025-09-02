// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
/* Push Notification Enable Button Component */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { enableWebPush } from '@/lib/push/enableWebPush';
import { disableWebPush } from '@/lib/push/disableWebPush';
import { supabase } from '@/integrations/supabase/client';
import { Bell, BellOff, Send, Loader2, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

// VAPID Public Key - UNIFIED FROM ENV
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || 'BBjgzWK_1_PBZXGLQb-xQjSEUH5jLsNNgx8N0LgOcKUkZeCUaNV_gRE-QM5pKS2bPKUhVJLn0Q-H3BNGnOOjy8Q';

interface PushEnableButtonProps {
  userId?: string;
  onSubscriptionChange?: (subscribed: boolean) => void;
  showTestButton?: boolean;
  className?: string;
}

export function PushEnableButton({ 
  userId, 
  onSubscriptionChange,
  showTestButton = true,
  className = ''
}: PushEnableButtonProps) {
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriptionData, setSubscriptionData] = useState<any>(null);
  const [testLoading, setTestLoading] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof window !== 'undefined' ? Notification.permission : 'default'
  );

  // Check browser support
  const isSupported = typeof window !== 'undefined' && 
    'serviceWorker' in navigator && 
    'PushManager' in window && 
    'Notification' in window;

  // Check subscription status on mount
  useEffect(() => {
    const checkSubscription = async () => {
      if (!isSupported) return;
      
      try {
        const reg = await navigator.serviceWorker.ready;
        const subscription = await reg.pushManager.getSubscription();
        
        if (subscription) {
          const subscriptionData = subscription.toJSON();
          setSubscriptionData(subscriptionData);
          setIsSubscribed(true);
          onSubscriptionChange?.(true);
        } else {
          setIsSubscribed(false);
          setSubscriptionData(null);
          onSubscriptionChange?.(false);
        }
        
        setPermission(Notification.permission);
      } catch (error) {
        console.error('[PushEnableButton] Error checking subscription:', error);
        setIsSubscribed(false);
        setSubscriptionData(null);
        onSubscriptionChange?.(false);
      }
    };
    
    checkSubscription();
  }, [isSupported, onSubscriptionChange]);

  const handleEnablePush = async () => {
    if (!isSupported) {
      toast({
        title: "❌ Non supportato",
        description: "Il tuo browser non supporta le notifiche push",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log('[PushEnableButton] Starting W3C push enable process...');
      
      // Use our new W3C enableWebPush function
      const subscription = await enableWebPush();
      console.log('[PushEnableButton] Subscription created:', subscription);

      const subscriptionData = subscription.toJSON();
      setSubscriptionData(subscriptionData);
      setIsSubscribed(true);
      onSubscriptionChange?.(true);

      toast({
        title: "✅ Notifiche attivate!",
        description: "Riceverai le notifiche push di M1SSION™",
        variant: "default"
      });

    } catch (error: any) {
      console.error('[PushEnableButton] Enable push failed:', error);
      
      let errorMessage = 'Errore sconosciuto';
      if (error.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }

      toast({
        title: "❌ Errore",
        description: `Impossibile attivare le notifiche: ${errorMessage}`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisablePush = async () => {
    setIsLoading(true);

    try {
      console.log('[PushEnableButton] Disabling push notifications...');
      
      await disableWebPush();
      
      setSubscriptionData(null);
      setIsSubscribed(false);
      onSubscriptionChange?.(false);

      toast({
        title: "🔕 Notifiche disattivate",
        description: "Non riceverai più notifiche push",
        variant: "default"
      });

    } catch (error: any) {
      console.error('[PushEnableButton] Disable push failed:', error);
      
      toast({
        title: "❌ Errore",
        description: `Impossibile disattivare le notifiche: ${error.message || error}`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestPush = async () => {
    if (!subscriptionData) {
      toast({
        title: "⚠️ Attenzione",
        description: "Prima devi attivare le notifiche push",
        variant: "default"
      });
      return;
    }

    setTestLoading(true);

    try {
      console.log('[PushEnableButton] Sending test push...');
      
      const testPayload = {
        endpoint: subscriptionData.endpoint,
        title: 'M1SSION™ Test ✅',
        body: 'Notifica di prova inviata con successo!',
        data: { url: '/settings', src: 'push-enable-button' }
      };

      const { data, error } = await supabase.functions.invoke('push_send', {
        body: testPayload
      });

      if (error) {
        throw new Error(error.message);
      }

      console.log('[PushEnableButton] Test push result:', data);

      if (data?.sent > 0) {
        toast({
          title: "🚀 Test inviato!",
          description: `Notifica inviata con successo (${data.sent} inviate)`,
          variant: "default"
        });
      } else {
        toast({
          title: "⚠️ Nessuna notifica inviata",
          description: `Risultato: ${data?.note || 'Motivo sconosciuto'}`,
          variant: "default"
        });
      }

    } catch (error: any) {
      console.error('[PushEnableButton] Test push failed:', error);
      
      toast({
        title: "❌ Test fallito",
        description: `Errore nell'invio: ${error.message || error}`,
        variant: "destructive"
      });
    } finally {
      setTestLoading(false);
    }
  };

  const getPermissionBadge = () => {
    switch (permission) {
      case 'granted':
        return <Badge variant="secondary" className="gap-1"><CheckCircle className="h-3 w-3" />Consentite</Badge>;
      case 'denied':
        return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" />Negate</Badge>;
      default:
        return <Badge variant="outline" className="gap-1"><AlertTriangle className="h-3 w-3" />In attesa</Badge>;
    }
  };

  if (!isSupported) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellOff className="h-5 w-5" />
            Push Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">
            Il tuo browser non supporta le notifiche push.
          </p>
          <Badge variant="destructive">Non supportato</Badge>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Push Notifications
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Stato permessi:</span>
          {getPermissionBadge()}
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Sottoscrizione:</span>
          <Badge variant={isSubscribed ? "secondary" : "outline"}>
            {isSubscribed ? 'Attiva' : 'Non attiva'}
          </Badge>
        </div>

        {subscriptionData && (
          <div className="text-xs text-muted-foreground">
            <p className="font-mono break-all">
              Endpoint: {subscriptionData.endpoint.substring(0, 50)}...
            </p>
          </div>
        )}

        <div className="flex gap-2">
          {!isSubscribed ? (
            <Button 
              onClick={handleEnablePush}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Bell className="h-4 w-4 mr-2" />
              )}
              Attiva notifiche
            </Button>
          ) : (
            <div className="flex gap-2 w-full">
              {showTestButton && (
                <Button
                  onClick={handleTestPush}
                  disabled={testLoading}
                  variant="outline"
                  className="flex-1"
                >
                  {testLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  Invia test
                </Button>
              )}
              <Button
                onClick={handleDisablePush}
                disabled={isLoading}
                variant="destructive"
                className={showTestButton ? "flex-1" : "w-full"}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <BellOff className="h-4 w-4 mr-2" />
                )}
                Disattiva
              </Button>
            </div>
          )}
        </div>

        {process.env.NODE_ENV === 'development' && subscriptionData && (
          <details className="text-xs">
            <summary className="cursor-pointer text-muted-foreground">Debug Info</summary>
            <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
              {JSON.stringify({
                endpoint: subscriptionData.endpoint,
                keys: subscriptionData.keys,
                permission,
                isSubscribed,
                userId
              }, null, 2)}
            </pre>
          </details>
        )}
      </CardContent>
    </Card>
  );
}