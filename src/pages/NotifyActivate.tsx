import { loadPush keyPublicKey as loadPushKeySafe, urlBase64ToUint8Array as toU8 } from '@/lib/Push key-loader';
/**
 * © 2025 Joseph MULÉ – M1SSION™ – NIYVORA KFT™
 * Pagina di attivazione push notifications con diagnostica step-by-step
 */

import { useState, useEffect } from 'react';
import { Bell, Check, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { usePushActivation } from '@/hooks/usePushActivation';

import { supabase } from '@/integrations/supabase/client';

interface DiagnosticStep {
  id: string;
  label: string;
  status: 'pending' | 'checking' | 'success' | 'error';
  message?: string;
}

export default function NotifyActivate() {
  const { activate, isActivating, isActivated } = usePushActivation();
  const [steps, setSteps] = useState<DiagnosticStep[]>([
    { id: 'sw', label: 'Service Worker', status: 'pending' },
    { id: 'pushkey', label: 'Push key', status: 'pending' },
    { id: 'permission', label: 'Browser Permission', status: 'pending' },
    { id: 'jwt', label: 'Autenticazione', status: 'pending' },
  ]);

  useEffect(() => {
    runDiagnostics();
  }, []);

  const updateStep = (id: string, updates: Partial<DiagnosticStep>) => {
    setSteps(prev =>
      prev.map(step => (step.id === id ? { ...step, ...updates } : step))
    );
  };

  const runDiagnostics = async () => {
    // Check Service Worker
    updateStep('sw', { status: 'checking' });
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration && registration.active) {
          updateStep('sw', { status: 'success', message: 'Attivo' });
        } else {
          updateStep('sw', { status: 'error', message: 'Non registrato' });
        }
      } catch (err) {
        updateStep('sw', { status: 'error', message: 'Errore verifica' });
      }
    } else {
      updateStep('sw', { status: 'error', message: 'Non supportato' });
    }

    // Check Push key
    updateStep('pushkey', { status: 'checking' });
    try {
      const pushKey = await loadPushKeySafe();
      if (pushKey && pushKey.length > 80) {
        updateStep('pushkey', { status: 'success', message: 'Caricata' });
      } else {
        updateStep('pushkey', { status: 'error', message: 'Chiave non valida' });
      }
    } catch (err) {
      updateStep('pushkey', { status: 'error', message: 'Caricamento fallito' });
    }

    // Check Permission
    updateStep('permission', { status: 'checking' });
    if ('Notification' in window) {
      const permission = Notification.permission;
      if (permission === 'granted') {
        updateStep('permission', { status: 'success', message: 'Concesso' });
      } else if (permission === 'denied') {
        updateStep('permission', { status: 'error', message: 'Negato' });
      } else {
        updateStep('permission', { status: 'pending', message: 'Da richiedere' });
      }
    } else {
      updateStep('permission', { status: 'error', message: 'Non supportato' });
    }

    // Check JWT
    updateStep('jwt', { status: 'checking' });
    try {
      const { data } = await supabase.auth.getSession();
      if (data?.session?.access_token) {
        updateStep('jwt', { status: 'success', message: 'Valido' });
      } else {
        updateStep('jwt', { status: 'error', message: 'Sessione scaduta' });
      }
    } catch (err) {
      updateStep('jwt', { status: 'error', message: 'Verifica fallita' });
    }
  };

  const allSuccess = steps.every(s => s.status === 'success');

  const getStatusIcon = (status: DiagnosticStep['status']) => {
    switch (status) {
      case 'success':
        return <Check className="h-5 w-5 text-green-500" />;
      case 'error':
        return <X className="h-5 w-5 text-red-500" />;
      case 'checking':
        return <Loader2 className="h-5 w-5 animate-spin text-primary" />;
      default:
        return <div className="h-5 w-5 rounded-full border-2 border-muted" />;
    }
  };

  return (
    <div className="container max-w-2xl mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-primary/10 rounded-full">
              <Bell className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle>Attiva notifiche M1SSION™</CardTitle>
              <CardDescription>
                Verifica e attiva le notifiche push in tempo reale
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Diagnostic Steps */}
          <div className="space-y-3">
            {steps.map(step => (
              <div
                key={step.id}
                className="flex items-center gap-3 p-3 rounded-lg border bg-card"
              >
                {getStatusIcon(step.status)}
                <div className="flex-1">
                  <p className="font-medium">{step.label}</p>
                  {step.message && (
                    <p className="text-sm text-muted-foreground">{step.message}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Action Button */}
          <Button
            className="w-full"
            size="lg"
            onClick={activate}
            disabled={isActivating || isActivated || !allSuccess}
          >
            {isActivating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isActivated ? '✅ Notifiche attivate' : 'Attiva notifiche'}
          </Button>

          {!allSuccess && !isActivating && (
            <p className="text-sm text-center text-muted-foreground">
              Risolvi i problemi evidenziati per procedere
            </p>
          )}

          {isActivated && (
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-center">
              <p className="text-sm font-medium text-green-600 dark:text-green-400">
                🎉 Riceverai aggiornamenti M1SSION™ in tempo reale!
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
