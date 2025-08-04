/*
 * 🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™
 * M1SSION™ Push Notification Test Component
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface TestResult {
  success: boolean;
  device_type: string;
  response: any;
  timestamp: string;
  error?: string;
}

export const PushNotificationTest = () => {
  const [isTesting, setIsTesting] = useState(false);
  const [testToken, setTestToken] = useState('');
  const [testTitle, setTestTitle] = useState('🎯 M1SSION™ TEST');
  const [testMessage, setTestMessage] = useState('Test push notification from M1SSION™');
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [deviceTokens, setDeviceTokens] = useState<any[]>([]);
  const [loadingTokens, setLoadingTokens] = useState(false);

  // Load device tokens from database
  const loadDeviceTokens = async () => {
    setLoadingTokens(true);
    try {
      const { data, error } = await supabase
        .from('device_tokens')
        .select('*')
        .in('device_type', ['ios', 'android'])
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error loading device tokens:', error);
        toast.error('Errore caricamento token');
        return;
      }

      setDeviceTokens(data || []);
      console.log('📱 Device tokens loaded:', data?.length || 0);
    } catch (error) {
      console.error('Failed to load tokens:', error);
      toast.error('Errore caricamento device tokens');
    } finally {
      setLoadingTokens(false);
    }
  };

  // Test push notification with real token
  const testPushNotification = async () => {
    if (!testToken.trim()) {
      toast.error('Inserisci un token valido');
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      console.log('🧪 Testing push notification with token:', testToken.substring(0, 20) + '...');

      const { data, error } = await supabase.functions.invoke('send-push-notification', {
        body: {
          token: testToken,
          title: testTitle,
          body: testMessage,
          sound: 'default',
          badge: 1,
          data: {
            test: true,
            timestamp: new Date().toISOString()
          }
        }
      });

      if (error) {
        console.error('❌ Edge Function error:', error);
        setTestResult({
          success: false,
          device_type: 'unknown',
          response: null,
          timestamp: new Date().toISOString(),
          error: error.message
        });
        toast.error('Errore Edge Function: ' + error.message);
        return;
      }

      console.log('✅ Push test result:', data);
      setTestResult(data);

      if (data.success) {
        toast.success(`✅ Push inviato con successo (${data.device_type})`, {
          description: 'Controlla il dispositivo per la ricezione'
        });
      } else {
        toast.error(`❌ Push fallito (${data.device_type})`, {
          description: JSON.stringify(data.response)
        });
      }

    } catch (error) {
      console.error('💥 Test failed:', error);
      setTestResult({
        success: false,
        device_type: 'unknown',
        response: null,
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      toast.error('Test fallito: ' + (error instanceof Error ? error.message : 'Errore sconosciuto'));
    } finally {
      setIsTesting(false);
    }
  };

  // Use device token from list
  const useDeviceToken = (token: string) => {
    setTestToken(token);
    toast.success('Token selezionato', {
      description: `Token: ${token.substring(0, 30)}...`
    });
  };

  return (
    <div className="space-y-6">
      {/* Device Tokens */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            🎯 Device Tokens Disponibili
            <Button 
              onClick={loadDeviceTokens} 
              disabled={loadingTokens}
              variant="outline"
              size="sm"
            >
              {loadingTokens ? 'Caricamento...' : 'Ricarica Tokens'}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {deviceTokens.length === 0 ? (
            <p className="text-muted-foreground">
              Nessun token iOS/Android trovato. 
              <br />
              Attiva le notifiche push da un dispositivo mobile per generare token.
            </p>
          ) : (
            <div className="space-y-3">
              {deviceTokens.map((token, index) => (
                <div 
                  key={token.id} 
                  className="p-3 border rounded-lg bg-muted/30"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          token.device_type === 'ios' 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {token.device_type === 'ios' ? '🍎 iOS' : '🤖 Android'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(token.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm font-mono break-all">
                        {token.token.substring(0, 60)}...
                      </p>
                    </div>
                    <Button 
                      onClick={() => useDeviceToken(token.token)}
                      size="sm"
                      variant="outline"
                    >
                      Usa Token
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Test Form */}
      <Card>
        <CardHeader>
          <CardTitle>🧪 Test Push Notification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Token Device (iOS/Android)</label>
            <Textarea
              value={testToken}
              onChange={(e) => setTestToken(e.target.value)}
              placeholder="Inserisci token iOS o Android..."
              className="font-mono text-xs"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Titolo</label>
              <Input
                value={testTitle}
                onChange={(e) => setTestTitle(e.target.value)}
                placeholder="Titolo notifica"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Messaggio</label>
              <Input
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                placeholder="Messaggio notifica"
              />
            </div>
          </div>

          <Button 
            onClick={testPushNotification}
            disabled={isTesting || !testToken.trim()}
            className="w-full"
          >
            {isTesting ? 'Invio in corso...' : '🚀 Invia Test Push'}
          </Button>
        </CardContent>
      </Card>

      {/* Test Results */}
      {testResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {testResult.success ? '✅' : '❌'} Risultato Test
              <span className={`px-2 py-1 rounded text-xs ${
                testResult.success 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {testResult.device_type}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <strong>Status:</strong> {testResult.success ? 'SUCCESS' : 'FAILED'}
              </div>
              <div>
                <strong>Device Type:</strong> {testResult.device_type}
              </div>
              <div>
                <strong>Timestamp:</strong> {new Date(testResult.timestamp).toLocaleString()}
              </div>
              
              {testResult.error && (
                <div>
                  <strong className="text-red-600">Error:</strong>
                  <pre className="bg-red-50 p-2 rounded text-xs mt-1 overflow-auto">
                    {testResult.error}
                  </pre>
                </div>
              )}
              
              {testResult.response && (
                <div>
                  <strong>Response:</strong>
                  <pre className="bg-muted p-2 rounded text-xs mt-1 overflow-auto">
                    {JSON.stringify(testResult.response, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

/*
 * 🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */