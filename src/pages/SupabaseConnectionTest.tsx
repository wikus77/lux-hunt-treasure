/**
 * © 2025 Joseph MULÉ – M1SSION™ – Supabase Connection Test Page
 * 
 * Pagina diagnostica per verificare lo stato della connessione Supabase
 * dopo il remix e la riconnessione a un Supabase personale.
 * 
 * Accesso: /supabase-test
 */

import React, { useEffect, useState } from 'react';
import { verifySupabaseConnection, type ConnectionStatus } from '@/lib/supabase/verifyConnection';
import { SUPABASE_CONFIG } from '@/lib/supabase/config';
import { CheckCircle2, XCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function SupabaseConnectionTest() {
  const [status, setStatus] = useState<ConnectionStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const runTest = async () => {
    setLoading(true);
    const result = await verifySupabaseConnection();
    setStatus(result);
    setLoading(false);
  };

  useEffect(() => {
    runTest();
  }, []);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">🔍 Supabase Connection Test</h1>
            <p className="text-muted-foreground mt-2">
              Post-Remix diagnostic tool
            </p>
          </div>
          <Button onClick={runTest} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Re-test
          </Button>
        </div>

        {/* Configuration Card */}
        <Card>
          <CardHeader>
            <CardTitle>Current Configuration</CardTitle>
            <CardDescription>Environment variables detected</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Project Ref</p>
                <p className="font-mono text-sm mt-1">{SUPABASE_CONFIG.projectRef || '❌ Not found'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">URL</p>
                <p className="font-mono text-sm mt-1 truncate" title={SUPABASE_CONFIG.url}>
                  {SUPABASE_CONFIG.url || '❌ Not found'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Anon Key</p>
                <p className="font-mono text-sm mt-1">
                  {SUPABASE_CONFIG.anonKey ? `${SUPABASE_CONFIG.anonKey.substring(0, 20)}...` : '❌ Not found'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Functions URL</p>
                <p className="font-mono text-sm mt-1 truncate" title={SUPABASE_CONFIG.functionsUrl}>
                  {SUPABASE_CONFIG.functionsUrl || '❌ Not found'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Connection Status Card */}
        {status && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Connection Status</CardTitle>
                <Badge variant={status.connected ? 'default' : 'destructive'}>
                  {status.connected ? '✅ Connected' : '❌ Disconnected'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Errors */}
              {status.errors.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <XCircle className="w-5 h-5 text-destructive" />
                    <h3 className="font-semibold text-destructive">Errors ({status.errors.length})</h3>
                  </div>
                  <ul className="space-y-2 ml-7">
                    {status.errors.map((error, i) => (
                      <li key={i} className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                        {error}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Warnings */}
              {status.warnings.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-500" />
                    <h3 className="font-semibold text-yellow-500">Warnings ({status.warnings.length})</h3>
                  </div>
                  <ul className="space-y-2 ml-7">
                    {status.warnings.map((warning, i) => (
                      <li key={i} className="text-sm text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950/20 p-3 rounded-md">
                        {warning}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Success */}
              {status.connected && status.errors.length === 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <h3 className="font-semibold text-green-500">All Checks Passed!</h3>
                  </div>
                  <p className="text-sm text-muted-foreground ml-7">
                    Your Supabase connection is configured correctly and working as expected.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Instructions Card */}
        <Card>
          <CardHeader>
            <CardTitle>Next Steps</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">✅ If all checks passed:</h4>
              <p className="text-sm text-muted-foreground ml-4">
                Your migration is complete! The project is now connected to your personal Supabase.
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">❌ If you see errors:</h4>
              <ol className="text-sm text-muted-foreground ml-4 space-y-1 list-decimal list-inside">
                <li>Go to <strong>Settings → Tools → Supabase</strong></li>
                <li>Verify your Supabase credentials are correct</li>
                <li>Try reconnecting the integration</li>
                <li>Rebuild the project (automatic)</li>
                <li>Return here and click "Re-test"</li>
              </ol>
            </div>
            
            <div className="mt-4 p-4 bg-muted rounded-md">
              <p className="text-sm">
                📖 For detailed migration instructions, see{' '}
                <code className="bg-background px-2 py-1 rounded">SUPABASE_MIGRATION_GUIDE.md</code>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
