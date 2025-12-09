// © 2025 Joseph MULÉ – M1SSION™ – Push Center Send Tab
"use client";

import React, { useState } from 'react';
import { getProjectRef } from '@/lib/supabase/functionsBase';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Send, Loader2, CheckCircle2, XCircle, AlertCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';

type AudienceMode = 'all' | 'single' | 'multi';

interface SendResult {
  success: boolean;
  total: number;
  sent: number;
  failed: number;
  errors?: Array<{ user_id?: string; endpoint?: string; reason?: string }>;
  message?: string;
}

export default function SendTab() {
  const [mode, setMode] = useState<AudienceMode>('all');
  const [title, setTitle] = useState('🔔 M1SSION Alert');
  const [body, setBody] = useState('Your mission awaits!');
  const [url, setUrl] = useState('/notifications');
  const [imageUrl, setImageUrl] = useState('');
  const [extra, setExtra] = useState('{}');
  const [userId, setUserId] = useState('');
  const [userIds, setUserIds] = useState('');
  const [adminToken, setAdminToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SendResult | null>(null);
  const [lastSends, setLastSends] = useState<Array<{ time: string; mode: string; sent: number; failed: number }>>([]);

  // Validations
  const validateInputs = (): string | null => {
    if (!title.trim()) return 'Title is required';
    if (title.length > 80) return 'Title too long (max 80 chars)';
    if (!body.trim()) return 'Body is required';
    if (body.length > 240) return 'Body too long (max 240 chars)';
    
    if (url && !url.startsWith('/') && !url.startsWith('http://') && !url.startsWith('https://')) {
      return 'URL must start with / or https://';
    }
    
    if (imageUrl && !imageUrl.startsWith('https://')) {
      return 'Image URL must start with https://';
    }
    
    try {
      JSON.parse(extra);
    } catch (e) {
      return 'Extra must be valid JSON';
    }

    if (mode === 'single' && !userId.trim()) {
      return 'User ID required for SINGLE mode';
    }

    if (mode === 'multi') {
      const ids = userIds.split(/[\n,]/).map(s => s.trim()).filter(Boolean);
      if (ids.length === 0) return 'At least one User ID required for MULTI mode';
      if (ids.length > 100) return 'Too many users (max 100 per batch)';
    }

    if (!adminToken.trim()) {
      return 'Admin token required';
    }

    return null;
  };

  const handleSend = async () => {
    const error = validateInputs();
    if (error) {
      toast.error(error);
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const parsedExtra = JSON.parse(extra);
      const payload = {
        title,
        body,
        url: url || '/notifications',
        image: imageUrl || undefined,
        extra: parsedExtra
      };

      const SB_URL = `https://${getProjectRef()}.supabase.co`;
      const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

      let endpoint = '';
      let requestBody: any = { payload };

      if (mode === 'all') {
        // Call webpush-send with ALL audience
        endpoint = `${SB_URL}/functions/v1/webpush-send`;
        requestBody.audience = 'all';
      } else if (mode === 'single') {
        // Call webpush-targeted-send with single user_id
        endpoint = `${SB_URL}/functions/v1/webpush-targeted-send`;
        requestBody.user_ids = userId.trim();
      } else if (mode === 'multi') {
        // Call webpush-targeted-send with multiple user_ids
        endpoint = `${SB_URL}/functions/v1/webpush-targeted-send`;
        const ids = userIds.split(/[\n,]/).map(s => s.trim()).filter(Boolean);
        const uniqueIds = [...new Set(ids)];
        requestBody.user_ids = uniqueIds;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminToken,
          'apikey': ANON_KEY
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setResult(data);
        toast.success(`Push sent: ${data.sent}/${data.total}`);
        
        // Add to history
        const newEntry = {
          time: new Date().toLocaleTimeString(),
          mode: mode.toUpperCase(),
          sent: data.sent,
          failed: data.failed
        };
        setLastSends(prev => [newEntry, ...prev].slice(0, 5));
      } else {
        setResult(data);
        toast.error(data.error || 'Failed to send push');
      }
    } catch (error: any) {
      toast.error(error.message || 'Network error');
      console.error('[Push Center] Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Audience Mode */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold">Audience Mode</Label>
        <RadioGroup value={mode} onValueChange={(v) => setMode(v as AudienceMode)}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="all" id="mode-all" />
            <Label htmlFor="mode-all" className="cursor-pointer">ALL - Broadcast to all active subscriptions</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="single" id="mode-single" />
            <Label htmlFor="mode-single" className="cursor-pointer">SINGLE - Send to one User ID</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="multi" id="mode-multi" />
            <Label htmlFor="mode-multi" className="cursor-pointer">MULTI - Send to multiple User IDs (max 100)</Label>
          </div>
        </RadioGroup>
      </div>

      {/* Admin Token */}
      <div className="space-y-2">
        <Label htmlFor="admin-token">Admin Token *</Label>
        <Input
          id="admin-token"
          type="password"
          placeholder="Enter PUSH_ADMIN_TOKEN"
          value={adminToken}
          onChange={(e) => setAdminToken(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">Required for all send operations</p>
      </div>

      {/* Target (SINGLE/MULTI) */}
      {mode === 'single' && (
        <div className="space-y-2">
          <Label htmlFor="user-id">User ID *</Label>
          <Input
            id="user-id"
            placeholder="uuid-user-id"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          />
        </div>
      )}

      {mode === 'multi' && (
        <div className="space-y-2">
          <Label htmlFor="user-ids">User IDs * (one per line or comma-separated)</Label>
          <Textarea
            id="user-ids"
            className="min-h-[100px] font-mono text-sm"
            placeholder="uuid-1&#10;uuid-2&#10;uuid-3"
            value={userIds}
            onChange={(e) => setUserIds(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">Max 100 users per batch</p>
        </div>
      )}

      {/* Payload Fields */}
      <div className="space-y-2">
        <Label htmlFor="title">Title * (max 80 chars)</Label>
        <Input
          id="title"
          placeholder="🔔 Your notification title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={80}
        />
        <p className="text-xs text-muted-foreground">{title.length}/80</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="body">Body * (max 240 chars)</Label>
        <Textarea
          id="body"
          className="min-h-[80px]"
          placeholder="Your notification message"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          maxLength={240}
        />
        <p className="text-xs text-muted-foreground">{body.length}/240</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="url">Link URL (optional)</Label>
        <Input
          id="url"
          placeholder="/notifications or https://..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="image-url">Image URL (optional, https only)</Label>
        <Input
          id="image-url"
          placeholder="https://example.com/image.jpg"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="extra">Extra Payload (JSON, optional)</Label>
        <Textarea
          id="extra"
          className="min-h-[60px] font-mono text-sm"
          placeholder='{"key": "value"}'
          value={extra}
          onChange={(e) => setExtra(e.target.value)}
        />
      </div>

      {/* Send Button */}
      <Button
        onClick={handleSend}
        disabled={isLoading}
        className="w-full"
        size="lg"
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

      {/* Result Banner */}
      {result && (
        <Card className={`p-4 border-2 ${result.success && result.sent > 0 ? 'border-green-500 bg-green-500/10' : 'border-red-500 bg-red-500/10'}`}>
          <div className="flex items-start gap-3">
            {result.success && result.sent > 0 ? (
              <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" />
            ) : (
              <XCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
            )}
            <div className="space-y-2 flex-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold">
                  {result.success ? 'Push Sent' : 'Push Failed'}
                </span>
                <span className="text-sm text-muted-foreground">
                  {result.sent}/{result.total} sent
                </span>
              </div>
              {result.message && (
                <p className="text-sm">{result.message}</p>
              )}
              {result.failed > 0 && (
                <div className="space-y-1">
                  <p className="text-sm font-medium">Failed: {result.failed}</p>
                  {result.errors && result.errors.length > 0 && (
                    <div className="text-xs space-y-1 bg-black/20 p-2 rounded">
                      {result.errors.slice(0, 5).map((err, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <AlertCircle className="w-3 h-3 flex-shrink-0 mt-0.5" />
                          <span>
                            {err.user_id && `User: ${err.user_id.slice(0, 8)}... - `}
                            {err.reason || 'Unknown error'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Last Sends (UI only, volatile) */}
      {lastSends.length > 0 && (
        <Card className="p-4">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Recent Sends
          </h3>
          <div className="space-y-2">
            {lastSends.map((send, i) => (
              <div key={i} className="flex items-center justify-between text-sm border-b border-border/50 pb-2 last:border-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <span className="text-muted-foreground">{send.time}</span>
                  <span className="font-mono text-xs bg-primary/10 px-2 py-0.5 rounded">{send.mode}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-500">{send.sent} sent</span>
                  {send.failed > 0 && (
                    <span className="text-red-500">{send.failed} failed</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
