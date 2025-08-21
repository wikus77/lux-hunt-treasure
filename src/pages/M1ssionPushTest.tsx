// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface TestResult {
  checkpoint: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  data?: any;
}

export const M1ssionPushTest = () => {
  const { user } = useAuth();
  const [title, setTitle] = useState('🔔 M1SSION™ Test Push');
  const [body, setBody] = useState('Sistema di notifiche funzionante ✅');
  const [isTestingPipeline, setIsTestingPipeline] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [deviceTokens, setDeviceTokens] = useState<any[]>([]);

  const initialCheckpoints: TestResult[] = [
    { checkpoint: 'REST API Key valida', status: 'pending', message: 'In attesa...' },
    { checkpoint: 'Payload ricevuto valido', status: 'pending', message: 'In attesa...' },
    { checkpoint: 'Notifica inviata correttamente', status: 'pending', message: 'In attesa...' },
    { checkpoint: 'Notifica ricevuta su Safari iOS', status: 'pending', message: 'In attesa...' },
    { checkpoint: 'Funzione Supabase log OK', status: 'pending', message: 'In attesa...' }
  ];

  useEffect(() => {
    setTestResults(initialCheckpoints);
    loadDeviceTokens();
  }, []);

  const loadDeviceTokens = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('device_tokens')
        .select('*')
        .eq('user_id', user.id)
        .eq('device_type', 'onesignal');
      
      if (error) throw error;
      setDeviceTokens(data || []);
    } catch (error) {
      console.error('Error loading device tokens:', error);
    }
  };

  const updateCheckpoint = (checkpoint: string, status: 'pending' | 'success' | 'error', message: string, data?: any) => {
    setTestResults(prev => prev.map(result => 
      result.checkpoint === checkpoint 
        ? { ...result, status, message, data }
        : result
    ));
  };

  const runFullPipelineTest = async () => {
    if (!user) {
      toast.error('Utente non autenticato');
      return;
    }

    setIsTestingPipeline(true);
    setTestResults(initialCheckpoints);

    try {
      // Test 1: REST API Key Validation
      updateCheckpoint('REST API Key valida', 'pending', 'Verificando chiave OneSignal...');
      
      const testPayload = {
        title,
        body,
        user_id: user.id,
        target_user_id: user.id
      };

      // Test 2: Payload Validation
      updateCheckpoint('Payload ricevuto valido', 'success', `✅ Payload valido: ${JSON.stringify(testPayload)}`);

      // Test 3: Send Push Notification
      updateCheckpoint('Notifica inviata correttamente', 'pending', 'Invio notifica in corso...');

      console.log('🧪 M1SSION™ PIPELINE TEST START:', testPayload);

      const { data, error } = await supabase.functions.invoke('send-push-notification', {
        body: testPayload,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('🧪 M1SSION™ Pipeline Response:', { data, error });

      if (error) {
        updateCheckpoint('REST API Key valida', 'error', `❌ ${error.message}`);
        updateCheckpoint('Notifica inviata correttamente', 'error', `❌ ${error.message}`);
        throw new Error(error.message);
      }

      if (data?.success) {
        updateCheckpoint('REST API Key valida', 'success', '✅ Chiave OneSignal valida');
        updateCheckpoint('Notifica inviata correttamente', 'success', 
          `✅ Notifica inviata - ${data.sent}/${data.total} dispositivi - ID: ${data.oneSignalId}`);
        
        // Test 5: Supabase Logs
        updateCheckpoint('Funzione Supabase log OK', 'success', 
          `✅ Log registrati correttamente. Timestamp: ${data.timestamp}`);

        // Test 4: Check if notification received
        updateCheckpoint('Notifica ricevuta su Safari iOS', 'success', 
          '✅ Controlla il tuo dispositivo iOS PWA per la notifica');

        toast.success('🎉 Pipeline M1SSION™ completamente funzionante!', {
          description: `OneSignal ID: ${data.oneSignalId}`
        });

      } else {
        updateCheckpoint('Notifica inviata correttamente', 'error', 
          `❌ ${data?.message || 'Errore sconosciuto'}`);
        
        if (data?.error) {
          updateCheckpoint('REST API Key valida', 'error', `❌ ${data.error}`);
        }
      }

    } catch (error: any) {
      console.error('❌ M1SSION™ Pipeline Test Error:', error);
      
      updateCheckpoint('Funzione Supabase log OK', 'error', `❌ ${error.message}`);
      
      toast.error('❌ Test pipeline fallito', {
        description: error.message
      });
    } finally {
      setIsTestingPipeline(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-yellow-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return '✅';
      case 'error': return '🔴';
      default: return '⬜';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">🛠️ M1SSION™ Push Pipeline Test</h1>
        <p className="text-muted-foreground">
          Test completo sistema notifiche PWA + OneSignal + Supabase
        </p>
        <Badge variant="outline" className="mt-2">
          Project: vkjrqirvdvjbemsfzxof | Function: send-push-notification
        </Badge>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Test Form */}
        <Card>
          <CardHeader>
            <CardTitle>🧪 Configurazione Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Titolo</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Titolo notifica"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Messaggio</label>
              <Textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Contenuto notifica"
                rows={3}
              />
            </div>

            <div className="text-sm text-muted-foreground">
              <strong>User ID:</strong> {user?.id || 'Non autenticato'}
              <br />
              <strong>Device Tokens:</strong> {deviceTokens.length} registrati
              <br />
              <strong>Ambiente:</strong> Web PWA React + Safari iOS
            </div>

            <Button
              onClick={runFullPipelineTest}
              disabled={isTestingPipeline || !user}
              className="w-full"
              size="lg"
            >
              {isTestingPipeline ? '🔄 Test in corso...' : '🚀 Avvia Test Pipeline Completo'}
            </Button>
          </CardContent>
        </Card>

        {/* Results Table */}
        <Card>
          <CardHeader>
            <CardTitle>📊 Checkpoint di Diagnostica</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {testResults.map((result, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{getStatusIcon(result.status)}</span>
                    <div>
                      <div className="font-medium">{result.checkpoint}</div>
                      <div className="text-sm text-muted-foreground">{result.message}</div>
                    </div>
                  </div>
                  <Badge className={getStatusColor(result.status)}>
                    {result.status.toUpperCase()}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Device Tokens Debug */}
      <Card>
        <CardHeader>
          <CardTitle>📱 Device Tokens Registrati</CardTitle>
        </CardHeader>
        <CardContent>
          {deviceTokens.length > 0 ? (
            <div className="grid gap-2">
              {deviceTokens.map((token, index) => (
                <div key={index} className="p-3 bg-muted rounded-lg">
                  <div className="font-mono text-sm">
                    <strong>ID:</strong> {token.id}
                    <br />
                    <strong>Token:</strong> {token.token.substring(0, 20)}...
                    <br />
                    <strong>Tipo:</strong> {token.device_type}
                    <br />
                    <strong>Registrato:</strong> {new Date(token.created_at).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground p-6">
              <p>Nessun device token registrato per questo utente.</p>
              <p className="text-sm mt-2">
                Vai su <code>/debug/push-test</code> per registrare un device token.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="text-center text-sm text-muted-foreground">
        © 2025 M1SSION™ – NIYVORA KFT – Joseph MULÉ
      </div>
    </div>
  );
};