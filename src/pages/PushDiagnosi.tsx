// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Push Diagnostics - Complete push system diagnostics

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { repairPush, sendSelfTest, getPushStatus } from '@/utils/pushRepair';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Loader2, 
  WrenchIcon, 
  Send, 
  Trash2,
  RefreshCw,
  ArrowLeft
} from 'lucide-react';
import { useWouterNavigation } from '@/hooks/useWouterNavigation';

interface CheckResult {
  name: string;
  status: 'ok' | 'error' | 'warning' | 'pending';
  message: string;
  details?: string;
  solution?: string;
}

export default function PushDiagnosi() {
  const { navigate } = useWouterNavigation();
  const [checks, setChecks] = useState<CheckResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isRepairing, setIsRepairing] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const runDiagnostics = async () => {
    setIsRunning(true);
    const results: CheckResult[] = [];

    try {
      // CHECK 1: Permission
      results.push({
        name: 'Permission Notifiche',
        status: Notification.permission === 'granted' ? 'ok' : 
                Notification.permission === 'denied' ? 'error' : 'warning',
        message: `Stato: ${Notification.permission}`,
        details: Notification.permission === 'granted' 
          ? 'Permesso concesso correttamente' 
          : Notification.permission === 'denied'
          ? 'Permesso negato dall\'utente'
          : 'Permesso non ancora richiesto',
        solution: Notification.permission !== 'granted' 
          ? 'Clicca "Ripara notifiche" per richiedere il permesso. Su iOS Safari, installa l\'app alla Home Screen (PWA).'
          : undefined
      });

      // CHECK 2: Service Worker
      if ('serviceWorker' in navigator) {
        try {
          const regs = await navigator.serviceWorker.getRegistrations();
          const swReg = await navigator.serviceWorker.getRegistration();
          
          const officialSW = regs.find(r => r.active?.scriptURL.endsWith('/sw.js'));
          const extraSWs = regs.filter(r => !r.active?.scriptURL.endsWith('/sw.js'));

          if (officialSW) {
            results.push({
              name: 'Service Worker',
              status: extraSWs.length > 0 ? 'warning' : 'ok',
              message: officialSW.active?.scriptURL || 'Registrato',
              details: extraSWs.length > 0 
                ? `Service Worker ufficiale attivo, ma trovati ${extraSWs.length} SW extra da rimuovere`
                : 'Service Worker /sw.js registrato correttamente',
              solution: extraSWs.length > 0 
                ? 'Clicca "Unregister Extra SW" per rimuovere i Service Worker non necessari.'
                : undefined
            });
          } else if (regs.length > 0) {
            results.push({
              name: 'Service Worker',
              status: 'error',
              message: `Trovati ${regs.length} SW, nessuno è /sw.js`,
              details: regs.map(r => r.active?.scriptURL).join(', '),
              solution: 'Clicca "Ripara notifiche" per registrare il Service Worker corretto.'
            });
          } else {
            results.push({
              name: 'Service Worker',
              status: 'error',
              message: 'Nessun Service Worker registrato',
              solution: 'Clicca "Ripara notifiche" per registrare /sw.js'
            });
          }
        } catch (error: any) {
          results.push({
            name: 'Service Worker',
            status: 'error',
            message: 'Errore durante il check',
            details: error.message
          });
        }
      } else {
        results.push({
          name: 'Service Worker',
          status: 'error',
          message: 'Service Worker non supportato',
          details: 'Questo browser non supporta Service Workers'
        });
      }

      // CHECK 3: VAPID Key
      try {
        const { loadVAPIDPublicKey, urlBase64ToUint8Array } = await import('/vapid-helper.js' + '?t=' + Date.now());
        const vapid = await loadVAPIDPublicKey();
        const vapidArray = urlBase64ToUint8Array(vapid);
        
        results.push({
          name: 'VAPID Key',
          status: 'ok',
          message: `${vapid.substring(0, 12)}... (${vapidArray.length} bytes)`,
          details: `Formato P-256 valido: ${vapidArray.length} bytes, inizia con 0x${vapidArray[0].toString(16)}`
        });
      } catch (error: any) {
        results.push({
          name: 'VAPID Key',
          status: 'error',
          message: 'Errore validazione VAPID',
          details: error.message,
          solution: 'Contatta il supporto tecnico: la chiave VAPID potrebbe essere corrotta.'
        });
      }

      // CHECK 4: Subscription
      try {
        const reg = await navigator.serviceWorker.getRegistration();
        if (reg) {
          const sub = await reg.pushManager.getSubscription();
          if (sub) {
            const platform = sub.endpoint.includes('web.push.apple.com') ? 'iOS Safari' : 'Web Standard';
            results.push({
              name: 'Push Subscription',
              status: 'ok',
              message: 'Subscription attiva',
              details: `Platform: ${platform}\nEndpoint: ${sub.endpoint.substring(0, 50)}...`
            });
          } else {
            results.push({
              name: 'Push Subscription',
              status: 'warning',
              message: 'Nessuna subscription presente',
              solution: 'Clicca "Ripara notifiche" per creare una nuova subscription.'
            });
          }
        } else {
          results.push({
            name: 'Push Subscription',
            status: 'error',
            message: 'Service Worker non registrato',
            solution: 'Prima registra il Service Worker.'
          });
        }
      } catch (error: any) {
        results.push({
          name: 'Push Subscription',
          status: 'error',
          message: 'Errore durante il check',
          details: error.message
        });
      }

      // CHECK 5: JWT Token
      try {
        let jwt: string | null = null;
        
        if ((window as any).supabase?.auth?.getSession) {
          const { data } = await (window as any).supabase.auth.getSession();
          jwt = data?.session?.access_token;
        }

        if (!jwt) {
          const host = location.host.split(':')[0] || '';
          const key = `${host}-auth-token`;
          const raw = localStorage.getItem(key);
          if (raw) {
            const parsed = JSON.parse(raw);
            jwt = parsed?.currentSession?.access_token;
          }
        }

        if (jwt) {
          results.push({
            name: 'JWT Token',
            status: 'ok',
            message: 'Token presente',
            details: `Token JWT trovato (${jwt.length} caratteri)`
          });
        } else {
          results.push({
            name: 'JWT Token',
            status: 'error',
            message: 'Token non trovato',
            details: 'Utente non autenticato',
            solution: 'Effettua il login o ricarica la pagina.'
          });
        }
      } catch (error: any) {
        results.push({
          name: 'JWT Token',
          status: 'error',
          message: 'Errore durante il check',
          details: error.message
        });
      }

    } catch (error: any) {
      results.push({
        name: 'Sistema',
        status: 'error',
        message: 'Errore critico durante la diagnostica',
        details: error.message
      });
    }

    setChecks(results);
    setIsRunning(false);
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const handleRepair = async () => {
    setIsRepairing(true);
    try {
      const result = await repairPush();
      if (result.success) {
        toast.success(result.message);
        setTimeout(runDiagnostics, 1000);
      } else {
        toast.error(result.message);
      }
    } catch (error: any) {
      toast.error(`Errore: ${error.message}`);
    } finally {
      setIsRepairing(false);
    }
  };

  const handleSendTest = async () => {
    setIsSending(true);
    try {
      const result = await sendSelfTest();
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error: any) {
      toast.error(`Errore: ${error.message}`);
    } finally {
      setIsSending(false);
    }
  };

  const handleUnregisterExtra = async () => {
    try {
      const regs = await navigator.serviceWorker.getRegistrations();
      const extraSWs = regs.filter(r => !r.active?.scriptURL.endsWith('/sw.js'));
      
      for (const reg of extraSWs) {
        await reg.unregister();
        console.log('Unregistered:', reg.active?.scriptURL);
      }
      
      toast.success(`Rimossi ${extraSWs.length} Service Worker extra`);
      setTimeout(runDiagnostics, 1000);
    } catch (error: any) {
      toast.error(`Errore: ${error.message}`);
    }
  };

  const handleUnsubscribe = async () => {
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg) {
        const sub = await reg.pushManager.getSubscription();
        if (sub) {
          await sub.unsubscribe();
          toast.success('Subscription rimossa');
          setTimeout(runDiagnostics, 1000);
        } else {
          toast.info('Nessuna subscription da rimuovere');
        }
      }
    } catch (error: any) {
      toast.error(`Errore: ${error.message}`);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ok': return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'error': return <XCircle className="w-5 h-5 text-red-400" />;
      case 'warning': return <AlertCircle className="w-5 h-5 text-yellow-400" />;
      default: return <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ok': return 'bg-green-500/10 border-green-500/30';
      case 'error': return 'bg-red-500/10 border-red-500/30';
      case 'warning': return 'bg-yellow-500/10 border-yellow-500/30';
      default: return 'bg-blue-500/10 border-blue-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-cyan-400">Push Diagnostica</h1>
            <p className="text-white/60 text-sm mt-1">Sistema di controllo notifiche M1SSION™</p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate('/panel-access')}
            className="border-cyan-500/50 text-cyan-400"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Pannello
          </Button>
        </div>

        {/* Action Buttons */}
        <Card className="bg-black/40 border-cyan-500/30">
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button
                onClick={handleRepair}
                disabled={isRepairing}
                className="bg-cyan-500 hover:bg-cyan-600 text-black font-medium"
              >
                {isRepairing ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <WrenchIcon className="w-4 h-4 mr-2" />
                )}
                Ripara ora
              </Button>

              <Button
                onClick={handleSendTest}
                disabled={isSending}
                variant="outline"
                className="border-green-500/50 text-green-400"
              >
                {isSending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                Test a me
              </Button>

              <Button
                onClick={handleUnsubscribe}
                variant="outline"
                className="border-red-500/50 text-red-400"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Unsubscribe
              </Button>

              <Button
                onClick={runDiagnostics}
                variant="outline"
                className="border-cyan-500/50 text-cyan-400"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Ricarica
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Checklist */}
        <Card className="bg-black/40 border-cyan-500/30">
          <CardHeader>
            <CardTitle className="text-cyan-400">Checklist Sistema</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isRunning && checks.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
              </div>
            ) : (
              checks.map((check, index) => (
                <div key={index} className={`border rounded-lg p-4 ${getStatusColor(check.status)}`}>
                  <div className="flex items-start gap-3">
                    {getStatusIcon(check.status)}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">{check.name}</h3>
                        <Badge variant={check.status === 'ok' ? 'default' : 'destructive'}>
                          {check.message}
                        </Badge>
                      </div>
                      {check.details && (
                        <p className="text-sm text-white/70 mt-1 whitespace-pre-line">{check.details}</p>
                      )}
                      {check.solution && (
                        <div className="mt-2 p-2 bg-white/5 rounded border border-white/10">
                          <p className="text-sm text-cyan-300">
                            <strong>Soluzione:</strong> {check.solution}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Common Errors */}
        <Card className="bg-black/40 border-yellow-500/30">
          <CardHeader>
            <CardTitle className="text-yellow-400">Errori Comuni & Soluzioni</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-white mb-2">🔴 "Registration failed – storage error"</h4>
              <p className="text-sm text-white/70">
                Su <strong>iOS</strong> serve la PWA installata alla Home Screen. Su <strong>desktop</strong> pulisci permessi/blocchi del sito.
              </p>
            </div>

            <Separator className="bg-white/10" />

            <div>
              <h4 className="font-semibold text-white mb-2">🔴 "invalid_admin_token"</h4>
              <p className="text-sm text-white/70">
                Errore broadcast admin: risincronizzare il secret PUSH_ADMIN_TOKEN su Supabase.
              </p>
            </div>

            <Separator className="bg-white/10" />

            <div>
              <h4 className="font-semibold text-white mb-2">🔴 "Missing or invalid endpoint"</h4>
              <p className="text-sm text-white/70">
                Subscription corrotta: clicca "Unsubscribe" poi "Ripara notifiche" per ricrearla.
              </p>
            </div>

            <Separator className="bg-white/10" />

            <div>
              <h4 className="font-semibold text-white mb-2">⚠️ Service Worker multipli</h4>
              <p className="text-sm text-white/70">
                Solo /sw.js deve essere attivo. Clicca "Unregister Extra SW" per rimuovere gli altri.
              </p>
              <Button
                onClick={handleUnregisterExtra}
                variant="outline"
                size="sm"
                className="mt-2 border-yellow-500/50 text-yellow-400"
              >
                🗑️ Unregister Extra SW
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
