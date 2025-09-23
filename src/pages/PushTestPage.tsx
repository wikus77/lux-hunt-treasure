/*
 * 🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™
 * M1SSION™ Push Notifications Test Page
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import React from 'react';
import { UnifiedPushToggle } from '@/components/UnifiedPushToggle';
import { PushNotificationToggle } from '@/components/PushNotificationToggle';
import { PushRegistrationTest } from '@/components/PushRegistrationTest';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, TestTube, Zap, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const PushTestPage: React.FC = () => {
  const handleTestPush = async () => {
    try {
      toast.loading('Invio notifica di test...');
      
      const { data, error } = await supabase.functions.invoke('send-push-notification', {
        body: {
          title: '🎯 Test M1SSION™',
          body: 'Sistema di notifiche push funzionante!',
          data: {
            type: 'test',
            timestamp: Date.now()
          }
        }
      });

      if (error) throw error;
      
      toast.success('✅ Notifica di test inviata!');
    } catch (error) {
      console.error('Test push failed:', error);
      toast.error('❌ Test fallito');
    }
  };

  const getBrowserInfo = () => {
    const ua = navigator.userAgent;
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Safari')) return 'Safari';
    if (ua.includes('Edge')) return 'Edge';
    return 'Unknown';
  };

  const getPlatformInfo = () => {
    const platform = navigator.platform;
    const ua = navigator.userAgent.toLowerCase();
    
    if (/ipad|iphone|ipod/.test(ua)) return 'iOS';
    if (/android/.test(ua)) return 'Android';
    if (platform.includes('Win')) return 'Windows';
    if (platform.includes('Mac')) return 'macOS';
    if (platform.includes('Linux')) return 'Linux';
    return platform;
  };

  const isSupported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
  const isPWA = window.matchMedia('(display-mode: standalone)').matches;

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Bell className="w-8 h-8" />
          Push Notifications Test
        </h1>
        <p className="text-muted-foreground">
          Sistema unificato di notifiche push M1SSION™
        </p>
      </div>

      {/* Environment Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Informazioni Ambiente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <div className="text-sm font-medium">Browser</div>
              <Badge variant="outline">{getBrowserInfo()}</Badge>
            </div>
            <div className="space-y-1">
              <div className="text-sm font-medium">Piattaforma</div>
              <Badge variant="outline">{getPlatformInfo()}</Badge>
            </div>
            <div className="space-y-1">
              <div className="text-sm font-medium">PWA</div>
              <Badge variant={isPWA ? "default" : "secondary"}>
                {isPWA ? 'Sì' : 'No'}
              </Badge>
            </div>
            <div className="space-y-1">
              <div className="text-sm font-medium">Supporto</div>
              <Badge variant={isSupported ? "default" : "destructive"}>
                {isSupported ? 'Supportato' : 'Non supportato'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* New Unified Push System */}
      <PushRegistrationTest />

      {/* Legacy Push Systems */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Sistema Unificato
          </h2>
          <UnifiedPushToggle />
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Sistema Legacy
          </h2>
          <PushNotificationToggle />
        </div>
      </div>

      {/* Test Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="w-5 h-5" />
            Test Notifiche
          </CardTitle>
          <CardDescription>
            Invia una notifica di test per verificare il funzionamento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleTestPush} className="w-full">
            🚀 Invia Notifica di Test
          </Button>
        </CardContent>
      </Card>

      {/* Technical Details */}
      <Card>
        <CardHeader>
          <CardTitle>Dettagli Tecnici</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div><strong>User Agent:</strong> {navigator.userAgent}</div>
          <div><strong>Language:</strong> {navigator.language}</div>
          <div><strong>Platform:</strong> {navigator.platform}</div>
          <div><strong>Service Worker:</strong> {'serviceWorker' in navigator ? 'Supportato' : 'Non supportato'}</div>
          <div><strong>Push Manager:</strong> {'PushManager' in window ? 'Supportato' : 'Non supportato'}</div>
          <div><strong>Notifications:</strong> {'Notification' in window ? Notification.permission : 'Non supportato'}</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PushTestPage;

/*
 * 🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */