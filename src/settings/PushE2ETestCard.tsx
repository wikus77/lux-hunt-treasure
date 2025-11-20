/**
 * © 2025 Joseph MULÉ – M1SSION™ – PUSH E2E TEST CARD
 * Dev/Admin only - E2E push notification test with logs
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Send, CheckCircle, XCircle } from 'lucide-react';

interface PushLog {
  id: number;
  status: string;
  channel: string;
  message_tag: string;
  created_at: string;
  details: any;
}

export const PushE2ETestCard: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<PushLog[]>([]);
  const [lastTestResult, setLastTestResult] = useState<any>(null);

  const runE2ETest = async () => {
    setLoading(true);
    try {
      // Call push-self-test edge function
      const { data, error } = await supabase.functions.invoke('push-self-test', {
        body: { tag: `e2e-${Date.now()}` }
      });

      if (error) throw error;

      setLastTestResult(data);
      toast.success('✅ Push E2E test inviato!');

      // Fetch updated logs
      setTimeout(fetchLogs, 1000);
    } catch (error: any) {
      console.error('[PushE2ETest] Error:', error);
      toast.error('❌ Test fallito: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('get-push-logs', {
        body: { limit: 10 }
      });

      if (error) throw error;

      setLogs(data?.logs || []);
    } catch (error: any) {
      console.error('[PushE2ETest] Failed to fetch logs:', error);
    }
  };

  React.useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <Card className="border-yellow-500/20 bg-yellow-500/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="w-5 h-5" />
          Push E2E Test
        </CardTitle>
        <CardDescription>
          Test end-to-end delle notifiche push (dev/admin only)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={runE2ETest}
          disabled={loading}
          className="w-full"
          variant="outline"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Test in corso...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Esegui Test E2E
            </>
          )}
        </Button>

        {lastTestResult && (
          <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-sm">
            <div className="font-medium">Ultimo test:</div>
            <div className="text-xs mt-1 opacity-80">
              Tag: {lastTestResult.tag}
            </div>
            <div className="text-xs opacity-80">
              Log ID: {lastTestResult.logId}
            </div>
          </div>
        )}

        <div className="space-y-2">
          <div className="text-sm font-medium flex items-center justify-between">
            <span>Log recenti:</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchLogs}
              disabled={loading}
            >
              Aggiorna
            </Button>
          </div>
          
          {logs.length === 0 ? (
            <div className="text-xs opacity-60 text-center py-4">
              Nessun log disponibile
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="p-2 rounded bg-muted/50 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{log.channel}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-xs ${
                        log.status === 'delivered'
                          ? 'bg-green-500/20 text-green-400'
                          : log.status === 'sent'
                          ? 'bg-blue-500/20 text-blue-400'
                          : log.status === 'failed'
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}
                    >
                      {log.status}
                    </span>
                  </div>
                  {log.message_tag && (
                    <div className="opacity-60">Tag: {log.message_tag}</div>
                  )}
                  <div className="opacity-40">
                    {new Date(log.created_at).toLocaleString('it-IT')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
