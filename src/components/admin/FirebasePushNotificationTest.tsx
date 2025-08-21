// © 2025 M1SSION™ – NIYVORA KFT – Joseph MULÉ
// M1SSION™ Firebase Push Notification Test Component

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface TestResult {
  success: boolean;
  sent_count: number;
  failed_count: number;
  total_tokens: number;
  timestamp: string;
  error?: string;
}

export const FirebasePushNotificationTest = () => {
  const [isTesting, setIsTesting] = useState(false);
  const [testUserId, setTestUserId] = useState('');
  const [testTitle, setTestTitle] = useState('🔥 M1SSION™ Firebase TEST');
  const [testMessage, setTestMessage] = useState('Test Firebase push notification from M1SSION™');
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [fcmTokens, setFcmTokens] = useState<any[]>([]);
  const [loadingTokens, setLoadingTokens] = useState(false);

  // Load FCM tokens from database
  const loadFCMTokens = async () => {
    setLoadingTokens(true);
    try {
      const { data, error } = await supabase
        .from('user_push_tokens')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error loading FCM tokens:', error);
        toast.error('Errore caricamento token FCM');
        return;
      }

      setFcmTokens(data || []);
      console.log('🔥 FCM tokens loaded:', data?.length || 0);
    } catch (error) {
      console.error('Failed to load FCM tokens:', error);
      toast.error('Errore caricamento FCM tokens');
    } finally {
      setLoadingTokens(false);
    }
  };

  // Test Firebase push notification
  const testFirebasePushNotification = async () => {
    if (!testTitle.trim() || !testMessage.trim()) {
      toast.error('Inserisci titolo e messaggio');
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      console.log('🔥 Testing Firebase push notification...');

      // Log test in admin_logs
      await supabase
        .from('admin_logs')
        .insert({
          event_type: 'firebase_push_test',
          note: `Firebase Push Test - Title: ${testTitle}, User: ${testUserId || 'broadcast'}`,
          context: 'admin_panel_custom_test'
        });

      const payload: any = {
        title: testTitle,
        body: testMessage,
        additionalData: {
          test: true,
          timestamp: new Date().toISOString(),
          source: 'admin_panel_test'
        }
      };

      // Add user_id if specified, otherwise broadcast
      if (testUserId.trim()) {
        payload.user_id = [testUserId.trim()];
      } else {
        payload.broadcast = true;
      }

      const { data, error } = await supabase.functions.invoke('send-firebase-push', {
        body: payload
      });

      if (error) {
        console.error('❌ Firebase Edge Function error:', error);
        setTestResult({
          success: false,
          sent_count: 0,
          failed_count: 0,
          total_tokens: 0,
          timestamp: new Date().toISOString(),
          error: error.message
        });
        toast.error('Errore Firebase Edge Function: ' + error.message);
        return;
      }

      console.log('✅ Firebase push test result:', data);
      setTestResult(data);

      if (data.success) {
        toast.success(`✅ Firebase push inviato con successo!`, {
          description: `Inviato: ${data.sent_count}/${data.total_tokens} dispositivi`
        });
      } else {
        toast.error(`❌ Firebase push fallito`, {
          description: data.error || 'Errore sconosciuto'
        });
      }

    } catch (error) {
      console.error('💥 Firebase test failed:', error);
      setTestResult({
        success: false,
        sent_count: 0,
        failed_count: 0,
        total_tokens: 0,
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      toast.error('Test Firebase fallito: ' + (error instanceof Error ? error.message : 'Errore sconosciuto'));
    } finally {
      setIsTesting(false);
    }
  };

  // Use FCM token for single user test
  const useFCMToken = (token: any) => {
    setTestUserId(token.user_id);
    toast.success('User ID selezionato per test FCM', {
      description: `User: ${token.user_id}`
    });
  };

  return (
    <div className="space-y-6">
      {/* FCM Tokens */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            🔥 FCM Tokens Disponibili
            <Button 
              onClick={loadFCMTokens} 
              disabled={loadingTokens}
              variant="outline"
              size="sm"
            >
              {loadingTokens ? 'Caricamento...' : 'Ricarica FCM Tokens'}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {fcmTokens.length === 0 ? (
            <p className="text-muted-foreground">
              Nessun token FCM trovato. 
              <br />
              Attiva le notifiche Firebase da un dispositivo per generare token.
            </p>
          ) : (
            <div className="space-y-3">
              {fcmTokens.map((token, index) => (
                <div 
                  key={token.id} 
                  className="p-3 border rounded-lg bg-muted/30"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-1 rounded text-xs font-medium bg-orange-100 text-orange-700">
                          🔥 Firebase FCM
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(token.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm font-mono break-all">
                        User: {token.user_id}
                      </p>
                      <p className="text-xs text-muted-foreground font-mono">
                        Token: {token.fcm_token.substring(0, 40)}...
                      </p>
                    </div>
                    <Button 
                      onClick={() => useFCMToken(token)}
                      size="sm"
                      variant="outline"
                    >
                      Usa User ID
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
          <CardTitle>🔥 Test Firebase Push Notification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">User ID (opzionale - lascia vuoto per broadcast)</label>
            <Input
              value={testUserId}
              onChange={(e) => setTestUserId(e.target.value)}
              placeholder="User ID specifico o vuoto per broadcast..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Titolo</label>
              <Input
                value={testTitle}
                onChange={(e) => setTestTitle(e.target.value)}
                placeholder="Titolo notifica Firebase"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Messaggio</label>
              <Input
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                placeholder="Messaggio notifica Firebase"
              />
            </div>
          </div>

          <Button 
            onClick={testFirebasePushNotification}
            disabled={isTesting || !testTitle.trim() || !testMessage.trim()}
            className="w-full"
          >
            {isTesting ? '🔥 Invio Firebase in corso...' : '🔥 Invia Test Firebase Push'}
          </Button>
        </CardContent>
      </Card>

      {/* Test Results */}
      {testResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {testResult.success ? '✅' : '❌'} Risultato Test Firebase
              <span className={`px-2 py-1 rounded text-xs ${
                testResult.success 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                Firebase FCM
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <strong>Status:</strong> {testResult.success ? 'SUCCESS' : 'FAILED'}
              </div>
              <div>
                <strong>Sent Count:</strong> {testResult.sent_count}
              </div>
              <div>
                <strong>Failed Count:</strong> {testResult.failed_count}
              </div>
              <div>
                <strong>Total Tokens:</strong> {testResult.total_tokens}
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
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};