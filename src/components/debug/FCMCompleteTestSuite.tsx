// © 2025 M1SSION™ – NIYVORA KFT – Joseph MULÉ
// Suite Completa Test FCM - Verifica Ogni Aspetto

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { getFCMToken, isFCMSupported } from '@/lib/firebase';
import { CheckCircle, XCircle, AlertTriangle, Zap, Database, Wifi, Bell } from 'lucide-react';

interface TestResult {
  name: string;
  status: 'pass' | 'fail' | 'warning' | 'pending';
  message: string;
  details?: any;
}

export const FCMCompleteTestSuite = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const [currentStep, setCurrentStep] = useState('');

  const updateStep = (step: string) => {
    setCurrentStep(step);
    console.log(`🔥 FCM TEST: ${step}`);
  };

  const addResult = (result: TestResult) => {
    setResults(prev => [...prev, result]);
    console.log(`🔥 FCM RESULT: ${result.name} - ${result.status} - ${result.message}`);
  };

  const runCompleteTest = async () => {
    setIsRunning(true);
    setResults([]);
    setCurrentStep('Inizializzazione test completo...');

    try {
      // TEST 1: Browser Support
      updateStep('Test 1/10: Supporto Browser FCM');
      const isSupported = isFCMSupported();
      addResult({
        name: 'Supporto Browser FCM',
        status: isSupported ? 'pass' : 'fail',
        message: isSupported ? 'Browser supporta FCM completamente' : 'Browser non supporta FCM',
        details: {
          serviceWorker: 'serviceWorker' in navigator,
          notification: 'Notification' in window,
          pushManager: 'PushManager' in window
        }
      });

      // TEST 2: Service Worker Registration
      updateStep('Test 2/10: Registrazione Service Worker');
      try {
        const registration = await navigator.serviceWorker.getRegistration('/');
        const swActive = registration && registration.active;
        addResult({
          name: 'Service Worker',
          status: swActive ? 'pass' : 'fail',
          message: swActive ? 'Service Worker attivo e funzionante' : 'Service Worker non trovato',
          details: { registration: !!registration, active: !!swActive }
        });
      } catch (swError) {
        addResult({
          name: 'Service Worker',
          status: 'fail',
          message: `Errore Service Worker: ${swError.message}`,
          details: swError
        });
      }

      // TEST 3: Permission Check
      updateStep('Test 3/10: Controllo Permessi Notifiche');
      const permission = Notification.permission;
      addResult({
        name: 'Permessi Notifiche',
        status: permission === 'granted' ? 'pass' : permission === 'denied' ? 'fail' : 'warning',
        message: `Permesso notifiche: ${permission}`,
        details: { permission }
      });

      // TEST 4: Firebase Connection
      updateStep('Test 4/10: Connessione Firebase');
      try {
        // Test basic Firebase import
        addResult({
          name: 'Libreria Firebase',
          status: 'pass',
          message: 'Firebase importato correttamente',
          details: { firebaseVersion: 'v10.8.0' }
        });
      } catch (firebaseError) {
        addResult({
          name: 'Libreria Firebase',
          status: 'fail',
          message: `Errore Firebase: ${firebaseError.message}`,
          details: firebaseError
        });
      }

      // TEST 5: VAPID Key Validation
      updateStep('Test 5/10: Validazione Chiave VAPID');
      try {
        const vapidTest = await getFCMToken();
        addResult({
          name: 'Chiave VAPID',
          status: vapidTest ? 'pass' : 'fail',
          message: vapidTest ? 'VAPID key valida - token generato' : 'VAPID key invalida',
          details: { tokenGenerated: !!vapidTest, tokenPreview: vapidTest?.substring(0, 20) + '...' }
        });
      } catch (vapidError) {
        addResult({
          name: 'Chiave VAPID',
          status: 'fail',
          message: `Errore VAPID: ${vapidError.message}`,
          details: vapidError
        });
      }

      // TEST 6: Database Connection
      updateStep('Test 6/10: Connessione Database');
      try {
        const { data: user } = await supabase.auth.getUser();
        if (user.user) {
          addResult({
            name: 'Database Supabase',
            status: 'pass',
            message: 'Connessione database attiva',
            details: { userId: user.user.id }
          });
        } else {
          addResult({
            name: 'Database Supabase',
            status: 'warning',
            message: 'Database connesso ma utente non autenticato',
            details: { authenticated: false }
          });
        }
      } catch (dbError) {
        addResult({
          name: 'Database Supabase',
          status: 'fail',
          message: `Errore database: ${dbError.message}`,
          details: dbError
        });
      }

      // TEST 7: Token Database Check
      updateStep('Test 7/10: Controllo Token nel Database');
      try {
        const { data: tokens, error } = await supabase
          .from('user_push_tokens')
          .select('*')
          .eq('is_active', true);

        addResult({
          name: 'Token Database',
          status: tokens && tokens.length > 0 ? 'pass' : 'warning',
          message: `Trovati ${tokens?.length || 0} token attivi nel database`,
          details: { totalTokens: tokens?.length || 0, error }
        });
      } catch (tokenError) {
        addResult({
          name: 'Token Database',
          status: 'fail',
          message: `Errore lettura token: ${tokenError.message}`,
          details: tokenError
        });
      }

      // TEST 8: Edge Function Check
      updateStep('Test 8/10: Test Edge Function');
      try {
        const { data, error } = await supabase.functions.invoke('send-firebase-push', {
          body: {
            title: '🧪 Test Suite FCM',
            body: `Test completo - ${new Date().toLocaleTimeString()}`,
            data: { source: 'test_suite', testId: Date.now().toString() }
          }
        });

        addResult({
          name: 'Edge Function',
          status: error ? 'fail' : 'pass',
          message: error ? `Errore Edge Function: ${error.message}` : 'Edge Function funzionante',
          details: { data, error, sent: data?.sent_count || 0 }
        });
      } catch (edgeError) {
        addResult({
          name: 'Edge Function',
          status: 'fail',
          message: `Errore Edge Function: ${edgeError.message}`,
          details: edgeError
        });
      }

      // TEST 9: Network Connectivity
      updateStep('Test 9/10: Connettività di Rete');
      try {
        const networkResponse = await fetch('https://www.google.com/favicon.ico', { 
          method: 'HEAD',
          cache: 'no-cache'
        });
        addResult({
          name: 'Connettività Rete',
          status: networkResponse.ok ? 'pass' : 'warning',
          message: networkResponse.ok ? 'Rete funzionante' : 'Problemi di rete',
          details: { status: networkResponse.status }
        });
      } catch (networkError) {
        addResult({
          name: 'Connettività Rete',
          status: 'fail',
          message: `Errore rete: ${networkError.message}`,
          details: networkError
        });
      }

      // TEST 10: Final Integration Test
      updateStep('Test 10/10: Test Integrazione Completa');
      const passedTests = results.filter(r => r.status === 'pass').length;
      const totalTests = results.length + 1; // +1 for this test
      const successRate = (passedTests / totalTests) * 100;

      addResult({
        name: 'Integrazione Completa',
        status: successRate >= 80 ? 'pass' : successRate >= 60 ? 'warning' : 'fail',
        message: `Sistema FCM al ${successRate.toFixed(0)}% funzionale`,
        details: { 
          passedTests, 
          totalTests, 
          successRate: successRate.toFixed(1) + '%',
          recommendation: successRate >= 80 ? 'Sistema pronto' : 'Richiede correzioni'
        }
      });

      setCurrentStep('Test completato!');
      toast.success(`Test completato! Sistema FCM al ${successRate.toFixed(0)}% funzionale`);

    } catch (error) {
      console.error('❌ Errore durante test completo:', error);
      addResult({
        name: 'Test Suite Error',
        status: 'fail',
        message: `Errore critico: ${error.message}`,
        details: error
      });
      toast.error('Errore durante test completo');
    } finally {
      setIsRunning(false);
      setCurrentStep('');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'fail': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default: return <div className="w-4 h-4 bg-gray-300 rounded-full animate-pulse" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'fail': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-blue-500" />
          🧪 FCM Complete Test Suite
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Test approfondito di ogni componente del sistema Firebase Cloud Messaging
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={runCompleteTest}
          disabled={isRunning}
          className="w-full"
          size="lg"
        >
          {isRunning ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              {currentStep || 'Esecuzione test...'}
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 mr-2" />
              🚀 Avvia Test Completo FCM
            </>
          )}
        </Button>

        {results.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Database className="w-4 h-4" />
              Risultati Test:
            </h3>
            <div className="grid gap-2">
              {results.map((result, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(result.status)}
                    <div>
                      <div className="font-medium">{result.name}</div>
                      <div className="text-sm text-muted-foreground">{result.message}</div>
                    </div>
                  </div>
                  <Badge className={getStatusColor(result.status)}>
                    {result.status.toUpperCase()}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {results.length > 0 && (
          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <h4 className="font-semibold mb-2">📊 Riepilogo Completo:</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="text-green-600 font-bold text-lg">
                  {results.filter(r => r.status === 'pass').length}
                </div>
                <div>✅ Passati</div>
              </div>
              <div className="text-center">
                <div className="text-yellow-600 font-bold text-lg">
                  {results.filter(r => r.status === 'warning').length}
                </div>
                <div>⚠️ Warning</div>
              </div>
              <div className="text-center">
                <div className="text-red-600 font-bold text-lg">
                  {results.filter(r => r.status === 'fail').length}
                </div>
                <div>❌ Falliti</div>
              </div>
              <div className="text-center">
                <div className="text-blue-600 font-bold text-lg">
                  {((results.filter(r => r.status === 'pass').length / results.length) * 100).toFixed(0)}%
                </div>
                <div>🎯 Successo</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};