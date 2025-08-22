// © 2025 M1SSION™ – NIYVORA KFT – Joseph MULÉ
// M1SSION™ Firebase Notification Debug Panel Component

import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useFCMPushNotifications } from '@/hooks/useFCMPushNotifications';
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
  AlertTriangle
} from 'lucide-react';

interface DebugLog {
  timestamp: string;
  type: 'info' | 'success' | 'error' | 'warning';
  message: string;
  details?: any;
}

export const FCMDebugPanel = () => {
  const [user, setUser] = useState<any>(null);
  const [tokenData, setTokenData] = useState<any>(null);
  const [logs, setLogs] = useState<DebugLog[]>([]);
  const [isActivating, setIsActivating] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  const fcm = useFCMPushNotifications();

  const addLog = (type: DebugLog['type'], message: string, details?: any) => {
    const newLog: DebugLog = {
      timestamp: new Date().toISOString(),
      type,
      message,
      details
    };
    setLogs(prev => [newLog, ...prev].slice(0, 50)); // Keep last 50 logs
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

  const activateNotifications = async () => {
    if (!user) {
      addLog('error', 'Utente non autenticato');
      toast.error('Utente non autenticato');
      return;
    }

    setIsActivating(true);
    addLog('info', 'Inizio processo attivazione notifiche...');

    try {
      // Check if already granted
      if (Notification.permission === 'granted') {
        addLog('info', 'Permessi già concessi, generazione token...');
        
        // Force token generation
        if (fcm.token) {
          await refreshTokenData(user.id);
          addLog('success', 'Notifiche già attive!');
          toast.success('🔥 Notifiche già attive!');
          return;
        }
      }

      // Step 1: Request permission with proper handling
      addLog('info', 'Richiesta permessi notifiche al browser...');
      
      let permission: NotificationPermission;
      try {
        permission = await Notification.requestPermission();
      } catch (error: any) {
        addLog('error', 'Errore richiesta permessi', { error: error.message });
        
        // Fallback for older browsers
        permission = await new Promise((resolve) => {
          Notification.requestPermission((result) => {
            resolve(result as NotificationPermission);
          });
        });
      }
      
      addLog('info', `Risposta permessi: ${permission}`);

      if (permission !== 'granted') {
        addLog('error', `Permessi negati: ${permission}`);
        toast.error('Permessi notifiche negati. Abilitali nelle impostazioni del browser.');
        
        // Show instructions for enabling notifications
        addLog('info', 'ISTRUZIONI: Clicca sull\'icona del lucchetto/info nella barra degli indirizzi e abilita le notifiche');
        return;
      }

      addLog('success', 'Permessi notifiche concessi!');

      // Step 2: Wait for FCM hook to update
      addLog('info', 'Attesa aggiornamento hook FCM...');
      
      // Give time for the hook to detect permission change
      for (let i = 0; i < 10; i++) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        if (fcm.token) break;
        addLog('info', `Attesa token FCM... tentativo ${i + 1}/10`);
      }

      if (!fcm.token) {
        addLog('error', 'Token FCM non generato dopo 10 secondi');
        toast.error('Errore generazione token FCM. Riprova.');
        return;
      }

      addLog('success', `Token FCM generato: ${fcm.token.substring(0, 30)}...`);

      // Step 3: Refresh database data
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for DB save
      await refreshTokenData(user.id);

      addLog('success', '🔥 Notifiche M1SSION™ attivate con successo!');
      toast.success('🔥 Notifiche M1SSION™ attivate!');

    } catch (error: any) {
      addLog('error', 'Errore critico attivazione notifiche', { 
        error: error.message, 
        stack: error.stack,
        permission: Notification.permission 
      });
      toast.error(`Errore: ${error.message}`);
    } finally {
      setIsActivating(false);
    }
  };

  const sendTestNotification = async () => {
    if (!user) {
      addLog('error', 'Utente non autenticato');
      return;
    }

    setIsSendingTest(true);
    const testId = Date.now();
    addLog('info', `Invio notifica test ID: ${testId}...`);

    try {
      // First: Test Service Worker directly
      if ('serviceWorker' in navigator) {
        addLog('info', 'Test Service Worker diretto...');
        
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration && registration.active) {
          // Send test message to Service Worker
          registration.active.postMessage({
            type: 'TEST_NOTIFICATION',
            testId: testId
          });
          
          addLog('success', 'Test notifica Service Worker inviato');
          
          // Wait a moment then test FCM
          await new Promise(resolve => setTimeout(resolve, 2000));
        } else {
          addLog('warning', 'Service Worker non attivo');
        }
      }

      // Second: Test FCM via Edge Function
      addLog('info', 'Invio notifica FCM via Edge Function...');
      
      const { data, error } = await supabase.functions.invoke('send-firebase-push', {
        body: {
          user_id: user.id,
          title: `🔥 M1SSION™ Test ${testId}`,
          body: `Notifica di prova dal pannello debug - ${new Date().toLocaleTimeString()}`,
          data: {
            test_id: testId.toString(),
            source: 'debug_panel',
            timestamp: new Date().toISOString(),
            requireInteraction: 'true'
          }
        }
      });

      if (error) {
        addLog('error', 'Errore invio notifica FCM', { error: error.message });
        toast.error(`Errore FCM: ${error.message}`);
        return;
      }

      if (data?.success) {
        addLog('success', `✅ Notifica FCM inviata! Delivered: ${data.sent_count}`, { 
          response: data,
          testId: testId,
          timestamp: new Date().toLocaleTimeString()
        });
        
        toast.success(`🚀 Notifica inviata! (${data.sent_count} delivered)`);
        
        // Check if notification appears in next 10 seconds
        addLog('info', '⏱️ Controllo arrivo notifica nei prossimi 10 secondi...');
        
        setTimeout(() => {
          addLog('warning', '⚠️ Se non hai ricevuto la notifica, controlla:');
          addLog('info', '1. Service Worker attivo nella console (F12 > Application > Service Workers)');
          addLog('info', '2. Notifiche abilitate nel browser (icona 🔒 nella barra URL)'); 
          addLog('info', '3. PWA installata se su iOS Safari');
          addLog('info', '4. Console per errori FCM');
        }, 10000);
        
      } else {
        addLog('warning', 'Notifica inviata ma nessun token trovato', { response: data });
        toast.warning('⚠️ Notifica inviata ma nessun token trovato');
      }

    } catch (error: any) {
      addLog('error', 'Errore critico invio notifica', { 
        error: error.message, 
        stack: error.stack 
      });
      toast.error(`❌ Errore critico: ${error.message}`);
    } finally {
      setIsSendingTest(false);
    }
  };

  const getStatusIcon = (type: DebugLog['type']) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-400" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-400" />;
      default: return <Shield className="h-4 w-4 text-blue-400" />;
    }
  };

  const getPermissionStatus = () => {
    if (fcm.permission === 'granted') return { icon: CheckCircle, color: 'text-green-400', text: 'CONCESSI' };
    if (fcm.permission === 'denied') return { icon: XCircle, color: 'text-red-400', text: 'NEGATI' };
    return { icon: AlertTriangle, color: 'text-yellow-400', text: 'NON RICHIESTI' };
  };

  const getTokenStatus = () => {
    if (fcm.token && tokenData) return { icon: CheckCircle, color: 'text-green-400', text: 'ATTIVO' };
    if (fcm.token && !tokenData) return { icon: AlertTriangle, color: 'text-yellow-400', text: 'NON SALVATO' };
    return { icon: XCircle, color: 'text-red-400', text: 'ASSENTE' };
  };

  const permission = getPermissionStatus();
  const token = getTokenStatus();

  return (
    <div className="min-h-screen bg-[#0B0E15] text-white font-mono">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        
        {/* Header */}
        <div className="text-center border-b border-gray-800 pb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 mb-4">
            🔥 M1SSION™ FCM DEBUG PANEL
          </h1>
          <p className="text-gray-400 text-lg">
            Sistema diagnostico Firebase Cloud Messaging - PWA Compatible
          </p>
        </div>

        {/* Permission Denied Warning */}
        {fcm.permission === 'denied' && (
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <XCircle className="h-6 w-6 text-red-400 mt-1" />
              <div>
                <h3 className="text-xl font-semibold text-red-400 mb-3">
                  🚫 Permessi Notifiche Negati
                </h3>
                <div className="space-y-3 text-gray-300">
                  <p className="font-semibold">Per abilitare le notifiche push:</p>
                  
                  <div className="bg-gray-800 p-4 rounded border border-gray-600">
                    <h4 className="font-semibold text-blue-400 mb-2">📱 Su Safari iOS (iPhone/iPad):</h4>
                    <ol className="list-decimal list-inside space-y-1 text-sm">
                      <li>Apri la pagina in Safari</li>
                      <li>Tocca il pulsante "Condividi" (quadrato con freccia)</li>
                      <li>Scorri e tocca "Aggiungi alla schermata Home"</li>
                      <li>Apri l'app dalla home screen</li>
                      <li>Riprova ad attivare le notifiche</li>
                    </ol>
                  </div>

                  <div className="bg-gray-800 p-4 rounded border border-gray-600">
                    <h4 className="font-semibold text-green-400 mb-2">🌐 Su Chrome/Firefox Desktop:</h4>
                    <ol className="list-decimal list-inside space-y-1 text-sm">
                      <li>Clicca sull'icona del lucchetto 🔒 nella barra degli indirizzi</li>
                      <li>Trova "Notifiche" e cambia in "Consenti"</li>
                      <li>Ricarica la pagina</li>
                      <li>Riprova ad attivare le notifiche</li>
                    </ol>
                  </div>

                  <div className="bg-gray-800 p-4 rounded border border-gray-600">
                    <h4 className="font-semibold text-purple-400 mb-2">🔧 Alternativa Chrome:</h4>
                    <ol className="list-decimal list-inside space-y-1 text-sm">
                      <li>Vai su Impostazioni Chrome → Privacy e sicurezza → Impostazioni sito</li>
                      <li>Trova "Notifiche"</li>
                      <li>Rimuovi questo sito dall'elenco "Bloccato"</li>
                      <li>Ricarica e riprova</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Permissions Status */}
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="h-6 w-6 text-blue-400" />
              <h3 className="text-xl font-semibold">Permessi Notifiche</h3>
            </div>
            <div className="flex items-center gap-2">
              <permission.icon className={`h-5 w-5 ${permission.color}`} />
              <span className={`font-bold ${permission.color}`}>
                {permission.text}
              </span>
            </div>
            <p className="text-gray-400 text-sm mt-2">
              {fcm.permission || 'Non determinato'}
            </p>
          </div>

          {/* Token Status */}
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Key className="h-6 w-6 text-purple-400" />
              <h3 className="text-xl font-semibold">Token FCM</h3>
            </div>
            <div className="flex items-center gap-2">
              <token.icon className={`h-5 w-5 ${token.color}`} />
              <span className={`font-bold ${token.color}`}>
                {token.text}
              </span>
            </div>
            {fcm.token && (
              <p className="text-gray-400 text-xs mt-2 break-all">
                {fcm.token.substring(0, 40)}...
              </p>
            )}
          </div>

          {/* Database Status */}
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Database className="h-6 w-6 text-green-400" />
              <h3 className="text-xl font-semibold">Database</h3>
              <button
                onClick={() => user && refreshTokenData(user.id)}
                disabled={refreshing}
                className="ml-auto"
              >
                <RefreshCw className={`h-4 w-4 text-gray-400 hover:text-white ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
            <div className="flex items-center gap-2">
              {tokenData ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <span className="font-bold text-green-400">SALVATO</span>
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-red-400" />
                  <span className="font-bold text-red-400">NON TROVATO</span>
                </>
              )}
            </div>
            {tokenData && (
              <p className="text-gray-400 text-xs mt-2">
                Creato: {new Date(tokenData.created_at).toLocaleString()}
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button
            onClick={activateNotifications}
            disabled={isActivating}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 px-8 rounded-lg flex items-center justify-center gap-3 text-lg transition-all duration-200 transform hover:scale-105"
          >
            <Smartphone className="h-6 w-6" />
            {isActivating ? '🔄 Attivazione...' : 
             fcm.permission === 'granted' ? '🔄 Rigenera Token' : '📲 Attiva Notifiche'}
          </button>

          <button
            onClick={sendTestNotification}
            disabled={isSendingTest || !user}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 px-8 rounded-lg flex items-center justify-center gap-3 text-lg transition-all duration-200 transform hover:scale-105"
          >
            <Send className="h-6 w-6" />
            {isSendingTest ? '🚀 Invio...' : '🚀 Invia Test'}
          </button>
        </div>

        {/* Debug Logs */}
        <div className="bg-gray-900 border border-gray-700 rounded-lg">
          <div className="p-6 border-b border-gray-700">
            <h3 className="text-xl font-semibold text-white">📝 Debug Logs Real-time</h3>
            <p className="text-gray-400 text-sm mt-1">
              Ultimi 50 eventi del sistema FCM
            </p>
          </div>
          <div className="p-4 max-h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                Nessun log disponibile. Esegui un'azione per vedere i dettagli.
              </p>
            ) : (
              <div className="space-y-3">
                {logs.map((log, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-gray-800 rounded border border-gray-700">
                    {getStatusIcon(log.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm text-gray-300">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          log.type === 'success' ? 'bg-green-900 text-green-300' :
                          log.type === 'error' ? 'bg-red-900 text-red-300' :
                          log.type === 'warning' ? 'bg-yellow-900 text-yellow-300' :
                          'bg-blue-900 text-blue-300'
                        }`}>
                          {log.type.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-white text-sm">{log.message}</p>
                      {log.details && (
                        <details className="mt-2">
                          <summary className="text-xs text-gray-400 cursor-pointer hover:text-white">
                            Mostra dettagli tecnici
                          </summary>
                          <pre className="mt-2 p-2 bg-gray-700 rounded text-xs text-gray-300 overflow-auto">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* System Info */}
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-white mb-4">🔧 Informazioni Sistema</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">User ID:</span>
              <span className="ml-2 text-white font-mono">
                {user?.id?.substring(0, 20) || 'Non disponibile'}...
              </span>
            </div>
            <div>
              <span className="text-gray-400">Email:</span>
              <span className="ml-2 text-white">{user?.email || 'Non disponibile'}</span>
            </div>
            <div>
              <span className="text-gray-400">FCM Support:</span>
              <span className="ml-2 text-white">{fcm.isSupported ? '✅ Supportato' : '❌ Non supportato'}</span>
            </div>
            <div>
              <span className="text-gray-400">Service Worker:</span>
              <span className="ml-2 text-white">
                {'serviceWorker' in navigator ? '✅ Disponibile' : '❌ Non disponibile'}
              </span>
            </div>
            <div>
              <span className="text-gray-400">PWA Mode:</span>
              <span className="ml-2 text-white">
                {window.matchMedia('(display-mode: standalone)').matches ? '✅ Installata' : '🌐 Browser'}
              </span>
            </div>
            <div>
              <span className="text-gray-400">Platform:</span>
              <span className="ml-2 text-white">{navigator.platform}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};