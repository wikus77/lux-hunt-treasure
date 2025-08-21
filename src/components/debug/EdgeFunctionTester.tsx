// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const EdgeFunctionTester = () => {
  const [isTestingEdgeFunction, setIsTestingEdgeFunction] = useState(false);
  const [edgeResult, setEdgeResult] = useState<any>(null);

  const testEdgeFunctionDirect = async () => {
    setIsTestingEdgeFunction(true);
    setEdgeResult(null);

    try {
      console.log('🧪 M1SSION™ EDGE FUNCTION DIRECT TEST');
      
      // Test payload
      const testPayload = {
        title: "🔧 M1SSION™ Edge Test",
        body: "Test diretto dell'Edge Function con debug completo",
        user_id: "495246c1-9154-4f01-a428-7f37fe230180",
        target_user_id: "495246c1-9154-4f01-a428-7f37fe230180"
      };

      console.log('📡 Testing Edge Function with payload:', testPayload);

      const { data, error } = await supabase.functions.invoke('send-push-notification', {
        body: testPayload
      });

      console.log('🔔 Edge Function Response:', { 
        data, 
        error,
        timestamp: new Date().toISOString()
      });

      setEdgeResult({
        success: !error,
        data: data || null,
        error: error || null,
        method: 'EDGE_FUNCTION_INVOKE',
        timestamp: new Date().toISOString()
      });

      if (error) {
        toast.error('❌ Edge Function Failed', {
          description: `Error: ${error.message}`
        });
      } else {
        toast.success('✅ Edge Function Success!', {
          description: `Response: ${data?.message || 'OK'}`
        });
      }

    } catch (error: any) {
      console.error('❌ Edge Function Test Error:', error);
      setEdgeResult({
        success: false,
        error: {
          message: error?.message || String(error),
          details: error
        },
        method: 'EDGE_FUNCTION_INVOKE',
        timestamp: new Date().toISOString()
      });
      toast.error('Edge Function test failed', {
        description: error?.message || String(error)
      });
    } finally {
      setIsTestingEdgeFunction(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🔧 M1SSION™ EDGE FUNCTION TESTER
          <Badge variant="outline">DEBUG MODE</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertDescription>
            Test diretto dell'Edge Function Supabase per identificare il problema specifico.
          </AlertDescription>
        </Alert>

        <div className="text-sm text-muted-foreground space-y-2">
          <p><strong>🎯 Target:</strong> send-push-notification Edge Function</p>
          <p><strong>📱 Test User ID:</strong> 495246c1-9154-4f01-a428-7f37fe230180</p>
          <p><strong>🔍 Diagnostica:</strong> Verifica configurazione API Key e risposta dettagliata</p>
        </div>

        <Button
          onClick={testEdgeFunctionDirect}
          disabled={isTestingEdgeFunction}
          className="w-full"
          size="lg"
          variant="outline"
        >
          {isTestingEdgeFunction ? '🔄 Testing Edge Function...' : '🧪 TEST EDGE FUNCTION DIRECT'}
        </Button>

        {edgeResult && (
          <div className="mt-6 p-4 border rounded-lg">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              {edgeResult.success ? '✅ SUCCESS' : '❌ FAILED'}
              <Badge variant={edgeResult.success ? 'default' : 'destructive'}>
                Edge Function Test
              </Badge>
            </h4>
            
            <div className="text-xs bg-muted p-3 rounded overflow-auto">
              <pre>{(() => {
                try {
                  return JSON.stringify(edgeResult, null, 2);
                } catch (e) {
                  return 'Errore nel debug display: ' + String(e);
                }
              })()}</pre>
            </div>

            <div className="mt-4 text-sm">
              <p><strong>Timestamp:</strong> {edgeResult.timestamp}</p>
              <p><strong>Method:</strong> {edgeResult.method}</p>
              {edgeResult.data?.oneSignalId && (
                <p><strong>OneSignal ID:</strong> {edgeResult.data.oneSignalId}</p>
              )}
              {edgeResult.error && (
                <p className="text-red-600"><strong>Error:</strong> {
                  typeof edgeResult.error === 'string' 
                    ? edgeResult.error 
                    : edgeResult.error.message || String(edgeResult.error)
                }</p>
              )}
            </div>
          </div>
        )}

        <div className="text-xs text-muted-foreground border-t pt-4">
          <h5 className="font-semibold mb-2">🧪 Diagnostica Edge Function:</h5>
          <ul className="list-disc list-inside space-y-1">
            <li>Se funziona → OneSignal API Key configurata correttamente</li>
            <li>Se fallisce con 500 → Problema nell'Edge Function o configurazione</li>
            <li>Se fallisce con 401 → OneSignal API Key non valida o mancante</li>
            <li>Se fallisce con timeout → Problema di connessione OneSignal</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};