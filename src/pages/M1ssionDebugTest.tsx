// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

export const M1ssionDebugTest = () => {
  const [isTestingRaw, setIsTestingRaw] = useState(false);
  const [debugResult, setDebugResult] = useState<any>(null);

  const testRawAPI = async () => {
    setIsTestingRaw(true);
    setDebugResult(null);

    try {
      console.log('🧪 M1SSION™ RAW API TEST');
      
      // Test diretto senza Supabase functions
      const directPayload = {
        app_id: "50cb75f7-f065-4626-9a63-ce5692fa7e70",
        included_segments: ["Subscribed Users"],
        contents: { "en": "🧪 DIRECT M1SSION™ API TEST" },
        headings: { "en": "Test Diretto OneSignal" }
      };

      console.log('📡 Testing direct OneSignal API...');

      const response = await fetch('https://onesignal.com/api/v1/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic os_v2_app_kdfxl57qmvdcngtdzzljf6t6od5lu3aqsvfuepv3ssgtn2suiajfh72u3cdgn57kni5akugzkqb5ufocgblyjt7q4vi5yy6fdxr7fna`,
          'Accept': 'application/json'
        },
        body: JSON.stringify(directPayload)
      });

      const result = await response.json();
      
      console.log('🔔 Direct OneSignal Result:', { 
        status: response.status, 
        result,
        headers: Object.fromEntries(response.headers.entries())
      });

      setDebugResult({
        success: response.ok,
        status: response.status,
        result,
        method: 'DIRECT_API_CALL',
        timestamp: new Date().toISOString()
      });

      if (response.ok) {
        toast.success('✅ Direct OneSignal API Success!', {
          description: `Notification ID: ${result.id}`
        });
      } else {
        toast.error('❌ Direct OneSignal API Failed', {
          description: `Status: ${response.status}`
        });
      }

    } catch (error: any) {
      console.error('❌ Direct API Test Error:', error);
      setDebugResult({
        success: false,
        error: error.message,
        method: 'DIRECT_API_CALL',
        timestamp: new Date().toISOString()
      });
      toast.error('Direct API test failed', {
        description: error.message
      });
    } finally {
      setIsTestingRaw(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🔧 M1SSION™ RAW API DEBUG
            <Badge variant="destructive">EMERGENCY TEST</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription>
              Test diretto dell'API OneSignal per verificare se il problema è nella configurazione o nell'Edge Function.
            </AlertDescription>
          </Alert>

          <div className="text-sm text-muted-foreground space-y-2">
            <p><strong>🔑 OneSignal App ID:</strong> 50cb75f7-f065-4626-9a63-ce5692fa7e70</p>
            <p><strong>🔐 REST API Key:</strong> os_v2_app_...6fdxr7fna (configurata)</p>
            <p><strong>📡 Target:</strong> https://onesignal.com/api/v1/notifications</p>
            <p><strong>📱 Audience:</strong> Subscribed Users (broadcast)</p>
          </div>

          <Button
            onClick={testRawAPI}
            disabled={isTestingRaw}
            className="w-full"
            size="lg"
            variant="destructive"
          >
            {isTestingRaw ? '🔄 Testing Direct API...' : '🧪 TEST DIRECT ONESIGNAL API'}
          </Button>

          {debugResult && (
            <div className="mt-6 p-4 border rounded-lg">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                {debugResult.success ? '✅ SUCCESS' : '❌ FAILED'}
                <Badge variant={debugResult.success ? 'default' : 'destructive'}>
                  Status: {debugResult.status || 'ERROR'}
                </Badge>
              </h4>
              
              <div className="text-xs bg-muted p-3 rounded overflow-auto">
                <pre>{JSON.stringify(debugResult, null, 2)}</pre>
              </div>

              <div className="mt-4 text-sm">
                <p><strong>Timestamp:</strong> {debugResult.timestamp}</p>
                <p><strong>Method:</strong> {debugResult.method}</p>
                {debugResult.result?.id && (
                  <p><strong>OneSignal ID:</strong> {debugResult.result.id}</p>
                )}
              </div>
            </div>
          )}

          <div className="text-xs text-muted-foreground border-t pt-4">
            <h5 className="font-semibold mb-2">🧪 Diagnostica:</h5>
            <ul className="list-disc list-inside space-y-1">
              <li>Se questo test funziona → Problema nell'Edge Function Supabase</li>
              <li>Se questo test fallisce → Problema nella configurazione OneSignal</li>
              <li>Status 400 → Payload malformato</li>
              <li>Status 401 → API Key non valida</li>
              <li>Status 429 → Rate limit superato</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <div className="text-center text-sm text-muted-foreground">
        © 2025 M1SSION™ – NIYVORA KFT – Joseph MULÉ
      </div>
    </div>
  );
};