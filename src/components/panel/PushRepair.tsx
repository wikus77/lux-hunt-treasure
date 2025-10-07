/**
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 * Push Notification Repair Component
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { loadVAPIDPublicKey, urlBase64ToUint8Array } from '@/lib/vapid-loader';
import { Loader2 } from 'lucide-react';

const SB_URL = 'https://vkjrqirvdvjbemsfzxof.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZranJxaXJ2ZHZqYmVtc2Z6eG9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwMzQyMjYsImV4cCI6MjA2MDYxMDIyNn0.rb0F3dhKXwb_110--08Jsi4pt_jx-5IWwhi96eYMxBk';
const ADMIN_TOKEN = 'ff730232621eb7274a4e431d23a9e6341ea0fc616903a2a7ce938c983d10814e';

export default function PushRepair() {
  const { toast } = useToast();
  const [isRepairing, setIsRepairing] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [log, setLog] = useState<string[]>([]);

  const addLog = (message: string) => {
    console.log('[PushRepair]', message);
    setLog(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const handleRepair = async () => {
    setIsRepairing(true);
    setLog([]);
    
    try {
      // 1️⃣ Deregister old service workers
      addLog('Step 1: Checking for old service workers...');
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const reg of registrations) {
        if (!reg.active?.scriptURL.endsWith('/sw.js')) {
          addLog(`Unregistering old SW: ${reg.active?.scriptURL}`);
          await reg.unregister();
        }
      }
      
      // 2️⃣ Register /sw.js
      addLog('Step 2: Registering /sw.js...');
      const reg = await navigator.serviceWorker.register('/sw.js', { 
        scope: '/',
        updateViaCache: 'none'
      });
      await navigator.serviceWorker.ready;
      addLog('✅ Service Worker registered');

      // 3️⃣ Load VAPID key
      addLog('Step 3: Loading VAPID key from /vapid-public.txt...');
      const vapidKey = await loadVAPIDPublicKey();
      const applicationServerKey = urlBase64ToUint8Array(vapidKey);
      addLog(`✅ VAPID key loaded (${applicationServerKey.length} bytes)`);

      // 4️⃣ Get JWT
      addLog('Step 4: Getting user session...');
      const { data } = await supabase.auth.getSession();
      const jwt = data?.session?.access_token;
      
      if (!jwt) {
        addLog('❌ No valid session found');
        toast({
          title: '⚠️ Sessione non valida',
          description: 'Rifai il login per continuare',
          variant: 'destructive'
        });
        return;
      }
      addLog('✅ JWT obtained');

      // 5️⃣ Unsubscribe old subscription
      addLog('Step 5: Cleaning old subscription...');
      const oldSub = await reg.pushManager.getSubscription();
      if (oldSub) {
        await oldSub.unsubscribe();
        addLog('✅ Old subscription removed');
      }

      // 6️⃣ Create new subscription
      addLog('Step 6: Creating new push subscription...');
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey
      });
      addLog('✅ New subscription created');

      // 7️⃣ Upsert to backend
      addLog('Step 7: Upserting to backend...');
      const subJSON = subscription.toJSON();
      const payload = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subJSON.keys?.p256dh || '',
          auth: subJSON.keys?.auth || ''
        },
        ua: navigator.userAgent,
        provider: subscription.endpoint.includes('apple.com') ? 'ios' : 'web'
      };

      const resp = await fetch(`${SB_URL}/functions/v1/webpush-upsert`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'authorization': `Bearer ${jwt}`,
          'apikey': SUPABASE_ANON_KEY
        },
        body: JSON.stringify(payload)
      });

      // 8️⃣ Check response
      if (resp.ok) {
        const result = await resp.json();
        addLog(`✅ Backend upsert successful: ${JSON.stringify(result)}`);
        toast({
          title: '✅ Riparazione completata',
          description: 'Push notifications attive e registrate',
        });
      } else {
        const errorText = await resp.text();
        addLog(`❌ Backend error ${resp.status}: ${errorText}`);
        toast({
          title: '❌ Errore backend',
          description: `Status ${resp.status}: ${errorText}`,
          variant: 'destructive'
        });
      }

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      addLog(`❌ Error: ${message}`);
      toast({
        title: '❌ Errore durante la riparazione',
        description: message,
        variant: 'destructive'
      });
    } finally {
      setIsRepairing(false);
    }
  };

  const handleTestPush = async () => {
    setIsTesting(true);
    addLog('Testing push notification...');
    
    try {
      const resp = await fetch(`${SB_URL}/functions/v1/webpush-send`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-admin-token': ADMIN_TOKEN,
          'apikey': SUPABASE_ANON_KEY
        },
        body: JSON.stringify({
          audience: 'self',
          payload: {
            title: '🧪 Test Push M1SSION™',
            body: 'Notifica di test funzionante!',
            url: '/home'
          }
        })
      });

      if (resp.ok) {
        const result = await resp.json();
        addLog(`✅ Test push sent: ${JSON.stringify(result)}`);
        toast({
          title: '✅ Push di test inviato',
          description: 'Controlla le notifiche del browser',
        });
      } else {
        const errorText = await resp.text();
        addLog(`❌ Test failed ${resp.status}: ${errorText}`);
        toast({
          title: '❌ Test fallito',
          description: `Status ${resp.status}`,
          variant: 'destructive'
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      addLog(`❌ Test error: ${message}`);
      toast({
        title: '❌ Errore test push',
        description: message,
        variant: 'destructive'
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-4 p-6 bg-gray-900/50 rounded-lg border border-gray-800">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">🔧 Push Repair Center</h3>
      </div>

      <div className="flex gap-3">
        <Button
          onClick={handleRepair}
          disabled={isRepairing}
          className="flex-1"
          variant="default"
        >
          {isRepairing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Riparazione in corso...
            </>
          ) : (
            <>⚙️ Ripara Notifiche Push</>
          )}
        </Button>

        <Button
          onClick={handleTestPush}
          disabled={isTesting}
          variant="outline"
        >
          {isTesting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Testing...
            </>
          ) : (
            <>🧪 Test Push</>
          )}
        </Button>
      </div>

      {log.length > 0 && (
        <div className="mt-4 p-3 bg-black/30 rounded border border-gray-800 max-h-64 overflow-y-auto">
          <div className="text-xs font-mono text-gray-400 space-y-1">
            {log.map((entry, i) => (
              <div key={i}>{entry}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
