// property of team joseph & aldo, M1SSION devtools, generative ai code-signed via Lovable by Joseph G. for user J.A.
// Notifications Settings Page - FCM Push Configuration UI

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, BellOff, Smartphone, Monitor, Shield, ExternalLink } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  enablePushNotifications,
  getNotificationStatus,
  hasActiveFCMSubscription,
  needsInstallGuide,
  isIOS,
  isStandalone
} from '@/features/notifications/enablePush';

interface FCMSubscription {
  id: string;
  token: string;
  platform: string;
  device_info: any;
  created_at: string;
  is_active: boolean;
}

const NotificationsPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [subscriptions, setSubscriptions] = useState<FCMSubscription[]>([]);
  const [notificationStatus, setNotificationStatus] = useState(getNotificationStatus());

  // Load user's FCM subscriptions
  const loadSubscriptions = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('fcm_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSubscriptions(data || []);
    } catch (error) {
      console.error('Error loading subscriptions:', error);
    }
  };

  useEffect(() => {
    loadSubscriptions();
    
    // Update status on mount
    setNotificationStatus(getNotificationStatus());
  }, [user?.id]);

  // Enable push notifications
  const handleEnablePush = async () => {
    if (!user?.id) {
      toast.error('Accesso richiesto per abilitare le notifiche');
      return;
    }

    setLoading(true);

    try {
      const result = await enablePushNotifications(user.id);
      
      if (result.success) {
        toast.success('🔥 Notifiche push abilitate con successo!');
        setNotificationStatus(getNotificationStatus());
        await loadSubscriptions();
      } else if (result.requiresInstall) {
        toast.error('📱 Su iOS, aggiungi prima M1SSION alla Home Screen');
      } else {
        toast.error(`❌ Errore: ${result.error}`);
      }
    } catch (error) {
      console.error('Enable push error:', error);
      toast.error('❌ Errore durante l\'abilitazione delle notifiche');
    } finally {
      setLoading(false);
    }
  };

  // Send test notification
  const handleTestNotification = async () => {
    if (!user?.id || subscriptions.length === 0) {
      toast.error('Nessuna sottoscrizione attiva trovata');
      return;
    }

    setTestLoading(true);

    try {
      const activeToken = subscriptions.find(sub => sub.is_active)?.token;
      
      if (!activeToken) {
        toast.error('Nessun token attivo trovato');
        return;
      }

      const { data, error } = await supabase.functions.invoke('fcm-test', {
        body: {
          token: activeToken,
          title: 'M1SSION™ Test',
          body: '🎯 Notifica di test inviata con successo!',
          data: {
            screen: '/home',
            action: 'test'
          }
        }
      });

      if (error) throw error;

      if (data?.success) {
        toast.success('✅ Notifica di test inviata con successo!');
      } else {
        toast.error(`❌ Test fallito: ${data?.error || 'Errore sconosciuto'}`);
      }
    } catch (error) {
      console.error('Test notification error:', error);
      toast.error('❌ Errore durante l\'invio della notifica di test');
    } finally {
      setTestLoading(false);
    }
  };

  // Remove subscription
  const handleRemoveSubscription = async (subscriptionId: string) => {
    try {
      const { error } = await supabase
        .from('fcm_subscriptions')
        .delete()
        .eq('id', subscriptionId);

      if (error) throw error;

      toast.success('Sottoscrizione rimossa');
      await loadSubscriptions();
      setNotificationStatus(getNotificationStatus());
    } catch (error) {
      console.error('Remove subscription error:', error);
      toast.error('Errore durante la rimozione');
    }
  };

  const getStatusBadge = () => {
    if (!notificationStatus.supported) {
      return <Badge variant="destructive">Non Supportato</Badge>;
    }
    
    switch (notificationStatus.permission) {
      case 'granted':
        return <Badge variant="default" className="bg-green-500">Abilitate</Badge>;
      case 'denied':
        return <Badge variant="destructive">Rifiutate</Badge>;
      default:
        return <Badge variant="secondary">Non Richieste</Badge>;
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'ios': return <Smartphone className="h-4 w-4" />;
      case 'android': return <Smartphone className="h-4 w-4" />;
      case 'desktop': return <Monitor className="h-4 w-4" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="text-center p-8">
            <BellOff className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Accesso Richiesto</h3>
            <p className="text-muted-foreground">
              Effettua l'accesso per gestire le notifiche push
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Notifiche Push</h1>
        <p className="text-muted-foreground">
          Gestisci le notifiche push di M1SSION™ per rimanere sempre aggiornato
        </p>
      </div>

      {/* iOS Install Guide */}
      {needsInstallGuide() && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700">
              <Smartphone className="h-5 w-5" />
              Requisito iOS
            </CardTitle>
            <CardDescription className="text-orange-600">
              Per abilitare le notifiche su iOS, devi prima installare M1SSION come PWA
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm text-orange-700">
              <p className="font-medium mb-2">Come installare:</p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Apri M1SSION in Safari</li>
                <li>Tocca il pulsante "Condividi" nella barra inferiore</li>
                <li>Scorri e seleziona "Aggiungi alla schermata Home"</li>
                <li>Tocca "Aggiungi" per confermare</li>
                <li>Apri M1SSION dall'icona nella Home Screen</li>
              </ol>
            </div>
            <Badge variant="outline" className="text-orange-700 border-orange-300">
              iOS 16.4+ Richiesto
            </Badge>
          </CardContent>
        </Card>
      )}

      {/* Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Stato Notifiche
          </CardTitle>
          <CardDescription>
            Stato attuale delle notifiche push nel tuo browser
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="font-medium">Permesso Notifiche</p>
              <p className="text-sm text-muted-foreground">
                {notificationStatus.supported 
                  ? 'Browser supporta le notifiche push'
                  : 'Browser non supporta le notifiche push'
                }
              </p>
            </div>
            {getStatusBadge()}
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="font-medium">Sottoscrizioni Attive</p>
              <p className="text-sm text-muted-foreground">
                Dispositivi che ricevono notifiche
              </p>
            </div>
            <Badge variant="outline">
              {subscriptions.filter(sub => sub.is_active).length}
            </Badge>
          </div>

          {isIOS() && (
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-medium">Modalità Standalone</p>
                <p className="text-sm text-muted-foreground">
                  Richiesto per notifiche iOS
                </p>
              </div>
              <Badge variant={isStandalone() ? "default" : "secondary"}>
                {isStandalone() ? 'Attiva' : 'Non Attiva'}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions Card */}
      <Card>
        <CardHeader>
          <CardTitle>Azioni</CardTitle>
          <CardDescription>
            Gestisci le tue notifiche push
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Button
              onClick={handleEnablePush}
              disabled={loading || notificationStatus.permission === 'granted'}
              className="flex items-center gap-2"
            >
              <Bell className="h-4 w-4" />
              {loading ? 'Abilitazione...' : 'Abilita Notifiche'}
            </Button>

            <Button
              variant="outline"
              onClick={handleTestNotification}
              disabled={testLoading || subscriptions.filter(sub => sub.is_active).length === 0}
              className="flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              {testLoading ? 'Invio...' : 'Test Notifica'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Subscriptions List */}
      {subscriptions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Dispositivi Registrati</CardTitle>
            <CardDescription>
              Tutti i dispositivi che possono ricevere notifiche
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {subscriptions.map((subscription) => (
                <div
                  key={subscription.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {getPlatformIcon(subscription.platform)}
                    <div className="space-y-1">
                      <p className="font-medium capitalize">
                        {subscription.platform} • {subscription.token.substring(0, 20)}...
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Registrato: {new Date(subscription.created_at).toLocaleDateString('it-IT')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={subscription.is_active ? "default" : "secondary"}
                      className={subscription.is_active ? "bg-green-500" : ""}
                    >
                      {subscription.is_active ? 'Attivo' : 'Inattivo'}
                    </Badge>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveSubscription(subscription.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      Rimuovi
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default NotificationsPage;