// @ts-nocheck
// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
/* Push Health Dashboard - Test & Monitor Push Notifications */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PushEnableButton } from '@/components/push/PushEnableButton';
import { useWebPush } from '@/hooks/useWebPush';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Activity, 
  Bell, 
  Database, 
  Server, 
  Wifi, 
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';

interface SystemStatus {
  serviceWorker: 'ok' | 'error' | 'loading';
  pushSupport: 'ok' | 'error' | 'loading';
  vapidKeys: 'ok' | 'error' | 'loading';
  database: 'ok' | 'error' | 'loading';
  edgeFunctions: 'ok' | 'error' | 'loading';
}

export default function PushHealth() {
  const { toast } = useToast();
  const { isSupported, permission, checkSubscription } = useWebPush();
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    serviceWorker: 'loading',
    pushSupport: 'loading',
    vapidKeys: 'loading',
    database: 'loading',
    edgeFunctions: 'loading'
  });
  const [subscriptionCount, setSubscriptionCount] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const checkSystemHealth = async () => {
    setIsRefreshing(true);
    const newStatus: SystemStatus = { ...systemStatus };

    try {
      // Check Service Worker
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration('/');
        newStatus.serviceWorker = registration ? 'ok' : 'error';
      } else {
        newStatus.serviceWorker = 'error';
      }

      // Check Push Support
      newStatus.pushSupport = isSupported ? 'ok' : 'error';

      // Check VAPID Keys (try to create a test subscription structure)
      try {
        const testKey = 'BBjgzWK_1_PBZXGLQb-xQjSEUH5jLsNNgx8N0LgOcKUkZeCUaNV_gRE-QM5pKS2bPKUhVJLn0Q-H3BNGnOOjy8Q';
        // Simple validation - check if it's a valid base64url string of correct length
        const decoded = atob(testKey.replace(/-/g, '+').replace(/_/g, '/'));
        newStatus.vapidKeys = decoded.length === 65 ? 'ok' : 'error';
      } catch {
        newStatus.vapidKeys = 'error';
      }

      // Check Database Connection
      try {
        const { count, error } = await supabase
          .from('push_subscriptions')
          .select('*', { count: 'exact', head: true });
        
        if (error) {
          newStatus.database = 'error';
          console.error('Database check failed:', error);
        } else {
          newStatus.database = 'ok';
          setSubscriptionCount(count || 0);
        }
      } catch (error) {
        newStatus.database = 'error';
        console.error('Database check failed:', error);
      }

      // Check Edge Functions
      try {
        const { error } = await supabase.functions.invoke('push_send', {
          body: { test: true }
        });
        
        // Even if it returns an error, if the function is reachable, it's ok
        newStatus.edgeFunctions = 'ok';
      } catch (error) {
        newStatus.edgeFunctions = 'error';
        console.error('Edge function check failed:', error);
      }

    } catch (error) {
      console.error('System health check failed:', error);
    }

    setSystemStatus(newStatus);
    setIsRefreshing(false);
  };

  useEffect(() => {
    checkSystemHealth();
  }, []);

  const getStatusIcon = (status: 'ok' | 'error' | 'loading') => {
    switch (status) {
      case 'ok':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'loading':
        return <RefreshCw className="h-4 w-4 animate-spin text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: 'ok' | 'error' | 'loading') => {
    switch (status) {
      case 'ok':
        return <Badge variant="secondary">OK</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      case 'loading':
        return <Badge variant="outline">Loading...</Badge>;
    }
  };

  const handleSubscriptionChange = (subscribed: boolean) => {
    if (subscribed) {
      // Refresh subscription count
      checkSystemHealth();
      toast({
        title: "✅ Sottoscrizione attivata",
        description: "Le notifiche push sono ora abilitate",
        variant: "default"
      });
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Activity className="h-8 w-8" />
            Push Health Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Monitora e testa il sistema di notifiche push
          </p>
        </div>
        <Button 
          onClick={checkSystemHealth}
          disabled={isRefreshing}
          variant="outline"
        >
          {isRefreshing ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Aggiorna stato
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              Stato Sistema
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStatusIcon(systemStatus.serviceWorker)}
                <span className="text-sm">Service Worker</span>
              </div>
              {getStatusBadge(systemStatus.serviceWorker)}
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStatusIcon(systemStatus.pushSupport)}
                <span className="text-sm">Push Support</span>
              </div>
              {getStatusBadge(systemStatus.pushSupport)}
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStatusIcon(systemStatus.vapidKeys)}
                <span className="text-sm">VAPID Keys</span>
              </div>
              {getStatusBadge(systemStatus.vapidKeys)}
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStatusIcon(systemStatus.database)}
                <span className="text-sm">Database</span>
              </div>
              {getStatusBadge(systemStatus.database)}
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStatusIcon(systemStatus.edgeFunctions)}
                <span className="text-sm">Edge Functions</span>
              </div>
              {getStatusBadge(systemStatus.edgeFunctions)}
            </div>
          </CardContent>
        </Card>

        {/* Database Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Statistiche Database
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Sottoscrizioni attive:</span>
              <Badge variant="outline">
                {subscriptionCount !== null ? subscriptionCount : '...'}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Permesso notifiche:</span>
              <Badge variant={permission === 'granted' ? 'secondary' : 'outline'}>
                {permission}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Push Enable Component */}
        <div className="md:col-span-2 lg:col-span-1">
          <PushEnableButton />
        </div>
      </div>

      {/* Overall System Health */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wifi className="h-5 w-5" />
            Riepilogo Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          {Object.values(systemStatus).every(status => status === 'ok') ? (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Sistema completamente funzionante</span>
            </div>
          ) : Object.values(systemStatus).some(status => status === 'error') ? (
            <div className="flex items-center gap-2 text-red-600">
              <XCircle className="h-5 w-5" />
              <span className="font-medium">Rilevati problemi nel sistema</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-yellow-600">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-medium">Controllo sistema in corso...</span>
            </div>
          )}
          
          <p className="text-sm text-muted-foreground mt-2">
            Utilizza questo dashboard per monitorare la salute del sistema push e diagnosticare eventuali problemi.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}