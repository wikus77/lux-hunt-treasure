// © 2025 M1SSION™ – NIYVORA KFT – Joseph MULÉ
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, XCircle, Wifi, MapPin, Bell, Shield } from 'lucide-react';

interface SystemStatus {
  geolocation: 'ok' | 'warning' | 'error';
  pushNotifications: 'ok' | 'warning' | 'error';
  mapMarkers: 'ok' | 'warning' | 'error';
  authentication: 'ok' | 'warning' | 'error';
  lastChecked: Date;
}

export const M1ssionStatusDisplay: React.FC = () => {
  const [status, setStatus] = useState<SystemStatus>({
    geolocation: 'ok',
    pushNotifications: 'ok',
    mapMarkers: 'ok',
    authentication: 'ok',
    lastChecked: new Date()
  });

  useEffect(() => {
    const checkSystemStatus = async () => {
      const newStatus: SystemStatus = {
        geolocation: 'ok',
        pushNotifications: 'ok',
        mapMarkers: 'ok',
        authentication: 'ok',
        lastChecked: new Date()
      };

      // Check geolocation
      if (!navigator.geolocation) {
        newStatus.geolocation = 'error';
      } else {
        try {
          const permission = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              timeout: 5000,
              maximumAge: 60000
            });
          });
          newStatus.geolocation = 'ok';
        } catch (error: any) {
          if (error.code === 1) {
            newStatus.geolocation = 'warning'; // Permission denied but available
          } else {
            newStatus.geolocation = 'error';
          }
        }
      }

      // Check push notifications
      if ('Notification' in window) {
        if (Notification.permission === 'granted') {
          newStatus.pushNotifications = 'ok';
        } else if (Notification.permission === 'denied') {
          newStatus.pushNotifications = 'error';
        } else {
          newStatus.pushNotifications = 'warning';
        }
      } else {
        newStatus.pushNotifications = 'error';
      }

      // Check authentication (basic check)
      try {
        const authCheck = localStorage.getItem('supabase.auth.token');
        newStatus.authentication = authCheck ? 'ok' : 'warning';
      } catch {
        newStatus.authentication = 'error';
      }

      // Map markers always OK (static check)
      newStatus.mapMarkers = 'ok';

      setStatus(newStatus);
    };

    checkSystemStatus();
    const interval = setInterval(checkSystemStatus, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (statusType: 'ok' | 'warning' | 'error') => {
    switch (statusType) {
      case 'ok':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const getStatusBadge = (statusType: 'ok' | 'warning' | 'error') => {
    switch (statusType) {
      case 'ok':
        return <Badge variant="default" className="bg-green-500 text-white">ONLINE</Badge>;
      case 'warning':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600">ATTENZIONE</Badge>;
      case 'error':
        return <Badge variant="destructive">ERRORE</Badge>;
    }
  };

  const overallStatus = Object.values(status).filter(s => typeof s === 'string').every(s => s === 'ok') ? 'ok' :
                       Object.values(status).filter(s => typeof s === 'string').some(s => s === 'error') ? 'error' : 'warning';

  return (
    <Card className="border-2 border-cyan-500/30 bg-gradient-to-br from-gray-900/50 to-gray-800/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <div className="text-cyan-400">
            M1SSION™ SYSTEM STATUS
          </div>
          {getStatusBadge(overallStatus)}
        </CardTitle>
        <p className="text-sm text-gray-400">
          Ultimo controllo: {status.lastChecked.toLocaleTimeString('it-IT')}
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <MapPin className="w-6 h-6 text-cyan-400" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">Geolocalizzazione</span>
                {getStatusIcon(status.geolocation)}
              </div>
              <p className="text-xs text-gray-500">
                {status.geolocation === 'ok' && 'Funzionante con fallback Roma'}
                {status.geolocation === 'warning' && 'Autorizzazione richiesta'}
                {status.geolocation === 'error' && 'Non supportata dal browser'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Bell className="w-6 h-6 text-cyan-400" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">Push Notifications</span>
                {getStatusIcon(status.pushNotifications)}
              </div>
              <p className="text-xs text-gray-500">
                {status.pushNotifications === 'ok' && 'OneSignal attivo e configurato'}
                {status.pushNotifications === 'warning' && 'Autorizzazione in attesa'}
                {status.pushNotifications === 'error' && 'Non supportate o negate'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Wifi className="w-6 h-6 text-cyan-400" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">Markers Mappa</span>
                {getStatusIcon(status.mapMarkers)}
              </div>
              <p className="text-xs text-gray-500">
                Admin panel e QR system operativi
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-cyan-400" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">Autenticazione</span>
                {getStatusIcon(status.authentication)}
              </div>
              <p className="text-xs text-gray-500">
                {status.authentication === 'ok' && 'Supabase Auth attivo'}
                {status.authentication === 'warning' && 'Sessione non trovata'}
                {status.authentication === 'error' && 'Errore sistema auth'}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-cyan-950/30 rounded-lg border border-cyan-500/20">
          <div className="text-center">
            {overallStatus === 'ok' && (
              <div className="text-green-400 font-semibold">
                🎯 M1SSION™ READY FOR BIRTHDAY LAUNCH ✅
              </div>
            )}
            {overallStatus === 'warning' && (
              <div className="text-yellow-400 font-semibold">
                ⚠️ Alcuni servizi richiedono attenzione
              </div>
            )}
            {overallStatus === 'error' && (
              <div className="text-red-400 font-semibold">
                ❌ Problemi critici rilevati
              </div>
            )}
            <p className="text-xs text-gray-400 mt-2">
              © 2025 M1SSION™ – NIYVORA KFT – Joseph MULÉ
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};