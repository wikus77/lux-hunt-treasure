// © 2025 Joseph MULÉ – M1SSION™ – Push Center Debug Tab
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, RefreshCw, Send, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { getCurrentSubscription } from '@/utils/safeWebPushSubscribe';
import { sendPushNotification, getSuggestion } from '../utils/api';
import { enableWebPush } from '@/lib/push/enableWebPush';

export default function DebugTab() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [swStatus, setSwStatus] = useState<string>('');
  const [swScope, setSwScope] = useState<string>('');
  const [hasSubscription, setHasSubscription] = useState(false);
  const [endpointTail, setEndpointTail] = useState<string>('');
  const [sessionInfo, setSessionInfo] = useState<string>('');
  const [vapidKey, setVapidKey] = useState<string>('');
  const [lastUpsertResult, setLastUpsertResult] = useState<any>(null);
  const [lastSendResult, setLastSendResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const updateStatus = async () => {
    // Permission
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }

    // SW Status
    if ('serviceWorker' in navigator) {
      if (navigator.serviceWorker.controller) {
        setSwStatus('✅ Registered & Controlling');
        const reg = await navigator.serviceWorker.ready;
        setSwScope(reg.scope);
      } else {
        setSwStatus('⚠️ Registered but not controlling');
      }
    } else {
      setSwStatus('❌ Not supported');
    }

    // Subscription
    const sub = await getCurrentSubscription();
    const isSubbed = !!sub;
    setHasSubscription(isSubbed);
    if (sub?.endpoint) {
      setEndpointTail('...' + sub.endpoint.slice(-20));
    } else {
      setEndpointTail('');
    }

    // Session
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setSessionInfo(`${session.user.email} (${session.user.id.slice(0, 8)}...)`);
    } else {
      setSessionInfo('Not logged in');
    }

    // VAPID (unified source)
    try {
      const { loadVAPIDPublicKey } = await import('@/lib/vapid-loader');
      const vapid = await loadVAPIDPublicKey();
      setVapidKey(vapid ? '...' + vapid.slice(-12) : 'Not configured');
    } catch {
      setVapidKey('Error reading VAPID');
    }
  };

  useEffect(() => {
    updateStatus();
  }, []);

  const handleResubscribe = async () => {
    setIsLoading(true);
    setLastUpsertResult(null);

    try {
      const sub = await enableWebPush();
      
      const endpointTail = sub.endpoint.substring(sub.endpoint.length - 12);
      setLastUpsertResult({
        status: 200,
        data: { 
          ok: true, 
          message: 'Subscription successful',
          endpoint_tail: endpointTail,
          mode: 'jsonb_keys'
        },
        suggestion: '✅ Success! Subscription registered in DB with JSONB keys.'
      });

      await updateStatus();
    } catch (error: any) {
      console.error('[DebugTab] Resubscribe error:', error);
      
      // Parse error for specific reasons
      let errorReason = 'unknown_error';
      let errorMessage = error.message;
      let suggestion = '';
      
      if (error.message.includes('missing_fields')) {
        errorReason = 'missing_fields';
        errorMessage = 'Missing p256dh or auth keys';
        suggestion = '⚠️ Browser subscription may have failed. Check VAPID key configuration.';
      } else if (error.message.includes('database_error')) {
        errorReason = 'database_error';
        errorMessage = 'Database error during upsert';
        suggestion = '⚠️ Check webpush_subscriptions table schema and RLS policies in Supabase.';
      } else if (error.message.includes('invalid_jwt') || error.message.includes('Unauthorized')) {
        errorReason = 'auth_error';
        errorMessage = 'Authentication failed';
        suggestion = '⚠️ JWT invalid or expired. Please log in again.';
      } else if (error.message.includes('Permesso notifiche negato')) {
        errorReason = 'permission_denied';
        errorMessage = 'Notification permission denied';
        suggestion = '⚠️ User denied notification permission. Check browser settings.';
      } else {
        suggestion = '⚠️ ' + errorMessage;
      }
      
      setLastUpsertResult({
        status: 0,
        data: { error: errorMessage, reason: errorReason },
        suggestion
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

      const startTime = performance.now();
      const response = await sendPushNotification(
        {
          audience: { user_id: session.user.id },
          payload: {
            title: 'Test Self',
            body: `Test at ${new Date().toLocaleTimeString()}`,
            url: '/notifications'
          }
        },
        { userJWT: session.access_token }
      );

      setLastSendResult({
        ...response,
        suggestion: getSuggestion(response.data.error, response.status)
      });
    } catch (error: any) {
      setLastSendResult({
        status: 0,
        data: { error: error.message },
        responseTime: 0,
        suggestion: getSuggestion(error.message)
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestSendAll = async () => {
    setIsLoading(true);
    setLastSendResult(null);

    try {
      const adminToken = prompt('Enter admin token:');
      if (!adminToken) {
        setIsLoading(false);
        return;
      }

      const response = await sendPushNotification(
        {
          audience: 'all',
          payload: {
            title: 'Admin Broadcast Test',
            body: `Broadcast at ${new Date().toLocaleTimeString()}`,
            url: '/notifications'
          }
        },
        { adminToken }
      );

      setLastSendResult({
        ...response,
        suggestion: getSuggestion(response.data.error, response.status)
      });
    } catch (error: any) {
      setLastSendResult({
        status: 0,
        data: { error: error.message },
        responseTime: 0,
        suggestion: getSuggestion(error.message)
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-lg border border-gray-700 space-y-3">
        <h3 className="font-semibold text-white">System Status</h3>
        
        <div className="flex items-center gap-2 text-sm">
          {permission === 'granted' ? (
            <CheckCircle className="w-4 h-4 text-green-400" />
          ) : (
            <XCircle className="w-4 h-4 text-red-400" />
          )}
          <span className="text-gray-300">Permission:</span>
          <span className={permission === 'granted' ? 'text-green-400' : 'text-red-400'}>
            {permission}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          {swStatus.includes('✅') ? (
            <CheckCircle className="w-4 h-4 text-green-400" />
          ) : (
            <XCircle className="w-4 h-4 text-yellow-400" />
          )}
          <span className="text-gray-300">Service Worker:</span>
          <span className="text-gray-400">{swStatus}</span>
        </div>

        {swScope && (
          <div className="text-xs text-gray-500">Scope: {swScope}</div>
        )}

        <div className="flex items-center gap-2 text-sm">
          {hasSubscription ? (
            <CheckCircle className="w-4 h-4 text-green-400" />
          ) : (
            <XCircle className="w-4 h-4 text-red-400" />
          )}
          <span className="text-gray-300">Subscription:</span>
          <span className={hasSubscription ? 'text-green-400' : 'text-red-400'}>
            {hasSubscription ? 'Active' : 'None'}
          </span>
        </div>

        {endpointTail && (
          <div className="text-xs text-gray-500">Endpoint: {endpointTail}</div>
        )}

        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-300">Session:</span>
          <span className="text-gray-400">{sessionInfo}</span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-300">VAPID Public:</span>
          <span className="text-gray-400">{vapidKey}</span>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Button onClick={updateStatus} size="sm" variant="outline" disabled={isLoading}>
          <RefreshCw className="w-4 h-4 mr-1" />
          Refresh
        </Button>
        <Button onClick={handleResubscribe} size="sm" variant="default" disabled={isLoading}>
          <Send className="w-4 h-4 mr-1" />
          (Re)Subscribe
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

      {lastUpsertResult && (
        <div className="p-4 rounded-lg border border-gray-700 space-y-2">
          <h4 className="font-semibold text-white">Last Upsert Result</h4>
          <div className={`text-sm ${lastUpsertResult.status === 200 ? 'text-green-400' : 'text-red-400'}`}>
            Status: {lastUpsertResult.status}
          </div>
          <pre className="text-xs bg-black/40 p-2 rounded overflow-auto max-h-40">
            {JSON.stringify(lastUpsertResult.data, null, 2)}
          </pre>
          <p className="text-sm text-yellow-400">{lastUpsertResult.suggestion}</p>
        </div>
      )}

      {lastSendResult && (
        <div className="p-4 rounded-lg border border-gray-700 space-y-2">
          <h4 className="font-semibold text-white">Last Send Result</h4>
          <div className="flex items-center justify-between">
            <span className={`text-sm ${lastSendResult.status === 200 ? 'text-green-400' : 'text-red-400'}`}>
              Status: {lastSendResult.status}
            </span>
            <span className="text-gray-400 text-xs">{lastSendResult.responseTime}ms</span>
          </div>
          <pre className="text-xs bg-black/40 p-2 rounded overflow-auto max-h-40">
            {JSON.stringify(lastSendResult.data, null, 2)}
          </pre>
          <p className="text-sm text-yellow-400">{lastSendResult.suggestion}</p>
        </div>
      )}
    </div>
  );
}
