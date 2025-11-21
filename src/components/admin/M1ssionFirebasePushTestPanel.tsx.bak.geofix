// © 2025 M1SSION™ – NIYVORA KFT – Joseph MULÉ
import React, { useState } from 'react';
const SUPABASE_PROJECT_ID = getProjectRef();
import { getProjectRef } from '@/lib/supabase/functionsBase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const M1ssionFirebasePushTestPanel = () => {
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  const testFirebaseConnection = async () => {
    setIsTestingConnection(true);
    setTestResult(null);

    try {
      console.log('🔥 M1SSION™ Testing Firebase FCM connection...');
      
      // Log test in admin_logs
      await supabase
        .from('admin_logs')
        .insert({
          event_type: 'firebase_push_test',
          note: 'Push Test Quick - Firebase FCM connection test',
          context: 'admin_panel_quick_test'
        });
      
      const testPayload = {
        title: '🔥 M1SSION™ Firebase Test',
        body: 'Test Firebase Cloud Messaging da M1SSION Panel™',
        broadcast: true,
        additionalData: {
          source: 'admin_panel_quick_test',
          timestamp: new Date().toISOString()
        }
      };

      const { data, error } = await supabase.functions.invoke('send-firebase-push', {
        body: testPayload,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('🔥 M1SSION™ Firebase Test Result:', { data, error });

      if (error) {
        throw new Error(error.message);
      }

      setTestResult(data);

      if (data?.success) {
        toast.success('✅ Firebase FCM connection successful!', {
          description: `Sent: ${data.sent_count || 0} devices | Failed: ${data.failed_count || 0}`
        });
      } else {
        toast.error('❌ Firebase FCM connection failed', {
          description: data?.message || 'Unknown error'
        });
      }

    } catch (error: any) {
      console.error('❌ Firebase connection test failed:', error);
      setTestResult({ success: false, error: error.message });
      toast.error('Firebase connection test failed', {
        description: error.message
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const testDeprecatedOneSignal = () => {
    toast.info('🟧 OneSignal Deprecated', {
      description: 'Sistema notifiche push aggiornato a Firebase FCM - questo test non è più attivo'
    });
  };

  return (
    <div className="space-y-4 mb-6">
      {/* Firebase Test Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🔥 M1SSION™ Firebase FCM Pipeline Test
            <Badge variant="outline">FCM V1</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">
            <p><strong>Project ID:</strong> {SUPABASE_PROJECT_ID}</p>
            <p><strong>Firebase Project:</strong> m1ssion-app</p>
            <p><strong>Function:</strong> send-firebase-push</p>
            <p><strong>Status:</strong> {testResult?.success ? '✅ Connected' : 'Ready to test'}</p>
          </div>

          <Button
            onClick={testFirebaseConnection}
            disabled={isTestingConnection}
            className="w-full"
            size="lg"
          >
            {isTestingConnection ? '🔄 Testing Firebase FCM...' : '🔥 Test Firebase Connection'}
          </Button>

          {testResult && (
            <div className="mt-4 p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">
                {testResult.success ? '✅ Firebase Test Results - SUCCESS' : '❌ Firebase Test Results - FAILED'}
              </h4>
              <pre className="text-xs bg-muted p-3 rounded overflow-auto">
                {JSON.stringify(testResult, null, 2)}
              </pre>
            </div>
          )}

          <div className="text-xs text-muted-foreground">
            <p>This Firebase test verifies:</p>
            <ul className="list-disc list-inside ml-2 space-y-1">
              <li>✅ Firebase Server Key validity</li>
              <li>✅ Supabase Edge Function deployment</li>
              <li>✅ Firebase FCM API connectivity</li>
              <li>✅ FCM token retrieval from database</li>
              <li>✅ Broadcast notification capability</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Deprecated OneSignal Panel */}
      <Card className="opacity-60 bg-muted/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-muted-foreground">
            🟧 OneSignal Debug Test
            <Badge variant="secondary" className="bg-orange-100 text-orange-700">
              Deprecated
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">
            <p>⚠️ Sistema OneSignal dismesso</p>
            <p>Tutte le notifiche push ora utilizzano Firebase Cloud Messaging</p>
          </div>

          <Button
            onClick={testDeprecatedOneSignal}
            disabled={true}
            variant="outline"
            className="w-full opacity-50 cursor-not-allowed"
            size="lg"
          >
            🟧 OneSignal Test (Deprecated)
          </Button>

          <div className="text-xs text-muted-foreground">
            <p className="text-orange-600">
              ⚠️ Tooltip: Sistema notifiche push aggiornato a Firebase – questo test non è più attivo
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};