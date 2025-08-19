// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  MapPin, 
  Bell, 
  Wifi, 
  Smartphone, 
  Database, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useGeoWatcher } from '@/hooks/useGeoWatcher';
import { toast } from 'sonner';

interface SystemStatus {
  category: string;
  status: 'ok' | 'warning' | 'error' | 'loading';
  message: string;
  details?: string[];
}

export const M1ssionSystemReport: React.FC = () => {
  const [systemStatus, setSystemStatus] = useState<SystemStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const geoWatcher = useGeoWatcher();

  const runDiagnostics = async () => {
    setIsLoading(true);
    const diagnostics: SystemStatus[] = [];

    // 🔐 Security Check
    try {
      const { data: user } = await supabase.auth.getUser();
      diagnostics.push({
        category: '🔐 Sicurezza',
        status: user ? 'ok' : 'error',
        message: user ? 'Autenticazione attiva' : 'Utente non autenticato',
        details: user ? [`User ID: ${user.user.id}`, `Email: ${user.user.email}`] : []
      });
    } catch (error) {
      diagnostics.push({
        category: '🔐 Sicurezza',
        status: 'error',
        message: 'Errore autenticazione',
        details: [error instanceof Error ? error.message : 'Errore sconosciuto']
      });
    }

    // 🌍 Geolocalizzazione
    const geoStatus = geoWatcher.granted ? 'ok' : geoWatcher.error ? 'error' : 'warning';
    diagnostics.push({
      category: '🌍 Geolocalizzazione',
      status: geoStatus,
      message: geoWatcher.granted ? 'Posizione attiva' : geoWatcher.error || 'In attesa permessi',
      details: geoWatcher.coords ? [
        `Lat: ${geoWatcher.coords.lat.toFixed(6)}`,
        `Lng: ${geoWatcher.coords.lng.toFixed(6)}`,
        `Precisione: ${geoWatcher.coords.acc}m`,
        `iOS: ${geoWatcher.isIOS ? 'Sì' : 'No'}`,
        `PWA: ${geoWatcher.isPWA ? 'Sì' : 'No'}`
      ] : []
    });

    // 📡 Database Connectivity
    try {
      const { data: configData, error: configError } = await supabase
        .from('app_config')
        .select('key, value_text')
        .eq('key', 'app_version')
        .maybeSingle();

      diagnostics.push({
        category: '📡 Database',
        status: configError ? 'error' : 'ok',
        message: configError ? 'Errore connessione database' : 'Database connesso',
        details: configData ? [`App Version: ${configData.value_text}`] : []
      });
    } catch (error) {
      diagnostics.push({
        category: '📡 Database',
        status: 'error',
        message: 'Database non raggiungibile',
        details: [error instanceof Error ? error.message : 'Errore sconosciuto']
      });
    }

    // 🔔 Push Notifications
    const pushStatus = 'Notification' in window ? 'ok' : 'error';
    const permission = 'Notification' in window ? Notification.permission : 'denied';
    diagnostics.push({
      category: '🔔 Push Notifications',
      status: permission === 'granted' ? 'ok' : permission === 'denied' ? 'error' : 'warning',
      message: `Supporto: ${pushStatus === 'ok' ? 'Sì' : 'No'}, Permesso: ${permission}`,
      details: [
        `Service Worker: ${navigator.serviceWorker ? 'Supportato' : 'Non supportato'}`,
        `OneSignal Ready: ${(window as any).OneSignal ? 'Sì' : 'No'}`
      ]
    });

    // 📱 PWA Status
    const isPWA = window.matchMedia('(display-mode: standalone)').matches;
    const isInstallable = 'serviceWorker' in navigator;
    diagnostics.push({
      category: '📱 PWA Status',
      status: isPWA ? 'ok' : isInstallable ? 'warning' : 'error',
      message: isPWA ? 'Installata come PWA' : isInstallable ? 'Installabile' : 'Non supportata',
      details: [
        `Standalone: ${isPWA ? 'Sì' : 'No'}`,
        `Service Worker: ${isInstallable ? 'Supportato' : 'Non supportato'}`,
        `Manifest: ${document.querySelector('link[rel="manifest"]') ? 'Presente' : 'Mancante'}`
      ]
    });

    // 🎯 QR Markers
    try {
      const { data: markers, error: markersError } = await supabase
        .from('qr_codes')
        .select('code, is_active')
        .limit(5);

      const activeMarkers = markers?.filter(m => m.is_active)?.length || 0;
      const totalMarkers = markers?.length || 0;

      diagnostics.push({
        category: '🎯 QR Markers',
        status: markersError ? 'error' : totalMarkers > 0 ? 'ok' : 'warning',
        message: markersError ? 'Errore caricamento marker' : `${activeMarkers}/${totalMarkers} marker attivi`,
        details: markersError ? [markersError.message] : markers?.slice(0, 3).map(m => `${m.code}: ${m.is_active ? 'Attivo' : 'Inattivo'}`) || []
      });
    } catch (error) {
      diagnostics.push({
        category: '🎯 QR Markers',
        status: 'error',
        message: 'Errore accesso marker',
        details: [error instanceof Error ? error.message : 'Errore sconosciuto']
      });
    }

    setSystemStatus(diagnostics);
    setIsLoading(false);
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const getStatusIcon = (status: SystemStatus['status']) => {
    switch (status) {
      case 'ok': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'loading': return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
    }
  };

  const getStatusBadge = (status: SystemStatus['status']) => {
    const variants = {
      ok: 'bg-green-100 text-green-800 border-green-200',
      warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      error: 'bg-red-100 text-red-800 border-red-200',
      loading: 'bg-blue-100 text-blue-800 border-blue-200'
    };
    
    return (
      <Badge className={`${variants[status]} border`}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  const testPushNotification = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('send-push-notification', {
        body: {
          title: '🔬 Test Diagnostico',
          body: 'Sistema M1SSION™ funzionante',
          timestamp: new Date().toISOString()
        }
      });

      if (error) throw error;
      
      toast.success('Test push notification inviato', {
        description: `Risultato: ${data?.success ? 'Successo' : 'Fallito'}`
      });
    } catch (error) {
      toast.error('Errore test push notification', {
        description: error instanceof Error ? error.message : 'Errore sconosciuto'
      });
    }
  };

  const testGeolocation = () => {
    if (geoWatcher.requestPermissions) {
      geoWatcher.requestPermissions();
      toast.info('Richiesta permessi geolocalizzazione...');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Sistema M1SSION™</h2>
          <p className="text-muted-foreground">Diagnostica completa dell'applicazione</p>
        </div>
        <Button onClick={runDiagnostics} disabled={isLoading} variant="outline">
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Aggiorna
        </Button>
      </div>

      <div className="grid gap-4">
        {systemStatus.map((item, index) => (
          <Card key={index}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-lg">
                <div className="flex items-center gap-2">
                  {getStatusIcon(item.status)}
                  <span>{item.category}</span>
                </div>
                {getStatusBadge(item.status)}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-foreground mb-2">{item.message}</p>
              {item.details && item.details.length > 0 && (
                <div className="space-y-1">
                  {item.details.map((detail, i) => (
                    <p key={i} className="text-sm text-muted-foreground font-mono">
                      • {detail}
                    </p>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex gap-3">
        <Button onClick={testPushNotification} variant="outline" size="sm">
          <Bell className="w-4 h-4 mr-2" />
          Test Push
        </Button>
        <Button onClick={testGeolocation} variant="outline" size="sm">
          <MapPin className="w-4 h-4 mr-2" />
          Test Geo
        </Button>
      </div>
    </div>
  );
};