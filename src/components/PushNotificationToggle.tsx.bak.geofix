// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Bell, BellOff, Smartphone, Monitor } from 'lucide-react';
import { useUnifiedPush as usePushNotifications } from '@/hooks/useUnifiedPush';
import { Badge } from '@/components/ui/badge';
import { subscribeFlow } from '@/lib/push/subscribeFlow';
import { FEATURE_FLAGS } from '@/config/featureFlags';
import { toast } from 'sonner';

export const PushNotificationToggle = () => {
  const {
    isSupported,
    permission,
    isSubscribed,
    loading,
    requestPermission,
    subscribe,
    unsubscribe
  } = usePushNotifications();

  // Detect platform
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
               (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isPWA = window.matchMedia('(display-mode: standalone)').matches;
  const isIOSPWA = isIOS && isPWA;

  const handleToggle = async () => {
    try {
      console.debug('[M1SSION] Toggle called:', { isSubscribed, permission });
      
      if (!isSubscribed) {
        // Use new unified pipeline if feature flag is enabled
        if (FEATURE_FLAGS.NEW_PUSH_SUBSCRIBE_FLOW) {
          const res = await subscribeFlow();
          
          if (res.ok) {
            toast.success('Notifiche attivate! 🎉');
          } else if (res.status === 'permission_denied') {
            toast.warning('Permesso negato. Abilita le notifiche nelle impostazioni di sistema.');
          } else {
            toast.error(`Errore attivazione: ${res.error ?? 'sconosciuto'}`);
          }
          return;
        }
        
        // Legacy flow: request permission first if needed
        if (permission !== 'granted') {
          const granted = await requestPermission();
          if (!granted) return;
        }
        
        // Subscribe using legacy system
        const result = await subscribe();
        console.debug('[M1SSION] Subscribe result:', result);
      } else {
        // Disable: inform user to use OS settings
        toast.info('Le notifiche possono essere disattivate dalle Impostazioni del dispositivo.');
      }
    } catch (error: any) {
      console.error('[M1SSION] Toggle error:', error);
      toast.error(`Errore: ${error?.message ?? 'unknown'}`);
    }
  };

  const getPlatformInfo = () => {
    if (isIOSPWA) {
      return {
        icon: <Smartphone className="w-4 h-4" />,
        label: 'iOS PWA',
        description: 'VAPID Push'
      };
    }
    return {
      icon: <Monitor className="w-4 h-4" />,
      label: 'Desktop',
      description: 'Firebase FCM'
    };
  };

  const platformInfo = getPlatformInfo();

  if (!isSupported) {
    return (
      <div className="flex items-center space-x-3 p-4 bg-muted/20 rounded-lg">
        <BellOff className="w-5 h-5 text-muted-foreground" />
        <div>
          <Label className="text-muted-foreground">Push Notifications</Label>
          <p className="text-xs text-muted-foreground">Not supported on this device</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-4 bg-card rounded-lg border">
      <div className="flex items-center space-x-3">
        {isSubscribed ? (
          <Bell className="w-5 h-5 text-primary" />
        ) : (
          <BellOff className="w-5 h-5 text-muted-foreground" />
        )}
        <div>
          <div className="flex items-center gap-2">
            <Label htmlFor="push-notifications">Push Notifications</Label>
            <Badge variant="outline" className="flex items-center gap-1">
              {platformInfo.icon}
              <span className="text-xs">{platformInfo.label}</span>
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            {isSubscribed ? 'Attive' : 'Disattivate'} • {platformInfo.description}
          </p>
          {permission === 'denied' && (
            <p className="text-xs text-destructive">
              Permessi negati. Abilitali nelle impostazioni del browser.
            </p>
          )}
        </div>
      </div>
      
      <Switch
        id="push-notifications"
        checked={isSubscribed}
        onCheckedChange={handleToggle}
        disabled={loading || permission === 'denied'}
      />
    </div>
  );
};