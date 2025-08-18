// © 2025 M1SSION™ – NIYVORA KFT – Joseph MULÉ
// Unified Push Notification Manager (replaces dual Firebase/OneSignal)

import React, { useEffect, useState } from 'react';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

const PushNotificationManager: React.FC = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);
  const { getCurrentUser } = useUnifiedAuth();
  const { toast } = useToast();

  useEffect(() => {
    // Check if notifications are supported
    setIsSupported('Notification' in window && 'serviceWorker' in navigator);
    setPermission(Notification.permission);
  }, []);

  const requestNotificationPermission = async () => {
    if (!isSupported) {
      toast({
        title: "❌ Non Supportato",
        description: "Le notifiche push non sono supportate in questo browser",
        variant: "destructive"
      });
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setPermission(permission);

      if (permission === 'granted') {
        // Register service worker and get registration
        const registration = await navigator.serviceWorker.register('/sw.js');
        
        toast({
          title: "✅ Notifiche Attivate",
          description: "Riceverai notifiche importanti da M1SSION™",
          variant: "default"
        });

        // Store permission in user preferences
        const user = getCurrentUser();
        if (user) {
          localStorage.setItem(`push_permission_${user.id}`, 'granted');
        }

      } else {
        toast({
          title: "⚠️ Notifiche Disabilitate", 
          description: "Non riceverai notifiche da M1SSION™",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      toast({
        title: "❌ Errore",
        description: "Impossibile attivare le notifiche",
        variant: "destructive"
      });
    }
  };

  const sendTestNotification = () => {
    if (permission === 'granted') {
      new Notification('🎯 M1SSION™ Test', {
        body: 'Notifica di test funzionante!',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-96x96.png'
      });
    }
  };

  if (!isSupported) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Notifiche Push</h3>
          <p className="text-sm text-muted-foreground">
            Stato: {
              permission === 'granted' ? '✅ Attive' : 
              permission === 'denied' ? '❌ Bloccate' : 
              '⚠️ Non configurate'
            }
          </p>
        </div>
        
        <div className="space-x-2">
          {permission !== 'granted' && (
            <Button 
              onClick={requestNotificationPermission}
              variant="default"
              size="sm"
            >
              🔔 Attiva Notifiche
            </Button>
          )}
          
          {permission === 'granted' && (
            <Button 
              onClick={sendTestNotification}
              variant="outline"
              size="sm"
            >
              🧪 Test Notifica
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PushNotificationManager;