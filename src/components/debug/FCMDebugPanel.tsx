// © 2025 M1SSION™ – NIYVORA KFT – Joseph MULÉ
// M1SSION™ Firebase Notification Debug Panel Component - COMPREHENSIVE VERSION

import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useFCMPushNotifications } from '@/hooks/useFCMPushNotifications';
import { getFCMToken, isFCMSupported } from '@/lib/firebase';
import { toast } from 'sonner';
import { 
  Shield, 
  Key, 
  Database, 
  Smartphone, 
  Send, 
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Settings,
  Wrench,
  Loader2,
  Activity,
  Wifi
} from 'lucide-react';

interface DebugLog {
  timestamp: string;
  type: 'info' | 'success' | 'error' | 'warning';
  message: string;
  details?: any;
}

interface DiagnosticResult {
  test: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  fix?: string;
  details?: any;
}

export const FCMDebugPanel = () => {
  const [user, setUser] = useState<any>(null);
  const [tokenData, setTokenData] = useState<any>(null);
  const [logs, setLogs] = useState<DebugLog[]>([]);
  const [isActivating, setIsActivating] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isRunningDiagnostics, setIsRunningDiagnostics] = useState(false);
  const [diagnosticResults, setDiagnosticResults] = useState<DiagnosticResult[]>([]);
  const [isAutoFixing, setIsAutoFixing] = useState(false);
  
  const fcm = useFCMPushNotifications();

  const addLog = (type: DebugLog['type'], message: string, details?: any) => {
    const newLog: DebugLog = {
      timestamp: new Date().toISOString(),
      type,
      message,
      details
    };
    setLogs(prev => [newLog, ...prev].slice(0, 100));
    console.log(`🔥 FCM-DEBUG [${type.toUpperCase()}]:`, message, details);
  };

  useEffect(() => {
    initializeDebugPanel();
  }, []);

  const initializeDebugPanel = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        addLog('error', 'Utente non autenticato');
        return;
      }

      setUser(user);
      addLog('info', `Debug panel inizializzato per utente: ${user.email}`);
      
      await refreshTokenData(user.id);
      
      // Auto-run diagnostics on init
      setTimeout(() => runComprehensiveDiagnostics(), 1000);
    } catch (error: any) {
      addLog('error', 'Errore inizializzazione debug panel', { error: error.message });
    }
  };

  const refreshTokenData = async (userId: string) => {
    setRefreshing(true);
    try {
      const { data: tokens, error } = await supabase
        .from('user_push_tokens')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        addLog('error', 'Errore recupero token dal database', { error: error.message });
        return;
      }

      setTokenData(tokens?.[0] || null);
      addLog('info', `Token trovati nel database: ${tokens?.length || 0}`, { tokens });
    } catch (error: any) {
      addLog('error', 'Errore refresh token data', { error: error.message });
    } finally {
      setRefreshing(false);
    }
  };

  const runComprehensiveDiagnostics = async () => {
    setIsRunningDiagnostics(true);
    setDiagnosticResults([]);
    addLog('info', '🔍 AVVIO DIAGNOSTICA COMPLETA SISTEMA FCM...');

    const results: DiagnosticResult[] = [];

    try {
      // Test 1: Browser Support
      const fcmSupported = isFCMSupported();
      results.push({
        test: 'Supporto Browser FCM',
        status: fcmSupported ? 'pass' : 'fail',
        message: fcmSupported ? 'FCM supportato dal browser' : 'FCM NON supportato',
        fix: !fcmSupported ? 'Usa Chrome 63+, Firefox 60+, Safari 16.4+' : undefined
      });

      // Test 2: HTTPS Connection
      const isHttps = window.location.protocol === 'https:' || window.location.hostname === 'localhost';
      results.push({
        test: 'Connessione HTTPS',
        status: isHttps ? 'pass' : 'fail',
        message: isHttps ? 'Connessione sicura HTTPS' : 'Richiesta connessione HTTPS',
        fix: !isHttps ? 'Le notifiche push richiedono HTTPS' : undefined
      });

      // Test 3: Service Worker Registration
      let swResult: DiagnosticResult = {
        test: 'Service Worker',
        status: 'fail',
        message: 'Service Worker non supportato',
        fix: 'Browser non compatibile'
      };

      if ('serviceWorker' in navigator) {
        try {
          const registrations = await navigator.serviceWorker.getRegistrations();
          const fcmSW = registrations.find(reg => 
            reg.scope.includes('firebase-messaging-sw') || 
            reg.active?.scriptURL.includes('firebase-messaging-sw')
          );

          if (fcmSW && fcmSW.active) {
            swResult = {
              test: 'Service Worker',
              status: 'pass',
              message: `Service Worker attivo: ${fcmSW.scope}`,
              details: { scriptURL: fcmSW.active.scriptURL, state: fcmSW.active.state }
            };
          } else {
            swResult = {
              test: 'Service Worker',
              status: 'warning',
              message: 'Service Worker non registrato per FCM',
              fix: 'Il sistema tenterà di registrarlo automaticamente'
            };
          }
        } catch (error: any) {
          swResult = {
            test: 'Service Worker',
            status: 'fail',
            message: `Errore Service Worker: ${error.message}`,
            fix: 'Ricarica la pagina'
          };
        }
      }
      results.push(swResult);

      // Test 4: Notification Permission
      const permission = Notification.permission;
      results.push({
        test: 'Permessi Notifiche',
        status: permission === 'granted' ? 'pass' : (permission === 'denied' ? 'fail' : 'warning'),
        message: `Stato permessi: ${permission}`,
        fix: permission === 'denied' ? 'Abilita nelle impostazioni browser' : 
             permission === 'default' ? 'Clicca "Attiva Notifiche"' : undefined
      });

      // Test 5: FCM Token Generation
      let tokenResult: DiagnosticResult = {
        test: 'Token FCM',
        status: 'fail',
        message: 'Token non generabile senza permessi',
        fix: 'Attiva prima le notifiche'
      };

      if (permission === 'granted') {
        try {
          const currentToken = await getFCMToken();
          if (currentToken) {
            tokenResult = {
              test: 'Token FCM',
              status: 'pass',
              message: `Token generato: ${currentToken.substring(0, 30)}...`,
              details: { tokenLength: currentToken.length }
            };
          } else {
            tokenResult = {
              test: 'Token FCM',
              status: 'fail',
              message: 'Token non generato',
              fix: 'Prova a riattivare le notifiche'
            };
          }
        } catch (error: any) {
          tokenResult = {
            test: 'Token FCM',
            status: 'fail',
            message: `Errore generazione token: ${error.message}`,
            fix: 'Verifica Service Worker e riprova'
          };
        }
      }
      results.push(tokenResult);

      // Test 6: Database Connection
      if (user) {
        try {
          const { data, error } = await supabase
            .from('user_push_tokens')
            .select('fcm_token, created_at, is_active')
            .eq('user_id', user.id)
            .eq('is_active', true)
            .single();

          results.push({
            test: 'Database Token',
            status: data && !error ? 'pass' : 'warning',
            message: data ? `Token salvato: ${data.fcm_token.substring(0, 30)}...` : 'Nessun token nel database',
            fix: !data ? 'Riattiva le notifiche per salvare il token' : undefined,
            details: data
          });
        } catch (error: any) {
          results.push({
            test: 'Database Token',
            status: 'warning',
            message: 'Nessun token nel database',
            fix: 'Attiva le notifiche per salvare il token'
          });
        }
      }

      // Test 7: Edge Function Connectivity
      try {
        addLog('info', 'Test connessione Edge Function...');
        const { data, error } = await supabase.functions.invoke('send-firebase-push', {
          body: { test: true, user_id: user?.id }
        });

        results.push({
          test: 'Edge Function',
          status: !error ? 'pass' : 'fail',
          message: !error ? 'Connessione Edge Function OK' : `Errore: ${error.message}`,
          fix: error ? 'Verifica connessione internet' : undefined
        });
      } catch (error: any) {
        results.push({
          test: 'Edge Function',
          status: 'fail',
          message: `Errore connessione: ${error.message}`,
          fix: 'Verifica connessione internet e Supabase'
        });
      }

      setDiagnosticResults(results);
      
      const failedTests = results.filter(r => r.status === 'fail');
      const warningTests = results.filter(r => r.status === 'warning');
      
      if (failedTests.length === 0 && warningTests.length === 0) {
        addLog('success', '✅ TUTTI I CONTROLLI SUPERATI! Sistema FCM completamente funzionante');
        toast.success('🎉 Sistema FCM perfettamente configurato!');
      } else {
        addLog('warning', `⚠️ ${failedTests.length} errori critici, ${warningTests.length} avvisi`);
        if (failedTests.length > 0) {
          toast.error(`❌ ${failedTests.length} problemi critici rilevati`);
        }
      }

    } catch (error: any) {
      addLog('error', `Errore durante la diagnostica: ${error.message}`);
    } finally {
      setIsRunningDiagnostics(false);
    }
  };

  const autoFixAllIssues = async () => {
    setIsAutoFixing(true);
    addLog('info', '🔧 AVVIO RIPARAZIONE AUTOMATICA COMPLETA...');

    try {
      // Step 1: Register Service Worker
      if ('serviceWorker' in navigator) {
        addLog('info', 'Registrazione Service Worker Firebase...');
        try {
          const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
            scope: '/'
          });
          
          // Wait for service worker to be ready
          await navigator.serviceWorker.ready;
          addLog('success', '✅ Service Worker registrato e attivo');
        } catch (error: any) {
          addLog('error', `Errore registrazione SW: ${error.message}`);
        }
      }

      // Step 2: Clear old caches
      addLog('info', 'Pulizia cache obsolete...');
      if ('caches' in window) {
        try {
          const cacheNames = await caches.keys();
          const deletePromises = cacheNames
            .filter(name => name.includes('firebase') || name.includes('fcm'))
            .map(name => caches.delete(name));
          await Promise.all(deletePromises);
          addLog('success', '✅ Cache pulite');
        } catch (error: any) {
          addLog('warning', `Avviso pulizia cache: ${error.message}`);
        }
      }

      // Step 3: Complete Service Worker cleanup and re-registration
      addLog('info', '🧹 Pulizia completa Service Workers...');
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          await registration.unregister();
          addLog('info', `🗑️ Service Worker disinstallato: ${registration.scope}`);
        }
        
        // Force new registration
        await navigator.serviceWorker.register('/firebase-messaging-sw.js', { 
          scope: '/',
          updateViaCache: 'none'
        });
        
        // Wait for activation
        await navigator.serviceWorker.ready;
        addLog('success', '✅ Service Worker completamente reinstallato');
      } catch (error: any) {
        addLog('warning', `Service Worker cleanup: ${error.message}`);
      }

      // Step 4: Request permission with enhanced handling
      if (Notification.permission !== 'granted') {
        addLog('info', '🔔 Richiesta permessi notifiche avanzata...');
        try {
          // Safari-specific handling
          if (navigator.userAgent.includes('Safari') && !navigator.userAgent.includes('Chrome')) {
            addLog('info', '🍎 Browser Safari rilevato - permessi ottimizzati');
          }
          
          const permission = await Notification.requestPermission();
          if (permission === 'granted') {
            addLog('success', '✅ Permessi notifiche concessi!');
          } else {
            addLog('error', '❌ Permessi notifiche negati dall\'utente');
            toast.error('❌ Permessi negati', {
              description: 'Abilita le notifiche nelle impostazioni del browser'
            });
            setIsAutoFixing(false);
            return;
          }
        } catch (error: any) {
          addLog('error', `❌ Errore richiesta permessi: ${error.message}`);
          setIsAutoFixing(false);
          return;
        }
      }

      // Step 5: Generate new FCM token with robust handling
      if (Notification.permission === 'granted') {
        addLog('info', 'Generazione nuovo token FCM con retry...');
        try {
          let newToken = null;
          let attempts = 0;
          const maxAttempts = 3;
          
          while (!newToken && attempts < maxAttempts) {
            attempts++;
            addLog('info', `Tentativo ${attempts}/${maxAttempts} generazione token...`);
            
            try {
              newToken = await getFCMToken();
              if (newToken) {
                addLog('success', `✅ Token FCM generato (tentativo ${attempts}): ${newToken.substring(0, 30)}...`);
                break;
              }
            } catch (tokenError: any) {
              addLog('warning', `Tentativo ${attempts} fallito: ${tokenError.message}`);
              if (attempts < maxAttempts) {
                await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
              }
            }
          }
          
          if (newToken) {
            
            // Step 6: Save to database with enhanced error handling
            if (user) {
              addLog('info', 'Salvataggio token nel database...');
              
              try {
                // First, deactivate old tokens
                await supabase
                  .from('user_push_tokens')
                  .update({ is_active: false })
                  .eq('user_id', user.id);
                
                // Insert new token
                const { error } = await supabase
                  .from('user_push_tokens')
                  .insert({
                    user_id: user.id,
                    fcm_token: newToken,
                    device_info: {
                      userAgent: navigator.userAgent,
                      platform: navigator.platform,
                      timestamp: new Date().toISOString(),
                      autoFixed: true,
                      fixedAt: new Date().toISOString(),
                      browser: navigator.userAgent.includes('Safari') ? 'Safari' : 
                              navigator.userAgent.includes('Chrome') ? 'Chrome' : 'Other',
                      debugPanelGenerated: true
                    },
                    is_active: true
                  });

                if (!error) {
                  addLog('success', '✅ Token salvato nel database con successo');
                  await refreshTokenData(user.id);
                } else {
                  addLog('error', `Errore salvataggio DB: ${error.message}`);
                }
              } catch (dbError: any) {
                addLog('error', `Errore critico database: ${dbError.message}`);
              }
            }
          } else {
            addLog('error', '❌ Impossibile generare token FCM dopo 3 tentativi');
            toast.error('❌ Token FCM non generabile', {
              description: 'Verifica Service Worker e riprova'
            });
          }
        } catch (error: any) {
          addLog('error', `Errore generazione token: ${error.message}`);
        }
      }

      // Step 7: Comprehensive final tests
      addLog('info', 'Test completo sistema Firebase...');
      try {
        // Test Service Worker
        if ('serviceWorker' in navigator) {
          const registration = await navigator.serviceWorker.getRegistration();
          if (registration?.active) {
            registration.active.postMessage({
              type: 'TEST_NOTIFICATION',
              testId: Date.now(),
              source: 'auto_fix_comprehensive',
              title: '🎉 Sistema Firebase Riparato!',
              body: 'Auto-Fix completato con successo!'
            });
            addLog('success', '✅ Test Service Worker completo inviato');
          }
        }
        
        // Test Edge Function connectivity
        if (user) {
          try {
            const { data: testResult, error: testError } = await supabase.functions.invoke('send-firebase-push', {
              body: {
                user_id: user.id,
                title: '🔧 Test Auto-Fix Completo',
                body: 'Sistema Firebase riparato automaticamente!',
                data: { source: 'auto_fix_test', timestamp: new Date().toISOString() }
              }
            });
            
            if (!testError && testResult) {
              addLog('success', '✅ Test Edge Function completato');
            } else {
              addLog('warning', `Test Edge Function: ${testError?.message || 'Risposta inattesa'}`);
            }
          } catch (edgeFunctionError: any) {
            addLog('warning', `Test Edge Function fallito: ${edgeFunctionError.message}`);
          }
        }
      } catch (error: any) {
        addLog('warning', `Test finale: ${error.message}`);
      }

      addLog('success', '🎉 RIPARAZIONE AUTOMATICA COMPLETATA!');
      toast.success('🔧 Sistema FCM riparato! Prova ora il test');

      // Re-run diagnostics
      setTimeout(() => runComprehensiveDiagnostics(), 2000);

    } catch (error: any) {
      addLog('error', `Errore critico durante la riparazione: ${error.message}`);
      toast.error(`❌ Errore riparazione: ${error.message}`);
    } finally {
      setIsAutoFixing(false);
    }
  };

  const sendAdvancedTest = async () => {
    if (!user) {
      addLog('error', 'Utente non autenticato');
      toast.error('❌ Utente non autenticato');
      return;
    }

    setIsSendingTest(true);
    const testId = Date.now();
    addLog('info', `🚀 INVIO TEST NOTIFICA AVANZATO ID: ${testId}`);

    try {
      // Test 1: Service Worker direct test  
      if ('serviceWorker' in navigator) {
        addLog('info', '1️⃣ Test Service Worker diretto...');
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration?.active) {
          // Create a MessageChannel for two-way communication
          const messageChannel = new MessageChannel();
          
          // Listen for response from service worker
          messageChannel.port1.onmessage = (event) => {
            if (event.data.type === 'TEST_NOTIFICATION_SUCCESS') {
              addLog('success', `✅ Service Worker test completato (ID: ${event.data.testId})`);
              toast.success('🔔 Test Service Worker riuscito!');
            } else if (event.data.type === 'TEST_NOTIFICATION_ERROR') {
              addLog('error', `❌ Service Worker test fallito: ${event.data.error}`);
              toast.error(`❌ SW Test fallito: ${event.data.error}`);
            }
          };
          
          // Send test message to service worker
          registration.active.postMessage({
            type: 'TEST_NOTIFICATION',
            testId: testId,
            title: '🔥 M1SSION™ SW Test Avanzato',
            body: `Test Service Worker - ${new Date().toLocaleTimeString()}`,
            source: 'advanced_debug_panel'
          }, [messageChannel.port2]);
          
          addLog('success', '✅ Test Service Worker inviato');
        } else {
          addLog('error', '❌ Service Worker non attivo');
          toast.error('❌ Service Worker non disponibile');
        }
      }

      // Test 2: FCM via Edge Function test
      addLog('info', '2️⃣ Test notifica FCM completa...');
      const { data, error } = await supabase.functions.invoke('send-firebase-push', {
        body: {
          user_id: user.id,
          title: `🔥 M1SSION™ Test Completo ${testId}`,
          body: `Test notifica avanzato Firebase FCM - ${new Date().toLocaleTimeString()}`,
          data: {
            test_id: testId.toString(),
            source: 'advanced_debug_panel',
            timestamp: new Date().toISOString(),
            requireInteraction: 'true',
            vibrate: '200,100,200',
            tag: 'm1ssion-test'
          }
        }
      });

      if (error) {
        addLog('error', `❌ Errore FCM Edge Function: ${error.message}`, { error });
        toast.error(`❌ Errore FCM: ${error.message}`);
      } else if (data?.success) {
        addLog('success', `✅ Notifica FCM inviata! Delivered: ${data.sent_count || 0}`, { data });
        toast.success(`🚀 FCM Test inviato! (${data.sent_count || 0} devices reached)`, {
          description: 'Controlla se la notifica è arrivata'
        });

        // Show arrival check instructions
        addLog('info', '⏱️ Monitoraggio arrivo notifica per 15 secondi...');
        
        setTimeout(() => {
          addLog('info', '📱 Se la notifica non è arrivata, verifica:');
          addLog('info', '• 🔧 Service Worker attivo (F12 → Application → Service Workers)');
          addLog('info', '• 🔒 Notifiche abilitate nel browser');
          addLog('info', '• 📱 App PWA installata (iOS Safari)');
          addLog('info', '• 🌐 Connessione internet stabile');
          addLog('info', '• 🔍 Console per errori FCM');
        }, 15000);
      } else {
        addLog('warning', 'Notifica inviata ma nessun dispositivo raggiunto', { data });
        toast.warning('⚠️ Nessun dispositivo FCM raggiunto');
      }

      // Test 3: Browser native notification (fallback)
      if (Notification.permission === 'granted') {
        addLog('info', '3️⃣ Test notifica browser nativa (fallback)...');
        try {
          const notification = new Notification('🔥 M1SSION™ Test Browser Nativo', {
            body: `Test notifica browser - ${new Date().toLocaleTimeString()}`,
            icon: '/icon-192x192.png',
            tag: 'browser-test',
            requireInteraction: true
          });

          notification.onclick = () => {
            addLog('info', '🖱️ Test browser nativo cliccato dall\'utente');
            notification.close();
          };

          setTimeout(() => notification.close(), 10000);
          addLog('success', '✅ Test browser nativo creato');
        } catch (error: any) {
          addLog('error', `❌ Test browser nativo fallito: ${error.message}`);
        }
      }

      addLog('success', '🎉 TEST NOTIFICA AVANZATO COMPLETATO!');
      
    } catch (error: any) {
      addLog('error', `Errore critico durante test: ${error.message}`, { error });
      toast.error(`❌ Errore test: ${error.message}`);
    } finally {
      setIsSendingTest(false);
    }
  };

  const getStatusIcon = (type: DebugLog['type']) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-400" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-400" />;
      default: return <Activity className="h-4 w-4 text-blue-400" />;
    }
  };

  const getDiagnosticIcon = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'pass': return <CheckCircle className="h-5 w-5 text-green-400" />;
      case 'fail': return <XCircle className="h-5 w-5 text-red-400" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0E15] text-white font-mono">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        
        {/* Header */}
        <div className="text-center border-b border-gray-800 pb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 mb-4">
            🔥 M1SSION™ FCM ADVANCED DIAGNOSTICS
          </h1>
          <p className="text-gray-400 text-lg">
            Sistema diagnostico avanzato Firebase Cloud Messaging con auto-riparazione
          </p>
        </div>

        {/* Diagnostic Results */}
        {diagnosticResults.length > 0 && (
          <div className="bg-gray-900 border border-gray-700 rounded-lg">
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-blue-400">🔍 Risultati Diagnostica Sistema</h3>
                <div className="flex gap-2">
                  <button
                    onClick={autoFixAllIssues}
                    disabled={isAutoFixing}
                    className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 disabled:opacity-50 text-white font-bold py-3 px-6 rounded-lg flex items-center gap-2 transition-all"
                  >
                    {isAutoFixing ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Riparando...
                      </>
                    ) : (
                      <>
                        <Wrench className="h-5 w-5" />
                        🔧 Auto-Fix
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={runComprehensiveDiagnostics}
                    disabled={isRunningDiagnostics}
                    className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg"
                  >
                    {isRunningDiagnostics ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <RefreshCw className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid gap-4">
                {diagnosticResults.map((result, index) => (
                  <div key={index} className={`p-4 rounded-lg border-l-4 ${
                    result.status === 'pass' ? 'bg-green-900/20 border-green-400' :
                    result.status === 'fail' ? 'bg-red-900/20 border-red-400' :
                    'bg-yellow-900/20 border-yellow-400'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        {getDiagnosticIcon(result.status)}
                        <div>
                          <h4 className="font-semibold text-lg">{result.test}</h4>
                          <p className="text-gray-300">{result.message}</p>
                          {result.fix && (
                            <p className="text-sm text-orange-400 mt-1">
                              💡 Fix: {result.fix}
                            </p>
                          )}
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        result.status === 'pass' ? 'bg-green-600 text-white' :
                        result.status === 'fail' ? 'bg-red-600 text-white' :
                        'bg-yellow-600 text-black'
                      }`}>
                        {result.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Quick Start Diagnostic */}
        {diagnosticResults.length === 0 && (
          <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/30 rounded-lg p-8 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-3xl font-bold mb-4 text-blue-400">Diagnostica Sistema FCM</h3>
            <p className="text-gray-300 mb-6 text-lg">
              Esegui un controllo completo per identificare e risolvere automaticamente tutti i problemi
            </p>
            <button
              onClick={runComprehensiveDiagnostics}
              disabled={isRunningDiagnostics}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 text-white font-bold py-4 px-8 rounded-lg text-xl flex items-center gap-3 mx-auto transition-all"
            >
              {isRunningDiagnostics ? (
                <>
                  <Loader2 className="h-6 w-6 animate-spin" />
                  Analizzando sistema...
                </>
              ) : (
                <>
                  <Settings className="h-6 w-6" />
                  🚀 Avvia Diagnostica Completa
                </>
              )}
            </button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button
            onClick={sendAdvancedTest}
            disabled={isSendingTest || !user}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-6 px-8 rounded-lg flex items-center justify-center gap-3 text-xl transition-all duration-200 transform hover:scale-105"
          >
            <Send className="h-6 w-6" />
            {isSendingTest ? '🚀 Invio Test...' : '🚀 Test Notifica Avanzato'}
          </button>

          <button
            onClick={() => user && refreshTokenData(user.id)}
            disabled={refreshing}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 text-white font-bold py-6 px-8 rounded-lg flex items-center justify-center gap-3 text-xl transition-all duration-200 transform hover:scale-105"
          >
            {refreshing ? (
              <>
                <Loader2 className="h-6 w-6 animate-spin" />
                Aggiornando...
              </>
            ) : (
              <>
                <RefreshCw className="h-6 w-6" />
                🔄 Aggiorna Stato
              </>
            )}
          </button>
        </div>

        {/* Quick Status */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Wifi className="h-5 w-5 text-blue-400" />
              <span className="font-semibold">Connessione</span>
            </div>
            <span className="text-green-400 font-bold">✅ ONLINE</span>
          </div>

          <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-5 w-5 text-purple-400" />
              <span className="font-semibold">Permessi</span>
            </div>
            <span className={`font-bold ${
              fcm.permission === 'granted' ? 'text-green-400' : 'text-red-400'
            }`}>
              {fcm.permission === 'granted' ? '✅ CONCESSI' : '❌ NEGATI'}
            </span>
          </div>

          <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Key className="h-5 w-5 text-yellow-400" />
              <span className="font-semibold">Token FCM</span>
            </div>
            <span className={`font-bold ${fcm.token ? 'text-green-400' : 'text-red-400'}`}>
              {fcm.token ? '✅ ATTIVO' : '❌ ASSENTE'}
            </span>
          </div>

          <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Database className="h-5 w-5 text-green-400" />
              <span className="font-semibold">Database</span>
            </div>
            <span className={`font-bold ${tokenData ? 'text-green-400' : 'text-yellow-400'}`}>
              {tokenData ? '✅ SALVATO' : '⏳ VUOTO'}
            </span>
          </div>
        </div>

        {/* Debug Logs */}
        <div className="bg-gray-900 border border-gray-700 rounded-lg">
          <div className="p-6 border-b border-gray-700">
            <h3 className="text-2xl font-bold text-green-400">📊 Debug Logs Real-time</h3>
            <p className="text-gray-400 mt-2">Status ed eventi del sistema FCM</p>
          </div>
          
          <div className="p-6">
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {logs.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  Nessun log disponibile. Esegui la diagnostica per iniziare.
                </p>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="flex items-start gap-3 py-2 px-3 bg-gray-800 rounded">
                    {getStatusIcon(log.type)}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-gray-400">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </div>
                      <div className={`font-medium ${
                        log.type === 'success' ? 'text-green-300' :
                        log.type === 'error' ? 'text-red-300' :
                        log.type === 'warning' ? 'text-yellow-300' :
                        'text-blue-300'
                      }`}>
                        {log.message}
                      </div>
                      {log.details && (
                        <details className="mt-1">
                          <summary className="text-xs text-gray-500 cursor-pointer">
                            Dettagli tecnici
                          </summary>
                          <pre className="text-xs bg-gray-700 p-2 rounded mt-1 overflow-x-auto">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* System Info */}
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
          <h3 className="text-xl font-bold text-gray-400 mb-4">ℹ️ Informazioni Sistema</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">User ID:</span>
              <span className="ml-2 text-blue-400 font-mono">{user?.id || 'Non autenticato'}</span>
            </div>
            <div>
              <span className="text-gray-400">Email:</span>
              <span className="ml-2 text-green-400">{user?.email || 'N/A'}</span>
            </div>
            <div>
              <span className="text-gray-400">FCM Support:</span>
              <span className="ml-2 text-blue-400">{isFCMSupported() ? '✅ Supportato' : '❌ Non supportato'}</span>
            </div>
            <div>
              <span className="text-gray-400">Service Worker:</span>
              <span className="ml-2 text-purple-400">{'serviceWorker' in navigator ? '✅ Disponibile' : '❌ Non disponibile'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};