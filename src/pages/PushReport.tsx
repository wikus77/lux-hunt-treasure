// @ts-nocheck
// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PushReportData {
  subscriptions: Array<{
    endpoint: string;
    platform: string;
    endpoint_type: string;
    created_at: string;
    p256dh_length: number;
    auth_length: number;
  }>;
  canary_results: {
    sent: number;
    failed: number;
    total_processed: number;
    pass_rate: number;
    results: Array<{
      endpoint_type: string;
      status: string;
      status_code?: number;
      error?: string;
    }>;
  } | null;
  service_workers: Array<{
    scriptURL: string;
    state: string;
    scope: string;
  }>;
  vapid_status: {
    valid: boolean;
    length: number;
    error?: string;
  };
}

export const PushReport = () => {
  const [report, setReport] = useState<PushReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);

  const generateReport = async () => {
    setLoading(true);
    try {
      // Get subscriptions
      const { data: subscriptions } = await supabase
        .from('push_subscriptions')
        .select('endpoint, platform, endpoint_type, created_at, p256dh, auth')
        .order('created_at', { ascending: false })
        .limit(10);

      // Check service workers
      let serviceWorkers: any[] = [];
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        serviceWorkers = registrations.map(reg => ({
          scriptURL: reg.active?.scriptURL || 'No active SW',
          state: reg.active?.state || 'No active SW',
          scope: reg.scope
        }));
      }

      // Check VAPID status
      let vapidStatus = { valid: false, length: 0, error: 'Not checked' };
      try {
        const response = await fetch('/vapid-public.txt');
        const vapidKey = await response.text();
        vapidStatus = {
          valid: vapidKey.length > 40,
          length: vapidKey.length,
          error: vapidKey.length > 40 ? undefined : 'Key too short'
        };
      } catch (error) {
        vapidStatus.error = error instanceof Error ? error.message : 'Unknown error';
      }

      setReport({
        subscriptions: (subscriptions || []).map(sub => ({
          ...sub,
          p256dh_length: sub.p256dh?.length || 0,
          auth_length: sub.auth?.length || 0
        })),
        canary_results: null,
        service_workers: serviceWorkers,
        vapid_status: vapidStatus
      });

    } catch (error) {
      console.error('Report generation error:', error);
      toast.error('Errore generazione report');
    } finally {
      setLoading(false);
    }
  };

  const runCanaryTest = async () => {
    setTesting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase.functions.invoke('send-push-canary', {
        body: {
          user_id: user?.id,
          title: 'M1SSION™ Test',
          body: 'Test push da report diagnostico',
          link: 'https://m1ssion.eu/push-report',
          broadcast: false
        }
      });

      if (error) throw error;

      setReport(prev => prev ? {
        ...prev,
        canary_results: {
          ...data,
          pass_rate: ((data.sent / (data.sent + data.failed)) * 100) || 0
        }
      } : null);

      toast.success(`Test completato: ${data.sent} inviati, ${data.failed} falliti`);

    } catch (error) {
      console.error('Canary test error:', error);
      toast.error('Errore test canary');
    } finally {
      setTesting(false);
    }
  };

  useEffect(() => {
    generateReport();
  }, []);

  const getStatusColor = (status: string, value?: number) => {
    if (status === 'success' || (value && value >= 99)) return 'bg-green-500';
    if (status === 'failed' || (value && value < 80)) return 'bg-red-500';
    return 'bg-yellow-500';
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">📊 Report Push Notifications</h1>
        <div className="space-x-2">
          <Button onClick={generateReport} disabled={loading}>
            {loading ? '🔄' : '📊'} Aggiorna Report
          </Button>
          <Button onClick={runCanaryTest} disabled={testing || !report?.subscriptions.length}>
            {testing ? '🔄' : '🧪'} Test Canary
          </Button>
        </div>
      </div>

      {!report ? (
        <div className="text-center py-8">
          <div className="animate-pulse">📊 Generazione report...</div>
        </div>
      ) : (
        <div className="grid gap-6">
          {/* VAPID Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🔑 Status VAPID
                <Badge variant={report.vapid_status.valid ? 'default' : 'destructive'}>
                  {report.vapid_status.valid ? 'Valido' : 'Errore'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Lunghezza chiave:</strong> {report.vapid_status.length}
                </div>
                <div>
                  <strong>Status:</strong> {report.vapid_status.valid ? '✅ OK' : '❌ Errore'}
                </div>
                {report.vapid_status.error && (
                  <div className="col-span-2 text-red-400">
                    <strong>Errore:</strong> {report.vapid_status.error}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Service Workers */}
          <Card>
            <CardHeader>
              <CardTitle>⚙️ Service Workers Registrati</CardTitle>
            </CardHeader>
            <CardContent>
              {report.service_workers.length === 0 ? (
                <div className="text-yellow-400">⚠️ Nessun Service Worker registrato</div>
              ) : (
                <div className="space-y-2">
                  {report.service_workers.map((sw, index) => (
                    <div key={index} className="border rounded p-3 text-sm">
                      <div><strong>Script:</strong> {sw.scriptURL}</div>
                      <div><strong>State:</strong> {sw.state}</div>
                      <div><strong>Scope:</strong> {sw.scope}</div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Subscriptions */}
          <Card>
            <CardHeader>
              <CardTitle>📱 Subscriptions ({report.subscriptions.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {report.subscriptions.length === 0 ? (
                <div className="text-yellow-400">⚠️ Nessuna subscription trovata</div>
              ) : (
                <div className="space-y-3">
                  {report.subscriptions.map((sub, index) => (
                    <div key={index} className="border rounded p-3 text-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">{sub.endpoint_type}</Badge>
                        <Badge variant="outline">{sub.platform}</Badge>
                      </div>
                      <div><strong>Endpoint:</strong> {sub.endpoint.substring(0, 60)}...</div>
                      <div>
                        <strong>Keys:</strong> p256dh={sub.p256dh_length}B, auth={sub.auth_length}B
                        {(sub.p256dh_length !== 88 || sub.auth_length !== 24) && (
                          <span className="text-red-400 ml-2">⚠️ Lunghezza invalida</span>
                        )}
                      </div>
                      <div><strong>Creata:</strong> {new Date(sub.created_at).toLocaleDateString()}</div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Canary Results */}
          {report.canary_results && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🧪 Risultati Test Canary
                  <Badge 
                    variant={report.canary_results.pass_rate >= 99 ? 'default' : 'destructive'}
                  >
                    {report.canary_results.pass_rate.toFixed(1)}%
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 mb-4 text-center">
                  <div className="border rounded p-3">
                    <div className="text-2xl font-bold text-green-400">{report.canary_results.sent}</div>
                    <div className="text-sm">Inviati</div>
                  </div>
                  <div className="border rounded p-3">
                    <div className="text-2xl font-bold text-red-400">{report.canary_results.failed}</div>
                    <div className="text-sm">Falliti</div>
                  </div>
                  <div className="border rounded p-3">
                    <div className="text-2xl font-bold">{report.canary_results.total_processed}</div>
                    <div className="text-sm">Totale</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <strong>Dettagli per endpoint:</strong>
                  {report.canary_results.results.map((result, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <Badge variant="outline">{result.endpoint_type}</Badge>
                      <Badge variant={result.status === 'success' ? 'default' : 'destructive'}>
                        {result.status}
                      </Badge>
                      {result.status_code && <span>HTTP {result.status_code}</span>}
                      {result.error && <span className="text-red-400">{result.error}</span>}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Items */}
          <Card>
            <CardHeader>
              <CardTitle>🔧 Azioni Raccomandate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                {!report.vapid_status.valid && (
                  <div className="text-red-400">❌ Configurare correttamente le chiavi VAPID</div>
                )}
                {report.service_workers.length === 0 && (
                  <div className="text-yellow-400">⚠️ Registrare Service Worker</div>
                )}
                {report.subscriptions.length === 0 && (
                  <div className="text-yellow-400">⚠️ Creare almeno una subscription di test</div>
                )}
                {report.canary_results && report.canary_results.pass_rate < 99 && (
                  <div className="text-red-400">❌ Investigare fallimenti nell'invio push</div>
                )}
                {(!report.canary_results || report.canary_results.pass_rate >= 99) && 
                 report.subscriptions.length > 0 && 
                 report.vapid_status.valid && (
                  <div className="text-green-400">✅ Sistema push funzionante correttamente</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};