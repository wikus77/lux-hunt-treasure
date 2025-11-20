// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
// Push Debug Panel - Enhanced E2E Testing
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { RefreshCw, CheckCircle, XCircle, Send, Users } from 'lucide-react';
import { functionsBaseUrl } from '@/lib/supabase/functionsBase';
import { SUPABASE_CONFIG } from '@/lib/supabase/config';



async function getCurrentSubscription(): Promise<PushSubscription | null> {
  try {
    const reg = await navigator.serviceWorker.ready;
    return await reg.pushManager.getSubscription();
  } catch {
    return null;
  }
}
const PushDebugPanel: React.FC = () => {
  const [isControlled, setIsControlled] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [endpointHost, setEndpointHost] = useState<string>('');
  const [endpointTail, setEndpointTail] = useState<string>('');
  const [readyScope, setReadyScope] = useState<string>('');
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [sessionUid, setSessionUid] = useState<string>('');
  const [lastUpsertResult, setLastUpsertResult] = useState<any>(null);
  const [lastSendResult, setLastSendResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const updateStatus = async () => {
    try {
      const sub = await getCurrentSubscription();
      const isControlledNow = !!navigator.serviceWorker.controller;
      const isSubscribedNow = !!sub;
      
      setIsControlled(isControlledNow);
      setIsSubscribed(isSubscribedNow);
      
      if (sub) {
        const url = new URL(sub.endpoint);
        setEndpointHost(url.hostname);
        setEndpointTail(sub.endpoint.slice(-20));
      } else {
        setEndpointHost('');
        setEndpointTail('');
      }
      
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        setReadyScope(registration.scope);
      }

      if ('Notification' in window) {
        setPermission(Notification.permission);
      }

      const { data: { session } } = await supabase.auth.getSession();
      setSessionUid(session?.user?.id || 'Not logged in');
      
    } catch (error) {
      console.error('[PUSH-DEBUG] Error updating status:', error);
    }
  };

  const handleResubscribe = async () => {
    setIsLoading(true);
    setLastUpsertResult(null);
    try {
      const { enableWebPush } = await import('@/lib/push/enableWebPush');
      const sub = await enableWebPush();
      setLastUpsertResult({ 
        success: true, 
        endpoint: sub?.endpoint.slice(-30) 
      });
      await updateStatus();
    } catch (error: any) {
      setLastUpsertResult({ 
        success: false, 
        error: error?.message || String(error) 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestSendSelf = async () => {
    setIsLoading(true);
    setLastSendResult(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }

      const { data, error } = await supabase.functions.invoke('webpush-send', {
        body: {
          audience: { user_id: session.user.id },
          payload: {
            title: 'Test Self',
            body: `Test notification at ${new Date().toLocaleTimeString()}`
          }
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      setLastSendResult(data || { error: error?.message });
    } catch (error: any) {
      setLastSendResult({ error: error?.message || String(error) });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestSendAll = async () => {
    setIsLoading(true);
    setLastSendResult(null);
    try {
      const adminToken = prompt('Enter admin token:');
      if (!adminToken) return;

      const SUPABASE_URL = `${functionsBaseUrl}`;

      const SUPABASE_ANON_KEY: string = SUPABASE_CONFIG.anonKey;
      const SUPABASE_ANON_MASK = (SUPABASE_ANON_KEY && typeof SUPABASE_ANON_KEY === 'string')
        ? (SUPABASE_ANON_KEY.slice(0,4) + '…' + SUPABASE_ANON_KEY.slice(-4))
        : '<env>';

      const response = await fetch(

        `${SUPABASE_URL}/functions/v1/webpush-send`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-admin-token': adminToken,
            'apikey': ((SUPABASE_ANON_KEY && typeof SUPABASE_ANON_KEY==='string') ? (SUPABASE_ANON_KEY.slice(0,4)+'…'+SUPABASE_ANON_KEY.slice(-4)) : '<env>')
          },
          body: JSON.stringify({
            payload: {
              title: 'Admin Broadcast Test',
              body: `Broadcast at ${new Date().toLocaleTimeString()}`
            }
          })
        }
      );

      const data = await response.json();
      setLastSendResult({ status: response.status, ...data });
    } catch (error: any) {
      setLastSendResult({ error: error?.message || String(error) });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { updateStatus(); }, []);

  return (
    <div className="p-4 border rounded-lg space-y-3">
      <h3 className="font-medium">Push Debug E2E</h3>
      
      <div className="text-sm space-y-1">
        <div className="flex items-center gap-2">
          {permission === 'granted' ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-500" />}
          Permission: {permission}
        </div>
        <div className="flex items-center gap-2">
          {isControlled ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-500" />}
          SW Controller: {isControlled ? 'true' : 'false'}
        </div>
        <div className="flex items-center gap-2">
          {isSubscribed ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-500" />}
          Subscribed: {isSubscribed ? 'true' : 'false'}
        </div>
        {readyScope && (
          <div className="text-xs text-muted-foreground">
            SW scope: {readyScope}
          </div>
        )}
        {endpointHost && (
          <div className="text-xs text-muted-foreground">
            Endpoint: {endpointHost} ...{endpointTail}
          </div>
        )}
        {sessionUid && (
          <div className="text-xs text-muted-foreground">
            User ID: {sessionUid.slice(0, 8)}...
          </div>
        )}
      </div>

      {lastUpsertResult && (
        <div className={`text-xs p-2 rounded ${lastUpsertResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          <strong>Upsert:</strong> {JSON.stringify(lastUpsertResult, null, 2)}
        </div>
      )}

      {lastSendResult && (
        <div className="text-xs p-2 rounded bg-blue-100 text-blue-800">
          <strong>Send:</strong> {JSON.stringify(lastSendResult, null, 2)}
        </div>
      )}

      <div className="flex gap-2 flex-wrap">
        <Button onClick={updateStatus} size="sm" variant="outline" disabled={isLoading}>
          <RefreshCw className="w-4 h-4 mr-1" />
          Refresh
        </Button>
        <Button onClick={handleResubscribe} size="sm" variant="default" disabled={isLoading}>
          <Send className="w-4 h-4 mr-1" />
          Resubscribe
        </Button>
        <Button onClick={handleTestSendSelf} size="sm" variant="secondary" disabled={isLoading}>
          <Send className="w-4 h-4 mr-1" />
          Test Self
        </Button>
        <Button onClick={handleTestSendAll} size="sm" variant="destructive" disabled={isLoading}>
          <Users className="w-4 h-4 mr-1" />
          Test All (Admin)
        </Button>
      </div>
    </div>
  );
};

export default PushDebugPanel;
