// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { Send, Bell, Zap, CheckCircle, XCircle, Clock } from 'lucide-react';

export const M1ssionPushTestForm = () => {
  const [title, setTitle] = useState('🎯 M1SSION™ Test Custom');
  const [body, setBody] = useState('Questo è un test personalizzato della notifica push');
  const [isSending, setIsSending] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);
  const { user } = useUnifiedAuth();

  const handleSendTest = async () => {
    if (!title.trim() || !body.trim()) {
      toast.error('❌ Inserisci titolo e messaggio');
      return;
    }

    if (!user?.id) {
      toast.error('❌ Utente non autenticato');
      return;
    }

    setIsSending(true);
    setLastResult(null);

    try {
      console.log('🚀 M1SSION™ CUSTOM PUSH TEST START');
      console.log('📤 Payload:', { title: title.trim(), body: body.trim(), target_user_id: user.id });

      const { data, error } = await supabase.functions.invoke('send-push-notification', {
        body: {
          title: title.trim(),
          body: body.trim(),
          target_user_id: user.id,
          data: {
            url: '/notifications',
            timestamp: new Date().toISOString(),
            test_mode: true
          }
        }
      });

      console.log('📨 Function Response:', { data, error });

      const result = {
        success: !error && data,
        timestamp: new Date().toISOString(),
        data,
        error,
        title: title.trim(),
        body: body.trim()
      };

      setLastResult(result);

      if (error) {
        console.error('❌ Push Test Error:', error);
        toast.error(`❌ Test fallito: ${error.message}`);
      } else {
        console.log('✅ Push Test Success:', data);
        toast.success(`✅ Notifica inviata!`, {
          description: `Dispositivi: ${data?.total || 0} | Inviati: ${data?.sent || 0}`
        });
      }

    } catch (err: any) {
      console.error('❌ Push Test Exception:', err);
      setLastResult({
        success: false,
        timestamp: new Date().toISOString(),
        error: err?.message || String(err) || 'Errore di connessione',
        title: title.trim(),
        body: body.trim()
      });
      toast.error('❌ Errore di connessione');
    } finally {
      setIsSending(false);
    }
  };

  const handleQuickTest = (preset: 'welcome' | 'urgent' | 'info') => {
    const presets = {
      welcome: {
        title: '🎉 Benvenuto in M1SSION™',
        body: 'La tua avventura inizia ora! Controlla la mappa per nuovi indizi.'
      },
      urgent: {
        title: '🚨 Alert M1SSION™',
        body: 'Nuovo obiettivo critico rilevato nella tua area!'
      },
      info: {
        title: '📰 Aggiornamento M1SSION™',
        body: 'Sono disponibili nuove funzionalità. Aggiorna l\'app ora!'
      }
    };

    setTitle(presets[preset].title);
    setBody(presets[preset].body);
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
              <Send className="w-5 h-5 text-white" />
            </div>
            🚀 M1SSION™ Push Test Custom
            <Badge variant="secondary">LIVE TEST</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <Bell className="w-4 h-4" />
            <AlertDescription>
              <strong>Test Personalizzato:</strong> Inserisci il tuo messaggio personalizzato e invia una notifica push di test.
              La notifica verrà inviata solo al tuo dispositivo registrato.
            </AlertDescription>
          </Alert>

          {/* Quick Presets */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">⚡ Quick Presets:</h3>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickTest('welcome')}
                className="text-xs"
              >
                🎉 Welcome
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickTest('urgent')}
                className="text-xs"
              >
                🚨 Urgent
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickTest('info')}
                className="text-xs"
              >
                📰 Info
              </Button>
            </div>
          </div>

          {/* Form */}
          <div className="grid gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">📝 Titolo Notifica</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Inserisci il titolo..."
                className="w-full"
                maxLength={60}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {title.length}/60 caratteri
              </p>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">💬 Messaggio</label>
              <Textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Inserisci il messaggio della notifica..."
                className="w-full min-h-[100px]"
                maxLength={160}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {body.length}/160 caratteri
              </p>
            </div>
          </div>

          {/* Preview */}
          {(title || body) && (
            <div className="border rounded-lg p-4 bg-muted/30">
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                📱 Anteprima Notifica:
              </h4>
              <div className="bg-background border rounded-lg p-3 max-w-sm">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 rounded bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">M</span>
                  </div>
                  <span className="text-xs text-muted-foreground">M1SSION™</span>
                  <span className="text-xs text-muted-foreground ml-auto">ora</span>
                </div>
                <p className="font-semibold text-sm">{title || 'Titolo...'}</p>
                <p className="text-sm text-muted-foreground">{body || 'Messaggio...'}</p>
              </div>
            </div>
          )}

          {/* Send Button */}
          <Button
            onClick={handleSendTest}
            disabled={isSending || !title.trim() || !body.trim()}
            className="w-full"
            size="lg"
          >
            {isSending ? (
              <>
                <Clock className="w-4 h-4 mr-2 animate-spin" />
                Invio in corso...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                🚀 INVIA TEST PUSH
              </>
            )}
          </Button>

          {/* User Info */}
          <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
            <p><strong>👤 Target:</strong> {user?.email}</p>
            <p><strong>🆔 User ID:</strong> {user?.id}</p>
            <p><strong>⏰ Timestamp:</strong> {new Date().toLocaleString()}</p>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {lastResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {lastResult.success ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500" />
              )}
              Risultato Test
              <Badge variant={lastResult.success ? 'default' : 'destructive'}>
                {lastResult.success ? 'SUCCESSO' : 'FALLITO'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>📝 Titolo:</strong> {lastResult.title}
                </div>
                <div>
                  <strong>⏰ Timestamp:</strong> {new Date(lastResult.timestamp).toLocaleString()}
                </div>
              </div>
              
              <div>
                <strong>💬 Messaggio:</strong>
                <p className="text-muted-foreground">{lastResult.body}</p>
              </div>

              {lastResult.success && lastResult.data && (
                <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg">
                  <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">✅ Dettagli Successo:</h4>
                  <div className="text-sm text-green-700 dark:text-green-300">
                    <p><strong>Dispositivi totali:</strong> {lastResult.data.total || 0}</p>
                    <p><strong>Notifiche inviate:</strong> {lastResult.data.sent || 0}</p>
                    {lastResult.data.notification_id && (
                      <p><strong>OneSignal ID:</strong> {lastResult.data.notification_id}</p>
                    )}
                  </div>
                </div>
              )}

              {!lastResult.success && (
                <div className="bg-red-50 dark:bg-red-950 p-3 rounded-lg">
                  <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2">❌ Errore:</h4>
                  <p className="text-sm text-red-700 dark:text-red-300">
                    {typeof lastResult.error === 'string' ? lastResult.error : String(lastResult.error || 'Errore sconosciuto')}
                  </p>
                </div>
              )}

              <div className="text-xs bg-muted p-3 rounded overflow-auto">
                <strong>🔍 Debug Raw:</strong>
                <pre className="mt-1">{(() => {
                  try {
                    return JSON.stringify(lastResult, null, 2);
                  } catch (e) {
                    return 'Errore nel debug display: ' + String(e);
                  }
                })()}</pre>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="text-center text-xs text-muted-foreground mt-6">
        © 2025 M1SSION™ – NIYVORA KFT – Joseph MULÉ
      </div>
    </div>
  );
};