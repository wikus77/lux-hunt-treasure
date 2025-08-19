// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface SystemCheck {
  name: string;
  status: 'checking' | 'ok' | 'warning' | 'error';
  message: string;
  details?: string;
}

export const M1ssionSystemReport: React.FC = () => {
  const [checks, setChecks] = useState<SystemCheck[]>([
    { name: 'Geolocation API', status: 'checking', message: 'Verificando...' },
    { name: 'OneSignal Push', status: 'checking', message: 'Verificando...' },
    { name: 'Supabase Connection', status: 'checking', message: 'Verificando...' },
    { name: 'Marker Database', status: 'checking', message: 'Verificando...' },
    { name: 'iOS PWA Mode', status: 'checking', message: 'Verificando...' }
  ]);

  useEffect(() => {
    runSystemChecks();
  }, []);

  const runSystemChecks = async () => {
    const newChecks: SystemCheck[] = [];

    // 1. Geolocation Check
    if ('geolocation' in navigator) {
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
        });
        newChecks.push({
          name: 'Geolocation API',
          status: 'ok',
          message: `✅ Attiva (${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)})`,
          details: `Accuracy: ${position.coords.accuracy}m`
        });
      } catch (err: any) {
        newChecks.push({
          name: 'Geolocation API',
          status: 'error',
          message: '❌ Negata o non disponibile',
          details: err.message
        });
      }
    } else {
      newChecks.push({
        name: 'Geolocation API',
        status: 'error',
        message: '❌ Non supportata su questo browser'
      });
    }

    // 2. OneSignal Check
    if ('OneSignal' in window) {
      try {
        newChecks.push({
          name: 'OneSignal Push',
          status: 'ok',
          message: '✅ SDK caricato e pronto'
        });
      } catch (err) {
        newChecks.push({
          name: 'OneSignal Push',
          status: 'warning',
          message: '⚠️ SDK presente ma con errori'
        });
      }
    } else {
      newChecks.push({
        name: 'OneSignal Push',
        status: 'error',
        message: '❌ SDK non caricato'
      });
    }

    // 3. Supabase Connection Check
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data, error } = await supabase.from('profiles').select('id').limit(1);
      if (error) throw error;
      
      newChecks.push({
        name: 'Supabase Connection',
        status: 'ok',
        message: '✅ Connesso e funzionante'
      });
    } catch (err: any) {
      newChecks.push({
        name: 'Supabase Connection',
        status: 'error',
        message: '❌ Connessione fallita',
        details: err.message
      });
    }

    // 4. Marker Database Check
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data, error } = await supabase.from('qr_codes').select('code').limit(1);
      if (error) throw error;
      
      newChecks.push({
        name: 'Marker Database',
        status: 'ok',
        message: `✅ ${data?.length || 0} markers disponibili`
      });
    } catch (err: any) {
      newChecks.push({
        name: 'Marker Database',
        status: 'warning',
        message: '⚠️ Problemi di accesso ai marker',
        details: err.message
      });
    }

    // 5. iOS PWA Check
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isPWA = window.matchMedia('(display-mode: standalone)').matches;
    
    if (isIOS && isPWA) {
      newChecks.push({
        name: 'iOS PWA Mode',
        status: 'ok',
        message: '✅ iOS PWA modalità standalone'
      });
    } else if (isIOS) {
      newChecks.push({
        name: 'iOS PWA Mode',
        status: 'warning',
        message: '⚠️ iOS ma non in modalità PWA',
        details: 'Aggiungi a Home Screen per funzionalità complete'
      });
    } else {
      newChecks.push({
        name: 'iOS PWA Mode',
        status: 'ok',
        message: '✅ Desktop/Android browser'
      });
    }

    setChecks(newChecks);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ok': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'error': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <Clock className="w-5 h-5 text-gray-500 animate-spin" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      ok: 'bg-green-100 text-green-800',
      warning: 'bg-yellow-100 text-yellow-800', 
      error: 'bg-red-100 text-red-800',
      checking: 'bg-gray-100 text-gray-800'
    };
    return variants[status as keyof typeof variants] || variants.checking;
  };

  const overallStatus = checks.every(c => c.status === 'ok') ? 'perfect' :
                       checks.some(c => c.status === 'error') ? 'critical' : 'warning';

  return (
    <div className="space-y-6 p-6 bg-white rounded-lg shadow">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">🧠 M1SSION™ System Report</h2>
        <Button onClick={runSystemChecks} variant="outline" size="sm">
          Ricarica Test
        </Button>
      </div>

      <div className="grid gap-4">
        {checks.map((check, index) => (
          <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
            {getStatusIcon(check.status)}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900">{check.name}</h3>
                <Badge className={getStatusBadge(check.status)}>
                  {check.status.toUpperCase()}
                </Badge>
              </div>
              <p className="text-sm text-gray-600">{check.message}</p>
              {check.details && (
                <p className="text-xs text-gray-500 mt-1">{check.details}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className={`p-4 rounded-lg ${
        overallStatus === 'perfect' ? 'bg-green-50 border-green-200' :
        overallStatus === 'critical' ? 'bg-red-50 border-red-200' : 
        'bg-yellow-50 border-yellow-200'
      }`}>
        <h3 className="font-bold mb-2">
          {overallStatus === 'perfect' && '🎯 Sistema M1SSION™ Perfetto'}
          {overallStatus === 'critical' && '🚨 Problemi Critici Rilevati'}
          {overallStatus === 'warning' && '⚠️ Attenzione: Problemi Minori'}
        </h3>
        <p className="text-sm">
          {overallStatus === 'perfect' && 'Tutti i sistemi funzionano correttamente. L\'app è pronta per il lancio iOS.'}
          {overallStatus === 'critical' && 'Alcuni sistemi critici non funzionano. Correggere prima del lancio.'}
          {overallStatus === 'warning' && 'Sistema generale stabile ma con avvisi da monitorare.'}
        </p>
      </div>
    </div>
  );
};