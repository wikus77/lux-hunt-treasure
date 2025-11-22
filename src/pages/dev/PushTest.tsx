// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Dev Panel: Manual Push Test (Admin Only)

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export default function PushTest() {
  const { user } = useAuth();
  const [title, setTitle] = useState('⚡️ M1SSION – Test Push');
  const [body, setBody] = useState('Test notifica push da pannello dev.');
  const [deeplink, setDeeplink] = useState('/profile');
  const [bypassQuietHours, setBypassQuietHours] = useState(true);
  const [adminToken, setAdminToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  // Admin guard
  useEffect(() => {
    if (user && user.email !== 'wikus77@hotmail.it') {
      window.location.href = '/';
    }
  }, [user]);

  if (!user || user.email !== 'wikus77@hotmail.it') {
    return null;
  }

  const handleSendPush = async () => {
    if (!adminToken.trim()) {
      toast.error('❌ Inserisci il token admin');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      console.log('[PUSH TEST] Sending push notification...', {
        title,
        body,
        deeplink,
        bypassQuietHours,
        hasToken: !!adminToken
      });

      // Use centralized config instead of hardcoded URL
      const functionsBaseUrl = import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, '') || '';
      const response = await fetch(
        `${functionsBaseUrl}/functions/v1/webpush-targeted-send`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-admin-token': adminToken
          },
          body: JSON.stringify({
            user_ids: ['495246c1-9154-4f01-a428-7f37fe230180'],
            payload: {
              title,
              body,
              url: deeplink
            }
          })
        }
      );

      const data = await response.json();
      
      console.log('[PUSH TEST] Response:', data);
      setResult(data);

      if (response.ok && data.success) {
        toast.success(`✅ Push inviato: ${data.sent}/${data.total}`);
      } else {
        toast.error(`❌ Errore: ${data.error || 'Unknown error'}`);
      }
    } catch (error: any) {
      console.error('[PUSH TEST] Error:', error);
      setResult({ error: error.message });
      toast.error(`❌ Errore: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>🧪 Push Test Panel (MCP Only)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="adminToken">🔑 Admin Token (PUSH_ADMIN_TOKEN)</Label>
            <Input
              id="adminToken"
              type="password"
              value={adminToken}
              onChange={(e) => setAdminToken(e.target.value)}
              placeholder="Inserisci token admin da Supabase secrets"
            />
            <p className="text-xs text-muted-foreground">
              Trovalo in: Supabase Dashboard → Edge Functions → Secrets → PUSH_ADMIN_TOKEN
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Notification title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="body">Body</Label>
            <Input
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Notification body"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="deeplink">Deeplink</Label>
            <Input
              id="deeplink"
              value={deeplink}
              onChange={(e) => setDeeplink(e.target.value)}
              placeholder="/profile"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="quiet"
              checked={bypassQuietHours}
              onCheckedChange={(checked) => setBypassQuietHours(checked as boolean)}
            />
            <Label htmlFor="quiet" className="text-sm">
              Bypass quiet hours
            </Label>
          </div>

          <Button
            onClick={handleSendPush}
            disabled={loading || !adminToken.trim()}
            className="w-full"
          >
            {loading ? '⏳ Invio...' : '📤 Invia a MCP (495246c1...)'}
          </Button>

          {!adminToken.trim() && (
            <p className="text-xs text-yellow-500 text-center">
              ⚠️ Inserisci il token admin per abilitare l'invio
            </p>
          )}

          {result && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2">📊 Result:</h3>
              <pre className="text-xs overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
