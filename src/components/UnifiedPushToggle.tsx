/*
 * 🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™
 * M1SSION™ Unified Push Toggle Component
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, BellOff, Smartphone, Monitor, AlertCircle, CheckCircle } from 'lucide-react';
import { useUnifiedPush } from '@/hooks/useUnifiedPush';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { runRepairFlow } from '@/lib/push/repairFlow';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

/**
 * Helper: verifica se esiste una riga attiva per l'endpoint corrente
 */
async function backendHasActiveEndpoint(endpoint: string): Promise<boolean> {
  if (!endpoint) return false;
  try {
    const { count, error } = await supabase
      .from('webpush_subscriptions')
      .select('endpoint', { head: true, count: 'exact' })
      .eq('endpoint', endpoint)
      .eq('is_active', true);
    
    if (error) {
      console.warn('[PUSH] backendHasActiveEndpoint error:', error.message);
      return false;
    }
    return (count ?? 0) > 0;
  } catch (e) {
    console.warn('[PUSH] backendHasActiveEndpoint exception:', e);
    return false;
  }
}

interface UnifiedPushToggleProps {
  className?: string;
}

export const UnifiedPushToggle: React.FC<UnifiedPushToggleProps> = ({ className }) => {
  const {
    isSupported,
    permission,
    subscription,
    webPushSubscription,
    subscriptionType,
    isLoading,
    error,
    isSubscribed,
    canSubscribe,
    subscribe,
    requestPermission,
    unsubscribe,
    refresh,
  } = useUnifiedPush();

  const [isRepairLoading, setIsRepairLoading] = useState(false);

  const getPlatformIcon = () => {
    return <Monitor className="w-4 h-4" />;
  };

  const getPlatformLabel = () => {
    return 'Desktop';
  };

  const getSubscriptionTypeLabel = () => {
    return subscriptionType?.toUpperCase() || 'Unknown';
  };

  const getStatusColor = () => {
    if (isSubscribed) return 'text-success';
    if (permission === 'denied') return 'text-destructive';
    return 'text-muted-foreground';
  };

  const getStatusText = () => {
    if (isLoading) return 'Configurazione in corso...';
    if (isSubscribed) return `Attivo (${getSubscriptionTypeLabel()})`;
    if (permission === 'denied') return 'Permessi negati';
    if (permission === 'default') return 'Permessi richiesti';
    return 'Non attivo';
  };

  const handleToggle = async () => {
    setIsRepairLoading(true);
    try {
      // ⭐ Assicura che il SW sia pronto prima di leggere lo stato reale
      const reg = await navigator.serviceWorker?.ready.catch(() => null);
      const sub = reg ? await reg.pushManager.getSubscription() : null;

      if (isSubscribed) {
        // ⭐ VERIFY & REPAIR: se il backend NON conosce l'endpoint, NON fare unsubscribe: esegui REPAIR
        const known = sub ? await backendHasActiveEndpoint(sub.endpoint) : false;
        if (!known) {
          console.warn('[PUSH] Toggle ON→click: backend mismatch detected → running repairFlow');
          const result = await runRepairFlow();
          
          if (result.ok && result.subscription) {
            toast.success('Notifiche riparate e riattivate ✅');
            await refresh();
          } else {
            toast.error('Impossibile riparare la subscription');
          }
          return;
        }
        
        // Backend ok → normale unsubscribe
        await unsubscribe();
        await refresh();
        toast.success('Notifiche disattivate');
        return;
      }

      // OFF → ON: già corretto (ripara sempre)
      await navigator.serviceWorker.ready;
      const result = await runRepairFlow();
      
      if (result.ok && result.subscription) {
        toast.success('Notifiche attivate ✅');
        await refresh();
      } else {
        toast.error('Impossibile completare l\'attivazione (riprovare)');
      }
    } catch (error) {
      console.error('[UnifiedPushToggle] handleToggle error:', error);
      toast.error('Errore durante l\'operazione');
    } finally {
      setIsRepairLoading(false);
    }
  };

  if (!isSupported) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellOff className="w-5 h-5" />
            Notifiche Push
          </CardTitle>
          <CardDescription>
            Le notifiche push non sono supportate su questo dispositivo.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className={className} data-push-toggle-v1 data-push-toggle-repair="1">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Notifiche Push Unificate
        </CardTitle>
        <CardDescription>
          Sistema unificato per notifiche su tutti i dispositivi
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Display */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isSubscribed ? 'bg-success' : 'bg-muted-foreground'}`} />
            <span className={getStatusColor()}>{getStatusText()}</span>
          </div>
          
          {subscription && (
            <Badge variant="secondary" className="flex items-center gap-1">
              {getPlatformIcon()}
              {getPlatformLabel()}
            </Badge>
          )}
        </div>

        {/* Subscription Details */}
        {isSubscribed && (
          <div className="p-3 bg-muted/50 rounded-lg space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-success" />
              <span className="text-sm font-medium">Connesso</span>
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              <div>Tipo: {getSubscriptionTypeLabel()}</div>
              <div>Piattaforma: {getPlatformLabel()}</div>
              {subscription && (
                <div>Endpoint: {subscription.endpoint.substring(0, 30)}...</div>
              )}
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Permission Denied Help */}
        {permission === 'denied' && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Per attivare le notifiche, vai nelle impostazioni del browser e consenti le notifiche per questo sito.
            </AlertDescription>
          </Alert>
        )}

        {/* Toggle Switch */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="font-medium">
              {isSubscribed ? 'Disattiva' : 'Attiva'} Notifiche
            </div>
            <div className="text-sm text-muted-foreground">
              {isSubscribed 
                ? 'Riceverai notifiche push su questo dispositivo'
                : 'Attiva per ricevere notifiche push'
              }
            </div>
          </div>
          
          <Switch
            checked={isSubscribed}
            onCheckedChange={handleToggle}
            disabled={isLoading || isRepairLoading || (!canSubscribe && !isSubscribed)}
          />
        </div>

        {/* Manual Action Button */}
        {!isSubscribed && permission !== 'granted' && (
          <Button
            onClick={requestPermission}
            disabled={isLoading}
            className="w-full"
            variant="outline"
          >
            {isLoading ? 'Configurazione...' : 'Richiedi Permessi'}
          </Button>
        )}

        {/* Success State */}
        {isSubscribed && (
          <div className="text-center">
            <div className="text-success text-sm font-medium">
              ✅ Notifiche push attive e funzionanti!
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

/*
 * 🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */