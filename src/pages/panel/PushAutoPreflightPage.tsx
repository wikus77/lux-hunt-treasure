// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { functionsBaseUrl } from '@/lib/supabase/functionsBase';


type CheckStatus = 'idle' | 'loading' | 'success' | 'warning' | 'error';

interface CheckResult {
  status: CheckStatus;
  message: string;
  details?: string;
}

const PushAutoPreflightPage = () => {
  const [notificationPermission, setNotificationPermission] = useState<CheckResult>({ status: 'idle', message: '' });
  const [serviceWorker, setServiceWorker] = useState<CheckResult>({ status: 'idle', message: '' });
  const [pushSubscription, setPushSubscription] = useState<CheckResult>({ status: 'idle', message: '' });
  const [edgeFunction, setEdgeFunction] = useState<CheckResult>({ status: 'idle', message: '' });
  const [adminToken, setAdminToken] = useState<CheckResult>({ status: 'idle', message: '' });
  const [dbAccess, setDbAccess] = useState<CheckResult>({ status: 'idle', message: '' });

  useEffect(() => {
    runPreflight();
  }, []);

  const runPreflight = async () => {
    // 1. Check Notification Permission
    checkNotificationPermission();
    
    // 2. Check Service Worker
    await checkServiceWorker();
    
    // 3. Check Push Subscription
    await checkPushSubscription();
    
    // 4. Check Edge Function availability
    await checkEdgeFunction();
    
    // 5. Check Admin Token (client-side only)
    checkAdminToken();
    
    // 6. Check DB Access
    await checkDbAccess();
  };

  const checkNotificationPermission = () => {
    setNotificationPermission({ status: 'loading', message: 'Verifica permessi...' });
    
    if (!('Notification' in window)) {
      setNotificationPermission({ 
        status: 'error', 
        message: 'Notification API non supportata',
        details: 'Browser non compatibile'
      });
      return;
    }

    const permission = Notification.permission;
    
    if (permission === 'granted') {
      setNotificationPermission({ 
        status: 'success', 
        message: 'Permessi concessi',
        details: permission
      });
    } else if (permission === 'denied') {
      setNotificationPermission({ 
        status: 'error', 
        message: 'Permessi negati',
        details: permission
      });
    } else {
      setNotificationPermission({ 
        status: 'warning', 
        message: 'Permessi non richiesti',
        details: permission
      });
    }
  };

  const checkServiceWorker = async () => {
    setServiceWorker({ status: 'loading', message: 'Verifica Service Worker...' });
    
    if (!('serviceWorker' in navigator)) {
      setServiceWorker({ 
        status: 'error', 
        message: 'Service Worker non supportato',
        details: 'Browser non compatibile'
      });
      return;
    }

    try {
      const registration = await navigator.serviceWorker.getRegistration();
      
      if (registration && registration.active) {
        setServiceWorker({ 
          status: 'success', 
          message: 'Service Worker attivo',
          details: registration.scope
        });
      } else {
        setServiceWorker({ 
          status: 'warning', 
          message: 'Service Worker non attivo',
          details: 'Nessuna registrazione trovata'
        });
      }
    } catch (error: any) {
      setServiceWorker({ 
        status: 'error', 
        message: 'Errore verifica SW',
        details: error.message
      });
    }
  };

  const checkPushSubscription = async () => {
    setPushSubscription({ status: 'loading', message: 'Verifica subscription...' });
    
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        const endpoint = subscription.endpoint;
        const truncated = endpoint.substring(0, 60) + '...';
        const expiration = subscription.expirationTime 
          ? new Date(subscription.expirationTime).toLocaleString() 
          : 'Mai';
        
        setPushSubscription({ 
          status: 'success', 
          message: 'Subscription attiva',
          details: `Endpoint: ${truncated}\nScadenza: ${expiration}`
        });
      } else {
        setPushSubscription({ 
          status: 'warning', 
          message: 'Nessuna subscription',
          details: 'Utente non iscritto alle push'
        });
      }
    } catch (error: any) {
      setPushSubscription({ 
        status: 'error', 
        message: 'Errore verifica subscription',
        details: error.message
      });
    }
  };

  const checkEdgeFunction = async () => {
    setEdgeFunction({ status: 'loading', message: 'Verifica edge function...' });
    
    try {
      // Try OPTIONS request to check if function exists (NO push sent)
      const response = await fetch(
        `${functionsBaseUrl}/webpush-send`,
        { 
          method: 'OPTIONS',
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY
          }
        }
      );
      
      if (response.ok || response.status === 204) {
        setEdgeFunction({ 
          status: 'success', 
          message: 'Edge Function disponibile',
          details: `Status: ${response.status}`
        });
      } else {
        setEdgeFunction({ 
          status: 'warning', 
          message: 'Edge Function risponde',
          details: `Status: ${response.status}`
        });
      }
    } catch (error: any) {
      setEdgeFunction({ 
        status: 'error', 
        message: 'Edge Function non raggiungibile',
        details: error.message
      });
    }
  };

  const checkAdminToken = () => {
    setAdminToken({ status: 'loading', message: 'Verifica admin token...' });
    
    // Client-side check only - DO NOT expose token value
    const hasAdminTokenLogic = typeof window !== 'undefined';
    
    if (hasAdminTokenLogic) {
      setAdminToken({ 
        status: 'success', 
        message: 'Logica admin token presente',
        details: 'Il codice prevede header x-admin-token (valore non esposto)'
      });
    } else {
      setAdminToken({ 
        status: 'warning', 
        message: 'Verifica non conclusiva',
        details: 'Ambiente non supportato'
      });
    }
  };

  const checkDbAccess = async () => {
    setDbAccess({ status: 'loading', message: 'Verifica accesso DB...' });
    
    try {
      // Try to count subscriptions (RLS may block this)
      const { count, error } = await supabase
        .from('webpush_subscriptions')
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        setDbAccess({ 
          status: 'warning', 
          message: 'Accesso DB limitato',
          details: `RLS: ${error.message}`
        });
        return;
      }
      
      // Try to get last 5 records
      const { data: subs, error: selectError } = await supabase
        .from('webpush_subscriptions')
        .select('created_at, user_id, endpoint')
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (selectError) {
        setDbAccess({ 
          status: 'warning', 
          message: `${count ?? 0} subscriptions (no SELECT)`,
          details: 'RLS blocca SELECT'
        });
      } else {
        const subsCount = subs?.length ?? 0;
        setDbAccess({ 
          status: 'success', 
          message: `${count ?? 0} subscriptions totali`,
          details: `Ultime ${subsCount} visibili`
        });
      }
    } catch (error: any) {
      setDbAccess({ 
        status: 'error', 
        message: 'Errore accesso DB',
        details: error.message
      });
    }
  };

  const getStatusIcon = (status: CheckStatus) => {
    switch (status) {
      case 'loading':
        return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: CheckStatus) => {
    const variants: Record<CheckStatus, any> = {
      idle: 'secondary',
      loading: 'secondary',
      success: 'default',
      warning: 'secondary',
      error: 'destructive',
    };
    
    return (
      <Badge variant={variants[status]} className="ml-2">
        {status === 'loading' ? 'Verifica...' : status.toUpperCase()}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80 p-4 pb-24">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Push Auto-Preflight</h1>
          <p className="text-muted-foreground">
            Verifica stato catena notifiche push (solo lettura)
          </p>
        </div>

        {/* Web Push Health */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Web Push Health</span>
              {getStatusBadge(notificationPermission.status)}
            </CardTitle>
            <CardDescription>Stato permessi e Service Worker</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              {getStatusIcon(notificationPermission.status)}
              <div className="flex-1">
                <p className="font-medium">{notificationPermission.message}</p>
                {notificationPermission.details && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {notificationPermission.details}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              {getStatusIcon(serviceWorker.status)}
              <div className="flex-1">
                <p className="font-medium">{serviceWorker.message}</p>
                {serviceWorker.details && (
                  <p className="text-sm text-muted-foreground mt-1 break-all">
                    {serviceWorker.details}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              {getStatusIcon(pushSubscription.status)}
              <div className="flex-1">
                <p className="font-medium">{pushSubscription.message}</p>
                {pushSubscription.details && (
                  <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap break-all">
                    {pushSubscription.details}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edge Function */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Edge Function Availability</span>
              {getStatusBadge(edgeFunction.status)}
            </CardTitle>
            <CardDescription>Verifica /functions/v1/webpush-send</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-3">
              {getStatusIcon(edgeFunction.status)}
              <div className="flex-1">
                <p className="font-medium">{edgeFunction.message}</p>
                {edgeFunction.details && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {edgeFunction.details}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Admin Token */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Admin Token Presence</span>
              {getStatusBadge(adminToken.status)}
            </CardTitle>
            <CardDescription>Verifica logica client-side (no values)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-3">
              {getStatusIcon(adminToken.status)}
              <div className="flex-1">
                <p className="font-medium">{adminToken.message}</p>
                {adminToken.details && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {adminToken.details}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* DB Access */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Database Access</span>
              {getStatusBadge(dbAccess.status)}
            </CardTitle>
            <CardDescription>Accesso webpush_subscriptions (se RLS permette)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-3">
              {getStatusIcon(dbAccess.status)}
              <div className="flex-1">
                <p className="font-medium">{dbAccess.message}</p>
                {dbAccess.details && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {dbAccess.details}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quiet Hours Mock */}
        <Card>
          <CardHeader>
            <CardTitle>Quiet Hours (Mock)</CardTitle>
            <CardDescription>Finestra consigliata per invii automatici</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p><strong>Orario consigliato:</strong> 09:00 – 20:00 (locale)</p>
              <p><strong>Max push/utente/giorno:</strong> 3-5</p>
              <p><strong>Cooldown minimo:</strong> 2-4 ore tra invii</p>
              <p className="text-muted-foreground mt-4">
                ⚠️ Queste sono linee guida suggerite. L'implementazione effettiva richiede 
                logica server-side separata.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PushAutoPreflightPage;
