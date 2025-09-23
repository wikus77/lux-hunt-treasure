/**
 * M1SSION™ Push Registration Component - Test & Debug
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Smartphone, Shield, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
import { registerPush, checkPushSupport, requestNotificationPermission } from '@/lib/push/register-push';

export const PushRegistrationTest: React.FC = () => {
  const { user } = useAuth();
  const [support, setSupport] = useState(checkPushSupport());
  const [isRegistering, setIsRegistering] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [dbStatus, setDbStatus] = useState<'unknown' | 'saved' | 'failed'>('unknown');

  useEffect(() => {
    // Check current subscription status
    const checkExistingSubscription = async () => {
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        try {
          const registration = await navigator.serviceWorker.ready;
          const existingSub = await registration.pushManager.getSubscription();
          setSubscription(existingSub);
        } catch (error) {
          console.warn('Could not check existing subscription:', error);
        }
      }
    };
    
    checkExistingSubscription();
  }, []);

  const handleRequestPermission = async () => {
    try {
      const permission = await requestNotificationPermission();
      if (permission === 'granted') {
        setSupport(prev => ({ ...prev, permission }));
        toast.success('✅ Permessi notifiche concessi!');
      } else {
        toast.error('❌ Permessi notifiche negati');
      }
    } catch (error) {
      toast.error(`❌ Errore permessi: ${error instanceof Error ? error.message : 'Unknown'}`);
    }
  };

  const handleRegisterPush = async () => {
    if (!user) {
      toast.error('❌ Devi essere autenticato');
      return;
    }

    setIsRegistering(true);
    setDbStatus('unknown');

    try {
      console.log('🔔 Starting push registration for user:', user.id);
      
      const result = await registerPush(user.id);
      // Get the actual subscription after registration
      const registration = await navigator.serviceWorker.ready;
      const newSubscription = await registration.pushManager.getSubscription();
      setSubscription(newSubscription);
      setDbStatus('saved');
      
      toast.success('✅ Push registration completata!');
      console.log('✅ Push registration successful:', {
        endpoint: newSubscription.endpoint.substring(0, 50) + '...',
        provider: newSubscription.endpoint.includes('web.push.apple.com') ? 'APNs' : 'FCM'
      });
    } catch (error) {
      console.error('❌ Push registration failed:', error);
      setDbStatus('failed');
      toast.error(`❌ Registrazione fallita: ${error instanceof Error ? error.message : 'Unknown'}`);
    } finally {
      setIsRegistering(false);
    }
  };

  const handleTestNotification = async () => {
    if (!subscription) {
      toast.error('❌ Nessuna subscription attiva');
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/webpush-send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY
        },
        body: JSON.stringify({
          subscription: {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: subscription.toJSON().keys?.p256dh || '',
              auth: subscription.toJSON().keys?.auth || ''
            }
          },
          title: '🎯 Test M1SSION™',
          body: 'Push notification funzionante!',
          data: { url: '/' }
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success('✅ Notifica di test inviata!');
      } else {
        toast.error(`❌ Test fallito: ${result.error || 'Unknown'}`);
      }
    } catch (error) {
      console.error('Test notification error:', error);
      toast.error('❌ Errore invio test');
    }
  };

  const getStatusIcon = (status: 'granted' | 'denied' | 'default' | 'unknown') => {
    switch (status) {
      case 'granted': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'denied': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getProviderInfo = () => {
    if (!subscription) return null;
    
    const endpoint = subscription.endpoint;
    const isApns = endpoint.includes('web.push.apple.com');
    const isFcm = endpoint.includes('googleapis.com');
    
    return {
      provider: isApns ? 'APNs (Safari)' : isFcm ? 'FCM (Chrome)' : 'Unknown',
      color: isApns ? 'blue' : isFcm ? 'green' : 'gray'
    };
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Push Registration Test
          </CardTitle>
          <CardDescription>
            Test del sistema di registrazione notifiche push per Safari + Chrome
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Support Status */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <div className="text-sm font-medium">Browser Support</div>
              <div className="flex items-center gap-2">
                {getStatusIcon(support.supported ? 'granted' : 'denied')}
                <Badge variant={support.supported ? "default" : "destructive"}>
                  {support.supported ? 'Supportato' : 'Non supportato'}
                </Badge>
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="text-sm font-medium">Permission</div>
              <div className="flex items-center gap-2">
                {getStatusIcon(support.permission)}
                <Badge variant={support.permission === 'granted' ? "default" : "secondary"}>
                  {support.permission}
                </Badge>
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="text-sm font-medium">PWA Mode</div>
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4" />
                <Badge variant={support.isPWA ? "default" : "secondary"}>
                  {support.isPWA ? 'PWA' : 'Browser'}
                </Badge>
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="text-sm font-medium">DB Status</div>
              <div className="flex items-center gap-2">
                {getStatusIcon(dbStatus === 'saved' ? 'granted' : dbStatus === 'failed' ? 'denied' : 'default')}
                <Badge variant={dbStatus === 'saved' ? "default" : dbStatus === 'failed' ? "destructive" : "secondary"}>
                  {dbStatus === 'saved' ? 'Salvato' : dbStatus === 'failed' ? 'Errore' : 'Unknown'}
                </Badge>
              </div>
            </div>
          </div>

          {/* Subscription Info */}
          {subscription && (
            <div className="space-y-2">
              <div className="text-sm font-medium">Subscription Info</div>
              <div className="space-y-1 text-xs">
                <div><strong>Provider:</strong> 
                  <Badge variant="outline" className="ml-2">
                    {getProviderInfo()?.provider}
                  </Badge>
                </div>
                <div><strong>Endpoint:</strong> {subscription.endpoint.substring(0, 60)}...</div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            {support.permission !== 'granted' && (
              <Button onClick={handleRequestPermission} variant="outline">
                <Shield className="w-4 h-4 mr-2" />
                Richiedi Permessi
              </Button>
            )}
            
            {support.permission === 'granted' && user && (
              <Button 
                onClick={handleRegisterPush} 
                disabled={isRegistering}
                className="bg-primary hover:bg-primary/90"
              >
                {isRegistering ? '🔄 Registrando...' : '🚀 Registra Push'}
              </Button>
            )}
            
            {subscription && (
              <Button onClick={handleTestNotification} variant="outline">
                🧪 Test Notifica
              </Button>
            )}
          </div>

          {/* Debug Info */}
          <div className="text-xs text-muted-foreground space-y-1">
            <div><strong>User Agent:</strong> {navigator.userAgent.substring(0, 80)}...</div>
            <div><strong>Platform:</strong> {navigator.platform}</div>
            {user && <div><strong>User ID:</strong> {user.id}</div>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};