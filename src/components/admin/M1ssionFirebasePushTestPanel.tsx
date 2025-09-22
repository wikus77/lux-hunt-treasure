// © 2025 M1SSION™ – NIYVORA KFT – Joseph MULÉ
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { invokePushFunction } from '@/lib/push/pushApi';

export const M1ssionFirebasePushTestPanel = () => {
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  const testFirebaseConnection = async () => {
    setIsTestingConnection(true);
    setTestResult(null);

    try {
      console.log('🔥 M1SSION™ Testing Push Blindata Connection...');
      
      // Log test in admin_logs
      await supabase
        .from('admin_logs')
        .insert({
          event_type: 'push_blindata_test',
          note: 'Push Test Blindata - M1SSION Panel™ test',
          context: 'admin_panel_quick_test'
        });
      
      const testPayload = {
        title: '🔥 M1SSION™ Push Blindata Test',
        body: 'Test notifiche push blindate da M1SSION Panel™',
        url: '/panel-access',
        icon: '/icon-192.png',
        badge: '/badge.png'
      };

      // Use push_test for single test with blindata headers
      const result = await invokePushFunction('push_test', {
        token: 'test-token-m1ssion-panel',
        payload: testPayload
      });

      console.log('🔥 M1SSION™ Push Blindata Test Result:', result);

      setTestResult(result);

      if (result?.ok) {
        toast.success('✅ Push Blindata connection successful!', {
          description: `Test push inviato con successo tramite catena blindata`
        });
      } else {
        toast.error('❌ Push Blindata connection failed', {
          description: result?.message || result?.error || 'Unknown error'
        });
      }

    } catch (error: any) {
      console.error('❌ Push Blindata test failed:', error);
      setTestResult({ ok: false, error: error.message });
      toast.error('Push Blindata test failed', {
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
            🔐 M1SSION™ Push Blindata Test
            <Badge variant="outline">BLINDATA</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">
            <p><strong>Project ID:</strong> vkjrqirvdvjbemsfzxof</p>
            <p><strong>Push Type:</strong> M1SSION™ Blindata Chain</p>
            <p><strong>Function:</strong> push_test (Blindata)</p>
            <p><strong>Status:</strong> {testResult?.ok ? '✅ Connected' : 'Ready to test'}</p>
          </div>

          <Button
            onClick={testFirebaseConnection}
            disabled={isTestingConnection}
            className="w-full"
            size="lg"
          >
            {isTestingConnection ? '🔄 Testing Push Blindata...' : '🔐 Test Push Blindata'}
          </Button>

          {testResult && (
            <div className="mt-4 p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">
                {testResult.ok ? '✅ Push Blindata Test Results - SUCCESS' : '❌ Push Blindata Test Results - FAILED'}
              </h4>
              <pre className="text-xs bg-muted p-3 rounded overflow-auto">
                {JSON.stringify(testResult, null, 2)}
              </pre>
            </div>
          )}

          <div className="text-xs text-muted-foreground">
            <p>This Push Blindata test verifies:</p>
            <ul className="list-disc list-inside ml-2 space-y-1">
              <li>✅ X-M1-Dropper-Version header validation</li>
              <li>✅ CORS blindata protection</li>
              <li>✅ Admin authorization check</li>
              <li>✅ Edge Function push_test execution</li>
              <li>✅ SAFE_HEADERS compliance</li>
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