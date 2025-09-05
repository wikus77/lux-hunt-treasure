// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { 
  Activity, 
  Database, 
  Wifi, 
  Battery, 
  Monitor, 
  Server,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Download
} from 'lucide-react';

interface DiagnosticResult {
  name: string;
  status: 'success' | 'warning' | 'error';
  message: string;
  details?: string;
}

const DiagnosticsSettings: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [lastRun, setLastRun] = useState<Date | null>(null);

  const runDiagnostics = async () => {
    setIsRunning(true);
    const results: DiagnosticResult[] = [];

    try {
      // Test 1: Connection
      results.push({
        name: 'Connessione Internet',
        status: navigator.onLine ? 'success' : 'error',
        message: navigator.onLine ? 'Connessione attiva' : 'Nessuna connessione'
      });

      // Test 2: Local Storage
      try {
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
        results.push({
          name: 'Local Storage',
          status: 'success',
          message: 'Funzionante'
        });
      } catch {
        results.push({
          name: 'Local Storage',
          status: 'error',
          message: 'Non disponibile'
        });
      }

      // Test 3: Service Worker
      const swSupported = 'serviceWorker' in navigator;
      results.push({
        name: 'Service Worker',
        status: swSupported ? 'success' : 'warning',
        message: swSupported ? 'Supportato' : 'Non supportato'
      });

      // Test 4: Push Notifications
      const pushSupported = 'PushManager' in window && 'Notification' in window;
      results.push({
        name: 'Push Notifications',
        status: pushSupported ? 'success' : 'warning',
        message: pushSupported ? 'Supportate' : 'Non supportate'
      });

      // Test 5: WebGL
      try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        results.push({
          name: 'WebGL',
          status: gl ? 'success' : 'warning',
          message: gl ? 'Supportato' : 'Non supportato'
        });
      } catch {
        results.push({
          name: 'WebGL',
          status: 'warning',
          message: 'Non supportato'
        });
      }

      // Test 6: Geolocation
      results.push({
        name: 'Geolocalizzazione',
        status: 'geolocation' in navigator ? 'success' : 'warning',
        message: 'geolocation' in navigator ? 'Disponibile' : 'Non disponibile'
      });

      setDiagnostics(results);
      setLastRun(new Date());
      
      toast({
        title: "✅ Diagnostica completata",
        description: "Tutti i test sono stati eseguiti con successo."
      });
    } catch (error) {
      toast({
        title: "❌ Errore diagnostica",
        description: "Si è verificato un errore durante i test.",
        variant: "destructive"
      });
    } finally {
      setIsRunning(false);
    }
  };

  const downloadReport = () => {
    const report = {
      timestamp: new Date().toISOString(),
      user_id: user?.id,
      diagnostics,
      browser: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `m1ssion-diagnostics-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "📄 Report scaricato",
      description: "Il report diagnostico è stato scaricato."
    });
  };

  const getStatusIcon = (status: 'success' | 'warning' | 'error') => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-400" />;
    }
  };

  const getStatusColor = (status: 'success' | 'warning' | 'error') => {
    switch (status) {
      case 'success':
        return 'border-emerald-500/30 bg-emerald-500/10';
      case 'warning':
        return 'border-amber-500/30 bg-amber-500/10';
      case 'error':
        return 'border-red-500/30 bg-red-500/10';
    }
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto p-6 space-y-6"
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Diagnostica Sistema</h1>
        <p className="text-white/70">Verifica il funzionamento dei componenti dell'applicazione</p>
      </div>

      {/* System Overview */}
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Activity className="w-5 h-5 mr-2 text-blue-400" />
            Panoramica Sistema
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 glass-card border-blue-500/30">
              <Monitor className="w-6 h-6 mx-auto mb-2 text-blue-400" />
              <div className="text-sm text-white">Browser</div>
              <div className="text-xs text-white/70">{navigator.userAgent.split(' ')[0]}</div>
            </div>
            <div className="text-center p-3 glass-card border-purple-500/30">
              <Server className="w-6 h-6 mx-auto mb-2 text-purple-400" />
              <div className="text-sm text-white">Platform</div>
              <div className="text-xs text-white/70">{navigator.platform}</div>
            </div>
            <div className="text-center p-3 glass-card border-emerald-500/30">
              <Wifi className="w-6 h-6 mx-auto mb-2 text-emerald-400" />
              <div className="text-sm text-white">Online</div>
              <div className="text-xs text-white/70">{navigator.onLine ? 'Sì' : 'No'}</div>
            </div>
            <div className="text-center p-3 glass-card border-amber-500/30">
              <Database className="w-6 h-6 mx-auto mb-2 text-amber-400" />
              <div className="text-sm text-white">Storage</div>
              <div className="text-xs text-white/70">Disponibile</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Diagnostics Results */}
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <div className="flex items-center">
              <Activity className="w-5 h-5 mr-2 text-green-400" />
              Test Diagnostici
            </div>
            <div className="flex gap-2">
              <Button
                onClick={downloadReport}
                variant="outline"
                size="sm"
                disabled={diagnostics.length === 0}
                className="bg-white/5 border-white/20 text-white hover:bg-white/10"
              >
                <Download className="w-4 h-4 mr-2" />
                Scarica Report
              </Button>
              <Button
                onClick={runDiagnostics}
                disabled={isRunning}
                size="sm"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isRunning ? 'animate-spin' : ''}`} />
                {isRunning ? 'Esecuzione...' : 'Esegui Test'}
              </Button>
            </div>
          </CardTitle>
          {lastRun && (
            <p className="text-white/70 text-sm">
              Ultimo aggiornamento: {lastRun.toLocaleString('it-IT')}
            </p>
          )}
        </CardHeader>
        <CardContent>
          {diagnostics.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="w-12 h-12 mx-auto mb-4 text-white/50" />
              <p className="text-white/70">Esegui la diagnostica per vedere i risultati</p>
            </div>
          ) : (
            <div className="space-y-3">
              {diagnostics.map((diagnostic, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 rounded-lg border ${getStatusColor(diagnostic.status)}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(diagnostic.status)}
                      <div>
                        <h3 className="text-white font-medium">{diagnostic.name}</h3>
                        <p className="text-white/70 text-sm">{diagnostic.message}</p>
                        {diagnostic.details && (
                          <p className="text-white/50 text-xs mt-1">{diagnostic.details}</p>
                        )}
                      </div>
                    </div>
                    <Badge 
                      variant={diagnostic.status === 'success' ? 'default' : 'destructive'}
                      className={
                        diagnostic.status === 'success' 
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                          : diagnostic.status === 'warning'
                          ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                          : 'bg-red-500/20 text-red-400 border-red-500/30'
                      }
                    >
                      {diagnostic.status === 'success' ? 'OK' : 
                       diagnostic.status === 'warning' ? 'WARN' : 'ERROR'}
                    </Badge>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance Info */}
      <Card className="glass-card border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Battery className="w-5 h-5 mr-2 text-yellow-400" />
            Informazioni Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 glass-card border-yellow-500/30">
              <h3 className="text-white font-medium mb-2">Memoria</h3>
              <p className="text-white/70 text-sm">
                Heap: {(performance as any).memory ? 
                  `${Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024)}MB` : 
                  'N/A'}
              </p>
            </div>
            <div className="p-4 glass-card border-blue-500/30">
              <h3 className="text-white font-medium mb-2">Connection</h3>
              <p className="text-white/70 text-sm">
                Tipo: {(navigator as any).connection?.effectiveType || 'Sconosciuto'}
              </p>
            </div>
            <div className="p-4 glass-card border-purple-500/30">
              <h3 className="text-white font-medium mb-2">Hardware</h3>
              <p className="text-white/70 text-sm">
                CPU: {navigator.hardwareConcurrency || 'N/A'} core
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default DiagnosticsSettings;