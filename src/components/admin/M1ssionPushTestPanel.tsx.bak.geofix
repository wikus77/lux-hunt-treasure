// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
import React, { useState } from 'react';
const SUPABASE_PROJECT_ID = getProjectRef();
import { getProjectRef } from '@/lib/supabase/functionsBase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const M1ssionPushTestPanel = () => {
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  const testOneSignalConnection = async () => {
    setIsTestingConnection(true);
    setTestResult(null);

    try {
      console.log('🧪 M1SSION™ Testing OneSignal connection...');
      
      const testPayload = {
        title: '🧪 M1SSION™ Connection Test',
        body: 'Testing OneSignal API connection with new REST API Key',
        user_id: 'test_user_connection',
        target_user_id: 'broadcast'
      };

      const { data, error } = await supabase.functions.invoke('send-push-notification', {
        body: testPayload,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('🧪 M1SSION™ Connection Test Result:', { data, error });

      if (error) {
        throw new Error(error.message);
      }

      setTestResult(data);

      if (data?.success) {
        toast.success('✅ OneSignal connection successful!', {
          description: `Recipients: ${data.sent}/${data.total} | ID: ${data.oneSignalId}`
        });
      } else {
        toast.error('❌ OneSignal connection failed', {
          description: data?.message || 'Unknown error'
        });
      }

    } catch (error: any) {
      console.error('❌ Connection test failed:', error);
      setTestResult({ success: false, error: error.message });
      toast.error('Connection test failed', {
        description: error.message
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🛠️ M1SSION™ OneSignal Pipeline Test
          <Badge variant="outline">REST API v2</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          <p><strong>Project ID:</strong> {SUPABASE_PROJECT_ID}</p>
          <p><strong>OneSignal App ID:</strong> 50cb75f7-f065-4626-9a63-ce5692fa7e70</p>
          <p><strong>Function:</strong> send-push-notification</p>
          <p><strong>API Key:</strong> {testResult?.keyFormat || 'Not tested yet'}</p>
        </div>

        <Button
          onClick={testOneSignalConnection}
          disabled={isTestingConnection}
          className="w-full"
          size="lg"
        >
          {isTestingConnection ? '🔄 Testing Connection...' : '🧪 Test OneSignal Connection'}
        </Button>

        {testResult && (
          <div className="mt-4 p-4 border rounded-lg">
            <h4 className="font-semibold mb-2">
              {testResult.success ? '✅ Test Results - SUCCESS' : '❌ Test Results - FAILED'}
            </h4>
            <pre className="text-xs bg-muted p-3 rounded overflow-auto">
              {JSON.stringify(testResult, null, 2)}
            </pre>
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          <p>This test verifies:</p>
          <ul className="list-disc list-inside ml-2 space-y-1">
            <li>✅ REST API Key format and validity</li>
            <li>✅ Supabase Edge Function deployment</li>
            <li>✅ OneSignal API connectivity</li>
            <li>✅ Broadcast notification capability</li>
            <li>✅ Database logging functionality</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};