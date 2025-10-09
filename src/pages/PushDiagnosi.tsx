// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED
// Push Notification Diagnostic Page

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Loader2, 
  RefreshCw,
  Home
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import UnifiedHeader from '@/components/layout/UnifiedHeader';

interface DiagnosticResult {
  step: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  details?: string;
}

export default function PushDiagnosi() {
  const { user } = useAuth();
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [summary, setSummary] = useState<{ success: number; warnings: number; errors: number }>({
    success: 0,
    warnings: 0,
    errors: 0
  });

  const addResult = (result: DiagnosticResult) => {
    setResults(prev => [...prev, result]);
  };

  const runDiagnostics = async () => {
    setResults([]);
    setSummary({ success: 0, warnings: 0, errors: 0 });
    setIsRunning(true);

    const newResults: DiagnosticResult[] = [];

    try {
      // 1) Check Push API Support
      newResults.push({
        step: '1/10',
        status: 'success',
        message: 'Controllo supporto Push API',
        details: 'Verifica se il browser supporta le notifiche push...'
      });

      if (!('Notification' in window)) {
        newResults.push({
          step: '1/10',
          status: 'error',
          message: 'Push API non supportato',
          details: 'Il tuo browser non supporta le notifiche push'
        });
        setResults(newResults);
        return;
      }

      if (!('serviceWorker' in navigator)) {
        newResults.push({
          step: '1/10',
          status: 'error',
          message: 'Service Worker non supportato',
          details: 'Il tuo browser non supporta i Service Workers'
        });
        setResults(newResults);
        return;
      }

      newResults.push({
        step: '1/10',
        status: 'success',
        message: '✓ Push API supportato',
        details: 'Browser compatibile con notifiche push'
      });

      // 2) Check Permissions
      const permission = Notification.permission;
      if (permission === 'denied') {
        newResults.push({
          step: '2/10',
          status: 'error',
          message: '✗ Permesso negato',
          details: 'Le notifiche sono bloccate. Vai nelle impostazioni del browser per abilitarle.'
        });
      } else if (permission === 'default') {
        newResults.push({
          step: '2/10',
          status: 'warning',
          message: '⚠ Permesso non richiesto',
          details: 'Usa il bottone "Ripara notifiche" per richiedere il permesso'
        });
      } else {
        newResults.push({
          step: '2/10',
          status: 'success',
          message: '✓ Permesso concesso',
          details: `Stato permesso: ${permission}`
        });
      }

      // 3) Check Service Workers
      const registrations = await navigator.serviceWorker.getRegistrations();
      const mainReg = registrations.find(r => r.active?.scriptURL.includes('/sw.js'));

      if (registrations.length === 0) {
        newResults.push({
          step: '3/10',
          status: 'warning',
          message: '⚠ Nessun SW registrato',
          details: 'Usa "Ripara notifiche" per registrare /sw.js'
        });
      } else if (registrations.length > 1) {
        newResults.push({
          step: '3/10',
          status: 'warning',
          message: `⚠ ${registrations.length} SW registrati`,
          details: 'Rilevati SW multipli. Consigliato mantenere solo /sw.js'
        });
      } else if (mainReg) {
        newResults.push({
          step: '3/10',
          status: 'success',
          message: '✓ SW corretto attivo',
          details: `Scope: ${mainReg.scope}, State: ${mainReg.active?.state}`
        });
      } else {
        newResults.push({
          step: '3/10',
          status: 'error',
          message: '✗ SW non corretto',
          details: `SW attivo: ${registrations[0]?.active?.scriptURL || 'unknown'}`
        });
      }

      // 4) Check VAPID Key
      try {
        const { loadVAPIDPublicKey, urlBase64ToUint8Array } = await import('@/lib/vapid-loader');
        const vapidKey = await loadVAPIDPublicKey();
        const vapidArray = urlBase64ToUint8Array(vapidKey);
        
        newResults.push({
          step: '4/10',
          status: 'success',
          message: '✓ VAPID key valida',
          details: `Length: ${vapidArray.length} bytes, Prefix: 0x${vapidArray[0].toString(16)}`
        });
      } catch (error: any) {
        newResults.push({
          step: '4/10',
          status: 'error',
          message: '✗ VAPID key non valida',
          details: error.message
        });
        setResults(newResults);
        return;
      }

      // 5) Check JWT Session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        newResults.push({
          step: '5/10',
          status: 'error',
          message: '✗ JWT mancante',
          details: 'Sessione non valida. Effettua il login.'
        });
        setResults(newResults);
        return;
      }

      newResults.push({
        step: '5/10',
        status: 'success',
        message: '✓ JWT presente',
        details: `User ID: ${session.user?.id?.substring(0, 8)}...`
      });

      // 6) Check Current Subscription
      const reg = await navigator.serviceWorker.ready;
      const subscription = await reg.pushManager.getSubscription();

      if (!subscription) {
        newResults.push({
          step: '6/10',
          status: 'warning',
          message: '⚠ Nessuna subscription',
          details: 'Usa "Ripara notifiche" per creare una subscription'
        });
      } else {
        const platform = subscription.endpoint.includes('web.push.apple.com') ? 'iOS' : 'Web';
        
        newResults.push({
          step: '6/10',
          status: 'success',
          message: '✓ Subscription presente',
          details: `Platform: ${platform}, Endpoint: ${subscription.endpoint.substring(0, 50)}...`
        });
      }

      // 7) Test Backend Connection
      try {
        const testBody = subscription ? {
          endpoint: subscription.endpoint,
          keys: subscription.toJSON().keys,
          provider: 'webpush',
          platform: subscription.endpoint.includes('web.push.apple.com') ? 'ios' : 'web',
          ua: navigator.userAgent
        } : { test: true };

        const { data, error } = await supabase.functions.invoke('webpush-upsert', {
          body: testBody
        });

        if (error) {
          newResults.push({
            step: '7/10',
            status: 'error',
            message: '✗ Errore backend',
            details: error.message
          });
        } else {
          newResults.push({
            step: '7/10',
            status: 'success',
            message: '✓ Backend raggiungibile',
            details: `Response OK`
          });
        }
      } catch (error: any) {
        newResults.push({
          step: '7/10',
          status: 'error',
          message: '✗ Errore connessione',
          details: error.message
        });
      }

      // 8) Check Database Subscriptions
      try {
        const { count, error } = await supabase
          .from('webpush_subscriptions')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user?.id || '')
          .eq('is_active', true);

        if (error) {
          newResults.push({
            step: '8/10',
            status: 'warning',
            message: '⚠ Errore query database',
            details: error.message
          });
        } else {
          newResults.push({
            step: '8/10',
            status: count && count > 0 ? 'success' : 'warning',
            message: count && count > 0 ? '✓ Subscriptions attive' : '⚠ Nessuna subscription nel DB',
            details: `Count: ${count || 0}`
          });
        }
      } catch (error: any) {
        newResults.push({
          step: '8/10',
          status: 'warning',
          message: '⚠ Query non eseguita',
          details: error.message
        });
      }

      // 9) Platform Detection
      const isIOSSafari = navigator.userAgent.includes('Safari') && 
                          !navigator.userAgent.includes('Chrome') &&
                          /iPhone|iPad|iPod/.test(navigator.userAgent);

      const isPWA = window.matchMedia('(display-mode: standalone)').matches ||
                    (window.navigator as any).standalone === true;

      let platformStatus: 'success' | 'warning' = 'success';
      let platformMessage = '✓ Piattaforma supportata';
      let platformDetails = `Browser: ${navigator.userAgent.substring(0, 50)}...`;

      if (isIOSSafari && !isPWA) {
        platformStatus = 'warning';
        platformMessage = '⚠ iOS Safari';
        platformDetails = 'Su iOS Safari, installa l\'app alla Home Screen (PWA) per ricevere notifiche (iOS 16.4+)';
      }

      newResults.push({
        step: '9/10',
        status: platformStatus,
        message: platformMessage,
        details: platformDetails
      });

      // 10) Summary
      newResults.push({
        step: '10/10',
        status: 'success',
        message: '✓ Diagnosi completata',
        details: 'Controlla i risultati sopra per eventuali problemi'
      });

    } catch (error: any) {
      newResults.push({
        step: 'ERROR',
        status: 'error',
        message: '✗ Errore durante la diagnosi',
        details: error.message
      });
    } finally {
      setResults(newResults);
      setIsRunning(false);
      
      // Calculate summary
      const successCount = newResults.filter(r => r.status === 'success').length;
      const warningCount = newResults.filter(r => r.status === 'warning').length;
      const errorCount = newResults.filter(r => r.status === 'error').length;
      
      setSummary({ 
        success: successCount, 
        warnings: warningCount, 
        errors: errorCount 
      });
    }
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const getStatusIcon = (status: 'success' | 'error' | 'warning') => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-400" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
    }
  };

  const getStatusBadge = (status: 'success' | 'error' | 'warning') => {
    const colors = {
      success: 'bg-green-500/20 text-green-400 border-green-500/50',
      error: 'bg-red-500/20 text-red-400 border-red-500/50',
      warning: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
    };
    return colors[status];
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#070818] via-[#0a0d1f] to-[#070818]">
      <Helmet>
        <title>M1SSION™ - Diagnosi Push Notifications</title>
      </Helmet>

      <UnifiedHeader profileImage={null} />

      <div 
        className="px-4 py-8"
        style={{ 
          paddingTop: 'calc(72px + 47px + env(safe-area-inset-top, 0px))',
          paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 0px))'
        }}
      >
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  🔍 Diagnosi Push Notifications
                </h1>
                <p className="text-gray-400">
                  Controllo completo della configurazione push
                </p>
              </div>
              
              <Button
                onClick={() => window.location.href = '/panel-access'}
                variant="outline"
                className="border-cyan-500/50 text-cyan-400"
              >
                <Home className="w-4 h-4 mr-2" />
                Panel
              </Button>
            </div>

            {/* Summary */}
            {!isRunning && results.length > 0 && (
              <Card className="bg-black/40 border-cyan-500/30">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-white font-medium">{summary.success}</span>
                        <span className="text-gray-400 text-sm">Successi</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-yellow-400" />
                        <span className="text-white font-medium">{summary.warnings}</span>
                        <span className="text-gray-400 text-sm">Warning</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <XCircle className="w-4 h-4 text-red-400" />
                        <span className="text-white font-medium">{summary.errors}</span>
                        <span className="text-gray-400 text-sm">Errori</span>
                      </div>
                    </div>

                    <Button
                      onClick={runDiagnostics}
                      variant="outline"
                      size="sm"
                      className="border-cyan-500/50 text-cyan-400"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Riesegui
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>

          {/* Results */}
          <div className="space-y-3">
            {results.map((result, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={`bg-black/40 border ${
                  result.status === 'success' ? 'border-green-500/30' :
                  result.status === 'error' ? 'border-red-500/30' :
                  'border-yellow-500/30'
                }`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {getStatusIcon(result.status)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getStatusBadge(result.status)}`}
                          >
                            {result.step}
                          </Badge>
                          <span className="text-white font-medium">
                            {result.message}
                          </span>
                        </div>
                        
                        {result.details && (
                          <p className="text-gray-400 text-sm mt-1 break-words">
                            {result.details}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}

            {/* Loading State */}
            {isRunning && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center py-8"
              >
                <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
                <span className="ml-3 text-white">Esecuzione diagnosi...</span>
              </motion.div>
            )}
          </div>

          {/* Help Section */}
          {!isRunning && results.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-8"
            >
              <Card className="bg-black/40 border-blue-500/30">
                <CardHeader>
                  <CardTitle className="text-blue-400 text-lg">
                    💡 Suggerimenti
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p className="text-gray-300">
                    • Se vedi errori o warning, usa il bottone <strong>"Ripara notifiche"</strong> nel Push Center
                  </p>
                  <p className="text-gray-300">
                    • Su iOS Safari, installa l'app alla Home Screen (PWA) per abilitare le notifiche
                  </p>
                  <p className="text-gray-300">
                    • Se il permesso è negato, vai nelle impostazioni del browser per ripristinarlo
                  </p>
                  <p className="text-gray-300">
                    • Mantieni attivo solo il Service Worker <strong>/sw.js</strong>
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
