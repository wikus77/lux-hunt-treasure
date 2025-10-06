// © 2025 Joseph MULÉ – M1SSION™ – Push Center Send Tab
"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Send, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { sendPushNotification, getSuggestion, type PushSendRequest } from '../utils/api';

export default function SendTab() {
  const [audience, setAudience] = useState<'all' | 'user_id' | 'endpoint'>('all');
  const [targetValue, setTargetValue] = useState('');
  const [adminToken, setAdminToken] = useState('');
  const [payload, setPayload] = useState(JSON.stringify({
    title: '🔔 Test',
    body: 'Hello from Push Center',
    url: '/notifications'
  }, null, 2));
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSend = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      let parsedPayload;
      try {
        parsedPayload = JSON.parse(payload);
      } catch (e) {
        setResult({
          status: 400,
          data: { error: 'Invalid JSON payload' },
          responseTime: 0,
          suggestion: '⚠️ Il payload deve essere un JSON valido'
        });
        setIsLoading(false);
        return;
      }

      const request: PushSendRequest = {
        payload: parsedPayload
      };

      if (audience === 'user_id' && targetValue) {
        request.audience = { user_id: targetValue };
      } else if (audience === 'endpoint' && targetValue) {
        request.audience = { endpoint: targetValue };
      } else if (audience === 'all') {
        request.audience = 'all';
      }

      // Admin Bypass: se audience='all' con token → SOLO x-admin-token (NO Authorization)
      let userJWT: string | undefined;
      
      if (audience === 'all' && adminToken) {
        // Admin bypass: non serve JWT
        userJWT = undefined;
      } else {
        // User path: serve JWT
        const { data: { session } } = await supabase.auth.getSession();
        userJWT = session?.access_token;
      }

      const response = await sendPushNotification(request, {
        adminToken: audience === 'all' && adminToken ? adminToken : undefined,
        userJWT: audience === 'all' && adminToken ? undefined : userJWT
      });

      setResult({
        ...response,
        suggestion: getSuggestion(response.data.error, response.status)
      });
    } catch (error: any) {
      setResult({
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
      <div className="space-y-2">
        <Label>Audience</Label>
        <Select value={audience} onValueChange={(v: any) => setAudience(v)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All (Admin Bypass)</SelectItem>
            <SelectItem value="user_id">User ID</SelectItem>
            <SelectItem value="endpoint">Endpoint</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {audience === 'all' && (
        <div className="space-y-2">
          <Label>Admin Token (x-admin-token)</Label>
          <Input
            type="password"
            placeholder="Enter admin token"
            value={adminToken}
            onChange={(e) => setAdminToken(e.target.value)}
          />
          <p className="text-xs text-gray-400">
            Required for "All" audience. Configura PUSH_ADMIN_TOKEN nei secrets di Supabase.
          </p>
        </div>
      )}

      {audience === 'user_id' && (
        <div className="space-y-2">
          <Label>User ID</Label>
          <Input
            placeholder="uuid-user-id"
            value={targetValue}
            onChange={(e) => setTargetValue(e.target.value)}
          />
        </div>
      )}

      {audience === 'endpoint' && (
        <div className="space-y-2">
          <Label>Endpoint URL</Label>
          <Input
            placeholder="https://..."
            value={targetValue}
            onChange={(e) => setTargetValue(e.target.value)}
          />
        </div>
      )}

      <div className="space-y-2">
        <Label>Payload (JSON)</Label>
        <Textarea
          className="font-mono text-sm min-h-[120px]"
          value={payload}
          onChange={(e) => setPayload(e.target.value)}
        />
      </div>

      <Button
        onClick={handleSend}
        disabled={isLoading || (audience === 'all' && !adminToken)}
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Sending...
          </>
        ) : (
          <>
            <Send className="w-4 h-4 mr-2" />
            Send Push Notification
          </>
        )}
      </Button>

      {result && (
        <div className="p-4 rounded-lg border border-gray-700 space-y-2">
          <div className="flex items-center justify-between">
            <span className={`font-semibold ${result.status === 200 ? 'text-green-400' : 'text-red-400'}`}>
              Status: {result.status}
            </span>
            <span className="text-gray-400 text-sm">{result.responseTime}ms</span>
          </div>
          <pre className="text-xs bg-black/40 p-3 rounded overflow-auto max-h-60">
            {JSON.stringify(result.data, null, 2)}
          </pre>
          <p className="text-sm text-yellow-400">{result.suggestion}</p>
        </div>
      )}
    </div>
  );
}
