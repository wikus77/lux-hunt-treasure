import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TestResult {
  success: boolean;
  backend_status?: string;
  secrets?: Record<string, string>;
  tests?: Record<string, string>;
  message?: string;
  error?: string;
  details?: string;
  timestamp?: string;
}

export function PushBackendTest() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);

  const testBackend = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      console.log('🧪 [PUSH-BACKEND-TEST] Avvio test backend...');
      
      const { data, error } = await supabase.functions.invoke('push_test', {
        headers: {
          'X-M1-Dropper-Version': 'v1',
          'X-Client-Info': 'm1ssion-test'
        },
        body: { test: true }
      });

      if (error) {
        console.error('❌ [PUSH-BACKEND-TEST] Error:', error);
        toast.error('Test backend fallito: ' + error.message);
        setResult({
          success: false,
          error: error.message,
          timestamp: new Date().toISOString()
        });
        return;
      }

      console.log('✅ [PUSH-BACKEND-TEST] Risultato:', data);
      setResult(data);
      
      if (data.success) {
        toast.success('Backend push testato con successo!');
      } else {
        toast.error('Test fallito: ' + (data.error || 'Unknown error'));
      }

    } catch (err: any) {
      console.error('❌ [PUSH-BACKEND-TEST] Exception:', err);
      toast.error('Errore durante il test: ' + err.message);
      setResult({
        success: false,
        error: err.message,
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getBadgeVariant = (value: string): "default" | "secondary" | "destructive" | "outline" => {
    if (value.includes('VERIFICATO') || value.includes('SUCCESSO') || value.includes('ATTIVI') || value.includes('CONFIGURATO')) {
      return 'default';
    }
    if (value.includes('MANCANTE') || value.includes('ERRORE') || value.includes('NON_TESTATO')) {
      return 'destructive';
    }
    return 'secondary';
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🧪 Test Backend Push M1SSION™
          <Badge variant="outline">BLINDATO</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          Testa tutti i componenti backend delle notifiche push: Edge Functions, secrets, database, VAPID.
        </div>

        <Button 
          onClick={testBackend} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? 'Testing...' : '🚀 Testa Backend Push'}
        </Button>

        {result && (
          <div className="space-y-4 mt-4">
            <div className="flex items-center gap-2">
              <span className="font-semibold">Status:</span>
              <Badge variant={result.success ? 'default' : 'destructive'}>
                {result.success ? '✅ SUCCESSO' : '❌ FALLITO'}
              </Badge>
              {result.backend_status && (
                <Badge variant="outline">{result.backend_status}</Badge>
              )}
            </div>

            {result.secrets && (
              <div>
                <h4 className="font-semibold mb-2">🔑 Secrets:</h4>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(result.secrets).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center p-2 bg-muted rounded">
                      <span className="text-sm">{key.replace(/_/g, ' ').toUpperCase()}:</span>
                      <Badge variant={getBadgeVariant(value)} className="text-xs">
                        {value}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.tests && (
              <div>
                <h4 className="font-semibold mb-2">🧪 Tests:</h4>
                <div className="grid grid-cols-1 gap-2">
                  {Object.entries(result.tests).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center p-2 bg-muted rounded">
                      <span className="text-sm">{key.replace(/_/g, ' ').toUpperCase()}:</span>
                      <Badge variant={getBadgeVariant(value)} className="text-xs">
                        {value}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.message && (
              <div className="p-3 bg-primary/10 rounded border">
                <span className="text-sm font-medium">{result.message}</span>
              </div>
            )}

            {result.error && (
              <div className="p-3 bg-destructive/10 rounded border border-destructive/20">
                <span className="text-sm text-destructive">❌ {result.error}</span>
                {result.details && (
                  <div className="text-xs text-muted-foreground mt-1">{result.details}</div>
                )}
              </div>
            )}

            {result.timestamp && (
              <div className="text-xs text-muted-foreground">
                Testato: {new Date(result.timestamp).toLocaleString('it-IT')}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}