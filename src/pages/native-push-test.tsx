// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
// Native Push Notifications Test Page (iOS + Android)

import React from 'react';
import { PushNotificationSetup } from '@/components/PushNotificationSetup';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNativePushNotifications } from '@/hooks/useNativePushNotifications';
import { Smartphone, Send, Bell, Apple, TestTube } from 'lucide-react';
import { Capacitor } from '@/lib/capacitor-compat';

export default function NativePushTest() {
  const { platform, isRegistered, token } = useNativePushNotifications();
  const currentPlatform = Capacitor.getPlatform();

  const sendTestNotification = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Devi essere autenticato per testare le notifiche');
        return;
      }

      toast.loading('Invio notifica di test...');

      const { data, error } = await supabase.functions.invoke('send-native-push', {
        body: {
          title: '🚀 Test M1SSION',
          body: `Notifica push ${platform} inviata con successo!`,
          data: {
            type: 'test',
            timestamp: new Date().toISOString()
          }
        }
      });

      if (error) {
        console.error('Errore invio notifica:', error);
        toast.error('Errore nell\'invio della notifica');
      } else {
        toast.success('Notifica di test inviata!');
        console.log('Test notification sent:', data);
      }
    } catch (error) {
      console.error('Errore:', error);
      toast.error('Errore nell\'invio della notifica');
    }
  };

  const getPlatformIcon = () => {
    // In PWA environment, always show web icon
    return <Bell className="w-6 h-6" />;
  };

  const getPlatformName = () => {
    // In PWA environment, always return Web
    return 'PWA Web';
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 mb-4">
          {getPlatformIcon()}
          <TestTube className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-foreground bg-clip-text text-transparent">
          Test Notifiche Push Native
        </h1>
        <div className="flex items-center justify-center gap-2">
          <Badge variant="outline">
            {getPlatformIcon()}
            <span className="ml-1">{getPlatformName()}</span>
          </Badge>
          {isRegistered && (
            <Badge variant="default" className="bg-green-500">
              <Bell className="w-3 h-3 mr-1" />
              Attive
            </Badge>
          )}
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Testa le notifiche push native per {getPlatformName()}
        </p>
      </div>

      {/* Push Setup Component */}
      <PushNotificationSetup className="max-w-md mx-auto" />

      {/* Test Controls */}
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="w-5 h-5" />
            Test Notifica
          </CardTitle>
          <CardDescription>
            Invia una notifica di test al tuo dispositivo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={sendTestNotification}
            disabled={!isRegistered}
            className="w-full"
          >
            <Send className="w-4 h-4 mr-2" />
            Invia Notifica di Test
          </Button>
          
          {!isRegistered && (
            <p className="text-sm text-muted-foreground mt-2 text-center">
              Prima configura le notifiche push qui sopra
            </p>
          )}
        </CardContent>
      </Card>

      {/* Debug Info */}
      {token && (
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-sm">Debug Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-xs">
              <strong>Platform:</strong> {currentPlatform}
            </div>
            <div className="text-xs">
              <strong>Registered:</strong> {isRegistered ? 'Sì' : 'No'}
            </div>
            <div className="text-xs break-all">
              <strong>Token:</strong> {token.substring(0, 50)}...
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}