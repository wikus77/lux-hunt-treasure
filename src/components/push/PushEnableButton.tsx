// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
/* Push Notification Enable Button Component */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useWebPush, type PushTestOptions } from '@/hooks/useWebPush';
import { Bell, BellOff, Send, Loader2, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

// VAPID Public Key - safe to expose in frontend
const VAPID_PUBLIC_KEY = 'BMkETBgIgFEj0MOINyixtfrde9ZiMbj-5YEtsX8GpnuXpABax28h6dLjmJ7RK6rlZXUJg1N_z3ba0X6E7Qmjj7A';

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
  const {
    isSupported,
    isSubscribed,
    isLoading,
    permission,
    subscribe,
    saveSubscription,
    testPush,
    checkSubscription
  } = useWebPush();

  const [subscriptionData, setSubscriptionData] = useState<any>(null);
  const [testLoading, setTestLoading] = useState(false);

  // Check subscription status on mount
  useEffect(() => {
    checkSubscription().then(sub => {
      if (sub) {
        setSubscriptionData(sub);
        onSubscriptionChange?.(true);
      }
    });
  }, [checkSubscription, onSubscriptionChange]);

  const handleEnablePush = async () => {
    if (!isSupported) {
      toast({
        title: "❌ Non supportato",
        description: "Il tuo browser non supporta le notifiche push",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log('[PushEnableButton] Starting push enable process...');
      
      // Step 1: Subscribe to push notifications
      const subscription = await subscribe(VAPID_PUBLIC_KEY);
      console.log('[PushEnableButton] Subscription created:', subscription);

      // Step 2: Save subscription to server
      const saveResult = await saveSubscription(subscription, { 
        user_id: userId 
      });
      console.log('[PushEnableButton] Subscription saved:', saveResult);

      setSubscriptionData(subscription);
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
      
      const testOptions: PushTestOptions = {
        endpoint: subscriptionData.endpoint,
        user_id: userId,
        title: 'M1SSION™ Test ✅',
        body: 'Notifica di prova inviata con successo!',
        url: '/home'
      };

      const result = await testPush(testOptions);
      console.log('[PushEnableButton] Test push result:', result);

      if (result?.sent > 0) {
        toast({
          title: "🚀 Test inviato!",
          description: `Notifica inviata con successo (${result.sent} inviate)`,
          variant: "default"
        });
      } else {
        toast({
          title: "⚠️ Nessuna notifica inviata",
          description: `Risultato: ${result?.note || 'Motivo sconosciuto'}`,
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
            showTestButton && (
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
            )
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