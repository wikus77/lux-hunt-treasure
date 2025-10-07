// © 2025 Joseph MULÉ – M1SSION™ – Push Activation Tab
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Bell, BellOff, Loader2, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { loadVAPIDPublicKey, urlBase64ToUint8Array } from '@/lib/vapid-loader';

type ActivationStatus = 'idle' | 'checking' | 'activating' | 'active' | 'denied' | 'unsupported';

export default function ActivateTab() {
  const [status, setStatus] = useState<ActivationStatus>('idle');
  const [isLoading, setIsLoading] = useState(false);
  const [currentPermission, setCurrentPermission] = useState<NotificationPermission>('default');
  const [subscriptionEndpoint, setSubscriptionEndpoint] = useState<string | null>(null);

  useEffect(() => {
    checkCurrentStatus();
  }, []);

  const checkCurrentStatus = async () => {
    setStatus('checking');
    
    // Check browser support
    if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) {
      setStatus('unsupported');
      return;
    }

    // Check permission
    const permission = Notification.permission;
    setCurrentPermission(permission);

    if (permission === 'denied') {
      setStatus('denied');
      return;
    }

    if (permission === 'granted') {
      // Check if we have an active subscription
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          setSubscriptionEndpoint(subscription.endpoint);
          setStatus('active');
          return;
        }
      } catch (error) {
        console.error('[ActivateTab] Check error:', error);
      }
    }

    setStatus('idle');
  };

  const handleActivate = async () => {
    setIsLoading(true);
    
    try {
      // 1. Request permission (MUST be user gesture)
      const permission = await Notification.requestPermission();
      setCurrentPermission(permission);
      
      if (permission !== 'granted') {
        setStatus('denied');
        toast.error('Permessi notifiche negati');
        setIsLoading(false);
        return;
      }

      // 2. Ensure service worker is ready
      let registration: ServiceWorkerRegistration;
      try {
        registration = await navigator.serviceWorker.ready;
      } catch {
        // Register if not present
        registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
        await navigator.serviceWorker.ready;
      }

      // 3. Load VAPID key
      const vapidPublicKey = await loadVAPIDPublicKey();
      const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);

      // 4. Unsubscribe from any existing subscription (fresh start)
      const existingSub = await registration.pushManager.getSubscription();
      if (existingSub) {
        await existingSub.unsubscribe();
      }

      // 5. Subscribe with VAPID
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey
      });

      // 6. Get user JWT
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        throw new Error('Utente non autenticato');
      }

      const accessToken = session.access_token;

      // 7. Send subscription to backend
      const subJson = subscription.toJSON();
      const endpoint = subJson.endpoint!;
      const p256dh = subJson.keys!.p256dh!;
      const auth = subJson.keys!.auth!;

      const SB_URL = 'https://vkjrqirvdvjbemsfzxof.supabase.co';
      const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZranJxaXJ2ZHZqYmVtc2Z6eG9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwMzQyMjYsImV4cCI6MjA2MDYxMDIyNn0.rb0F3dhKXwb_110--08Jsi4pt_jx-5IWwhi96eYMxBk';

      const response = await fetch(`${SB_URL}/functions/v1/webpush-upsert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'apikey': ANON_KEY
        },
        body: JSON.stringify({
          endpoint,
          p256dh,
          auth,
          provider: 'webpush',
          platform: navigator.platform || 'web',
          ua: navigator.userAgent
        })
      });

      const result = await response.json();

      if (!response.ok || !result.ok) {
        throw new Error(result.error || 'Errore durante la registrazione');
      }

      // Success!
      setSubscriptionEndpoint(endpoint);
      setStatus('active');
      toast.success('✅ Notifiche attive!');

    } catch (error: any) {
      console.error('[ActivateTab] Activation error:', error);
      
      // Handle specific errors
      if (error.name === 'NotAllowedError') {
        toast.error('Permessi negati. Controlla le impostazioni del browser.');
        setStatus('denied');
      } else if (error.name === 'InvalidAccessError') {
        toast.error('Chiave VAPID errata. Contatta il supporto.');
        setStatus('idle');
      } else if (error.name === 'AbortError' || error.message?.includes('Registration failed')) {
        toast.error('Errore del servizio push. Ricarica la pagina e riprova.');
        setStatus('idle');
      } else {
        toast.error(error.message || 'Errore sconosciuto durante l\'attivazione');
        setStatus('idle');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeactivate = async () => {
    setIsLoading(true);
    
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
      }
      
      setSubscriptionEndpoint(null);
      setStatus('idle');
      toast.success('Notifiche disattivate');
    } catch (error: any) {
      console.error('[ActivateTab] Deactivation error:', error);
      toast.error('Errore durante la disattivazione');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Status Card */}
      <Card className="p-6">
        <div className="flex items-start gap-4">
          {status === 'active' ? (
            <CheckCircle2 className="w-8 h-8 text-green-500 flex-shrink-0" />
          ) : status === 'denied' ? (
            <XCircle className="w-8 h-8 text-red-500 flex-shrink-0" />
          ) : status === 'unsupported' ? (
            <AlertCircle className="w-8 h-8 text-yellow-500 flex-shrink-0" />
          ) : (
            <BellOff className="w-8 h-8 text-gray-400 flex-shrink-0" />
          )}
          
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2">
              {status === 'active' && '✅ Notifiche Attive'}
              {status === 'denied' && '❌ Permessi Negati'}
              {status === 'unsupported' && '⚠️ Browser Non Supportato'}
              {status === 'idle' && '🔔 Notifiche Non Attive'}
              {status === 'checking' && '🔍 Controllo...'}
            </h3>
            
            <p className="text-sm text-muted-foreground mb-4">
              {status === 'active' && 'Riceverai notifiche push da M1SSION™'}
              {status === 'denied' && 'Devi abilitare i permessi manualmente nelle impostazioni del browser'}
              {status === 'unsupported' && 'Il tuo browser non supporta le notifiche push'}
              {status === 'idle' && 'Clicca "Attiva Notifiche" per ricevere aggiornamenti in tempo reale'}
              {status === 'checking' && 'Verifica stato delle notifiche...'}
            </p>

            {subscriptionEndpoint && (
              <div className="text-xs text-muted-foreground bg-black/20 p-2 rounded font-mono">
                <span className="opacity-50">Endpoint: </span>
                {subscriptionEndpoint.substring(subscriptionEndpoint.length - 40)}
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Action Button */}
      {status === 'idle' && (
        <Button
          onClick={handleActivate}
          disabled={isLoading}
          className="w-full"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Attivazione in corso...
            </>
          ) : (
            <>
              <Bell className="w-5 h-5 mr-2" />
              Attiva Notifiche
            </>
          )}
        </Button>
      )}

      {status === 'active' && (
        <Button
          onClick={handleDeactivate}
          disabled={isLoading}
          variant="outline"
          className="w-full"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Disattivazione...
            </>
          ) : (
            <>
              <BellOff className="w-5 h-5 mr-2" />
              Disattiva Notifiche
            </>
          )}
        </Button>
      )}

      {status === 'denied' && (
        <Card className="p-4 bg-red-500/10 border-red-500/30">
          <p className="text-sm">
            <strong>Come abilitare i permessi:</strong>
          </p>
          <ol className="text-xs space-y-1 mt-2 ml-4 list-decimal">
            <li>Clicca sull'icona 🔒 o ⓘ nella barra degli indirizzi</li>
            <li>Cerca "Notifiche" nelle impostazioni del sito</li>
            <li>Seleziona "Consenti"</li>
            <li>Ricarica la pagina e riprova</li>
          </ol>
        </Card>
      )}

      {status === 'unsupported' && (
        <Card className="p-4 bg-yellow-500/10 border-yellow-500/30">
          <p className="text-sm">
            Il tuo browser non supporta le notifiche push. Prova con:
          </p>
          <ul className="text-xs space-y-1 mt-2 ml-4 list-disc">
            <li>Google Chrome (Desktop/Android)</li>
            <li>Microsoft Edge (Desktop)</li>
            <li>Firefox (Desktop/Android)</li>
            <li>Safari 16+ (macOS/iOS)</li>
          </ul>
        </Card>
      )}

      {/* Debug Info (admin only) */}
      <Card className="p-4 bg-black/20">
        <h4 className="text-xs font-semibold mb-2">Debug Info</h4>
        <div className="space-y-1 text-xs font-mono">
          <div>Status: <span className="text-blue-400">{status}</span></div>
          <div>Permission: <span className="text-blue-400">{currentPermission}</span></div>
          <div>Support: <span className="text-blue-400">
            {('Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window) ? 'YES' : 'NO'}
          </span></div>
        </div>
      </Card>
    </div>
  );
}
