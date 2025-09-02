// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Bell, Volume2, VolumeX, Smartphone } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useFcm } from '@/hooks/useFcm';

interface NotificationSettings {
  notifications_enabled: boolean;
  weekly_hints: 'all' | 'only-premium' | 'none';
  preferred_rewards: string[];
  push_notifications_enabled: boolean;
}

const NotificationsSettings: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [pushTokenExists, setPushTokenExists] = useState(false);
  const { status, error, token, generate, isSupported, permission } = useFcm(user?.id);
  
  const [settings, setSettings] = useState<NotificationSettings>({
    notifications_enabled: true,
    weekly_hints: 'all',
    preferred_rewards: [],
    push_notifications_enabled: false
  });

  const rewardOptions = [
    { id: 'luxury', label: 'Luxury & Moda', icon: '💎' },
    { id: 'tech', label: 'Tecnologia', icon: '📱' },
    { id: 'viaggi', label: 'Viaggi & Esperienze', icon: '✈️' },
    { id: 'food', label: 'Food & Beverage', icon: '🍷' },
    { id: 'sport', label: 'Sport & Fitness', icon: '⚽' },
    { id: 'cultura', label: 'Arte & Cultura', icon: '🎨' }
  ];

  useEffect(() => {
    loadNotificationSettings();
    checkPushSubscriptionStatus(); // CHANGED: Use getSubscription() instead of DB
  }, [user, permission]); // Re-check when permission changes

  // Check Push Subscription Status using getSubscription() - SINGLE SOURCE OF TRUTH
  const checkPushSubscriptionStatus = async () => {
    if (!user) {
      console.log('🔍 No user - skipping push check');
      return;
    }
    
    try {
      console.log('🔍 Checking push subscription status using getSubscription()...');
      
      // Feature detection (not UA detection)
      const isSupported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
      
      if (!isSupported) {
        console.log('❌ Push not supported on this browser');
        setSettings(prev => ({ ...prev, push_notifications_enabled: false }));
        setPushTokenExists(false);
        return;
      }

      // Get actual subscription status from browser - SINGLE SOURCE OF TRUTH
      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration) {
        console.log('❌ No service worker registration');
        setSettings(prev => ({ ...prev, push_notifications_enabled: false }));
        setPushTokenExists(false);
        return;
      }

      const subscription = await registration.pushManager.getSubscription();
      const isSubscribed = !!subscription;
      
      console.log('📱 Push subscription status:', {
        isSubscribed,
        endpoint: subscription?.endpoint?.substring(0, 50) + '...' || 'none',
        permission: Notification.permission
      });
      
      // Update UI state based on ACTUAL subscription status
      setSettings(prev => ({ ...prev, push_notifications_enabled: isSubscribed }));
      setPushTokenExists(isSubscribed);
      
      if (isSubscribed) {
        console.log('✅ Active push subscription found');
      } else {
        console.log('❌ No active push subscription');
      }
      
    } catch (error) {
      console.error('❌ Error checking push subscription:', error);
      setSettings(prev => ({ ...prev, push_notifications_enabled: false }));
      setPushTokenExists(false);
    }
  };

  const loadNotificationSettings = async () => {
    if (!user) return;

    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('notifications_enabled, weekly_hints, preferred_rewards, push_notifications_enabled')
        .eq('id', user.id)
        .single();

      if (profile && !error) {
        setSettings({
          notifications_enabled: profile.notifications_enabled ?? true,
          weekly_hints: (profile.weekly_hints as 'all' | 'only-premium' | 'none') || 'all',
          preferred_rewards: profile.preferred_rewards || [],
          push_notifications_enabled: profile.push_notifications_enabled ?? false
        });
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  };

  const saveSettings = async (newSettings: Partial<NotificationSettings>) => {
    if (!user) return;

    setLoading(true);
    try {
      const updatedSettings = { ...settings, ...newSettings };
      
      await supabase
        .from('profiles')
        .update({
          notifications_enabled: updatedSettings.notifications_enabled,
          weekly_hints: updatedSettings.weekly_hints,
          preferred_rewards: updatedSettings.preferred_rewards,
          push_notifications_enabled: updatedSettings.push_notifications_enabled
        })
        .eq('id', user.id);

      setSettings(updatedSettings);
      
      toast({
        title: "✅ Impostazioni salvate",
        description: "Le preferenze notifiche sono state aggiornate."
      });
    } catch (error) {
      console.error('Error saving notification settings:', error);
      toast({
        title: "❌ Errore salvataggio",
        description: "Impossibile salvare le impostazioni. Riprova.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationsToggle = async (enabled: boolean) => {
    await saveSettings({ notifications_enabled: enabled });
  };

  const handleWeeklyHintsChange = async (value: 'all' | 'only-premium' | 'none') => {
    await saveSettings({ weekly_hints: value });
  };

  const handleRewardPreferenceChange = async (rewardId: string, checked: boolean) => {
    const newPreferences = checked
      ? [...settings.preferred_rewards, rewardId]
      : settings.preferred_rewards.filter(id => id !== rewardId);
    
    await saveSettings({ preferred_rewards: newPreferences });
  };

  // Enhanced push notifications toggle with iOS support
  const handlePushNotificationsToggle = async (enabled: boolean) => {
    console.log('🚀 PUSH TOGGLE:', enabled, { isSupported, permission, token, status });
    
    if (enabled) {
      if (!isSupported) {
        toast({
          title: "❌ Browser Non Supportato",
          description: "Le notifiche push non sono supportate in questo browser.",
          variant: "destructive"
        });
        return;
      }

      setLoading(true);
      
      try {
        // Feature detection (NO UA sniffing) - check endpoint type after subscription
        console.log('📱 Creating push subscription with unified VAPID key...');
        
        // Request permission first
        if (Notification.permission === 'default') {
          const permission = await Notification.requestPermission();
          if (permission !== 'granted') {
            throw new Error('Notification permission denied');
          }
        }
        
        // Register service worker and get subscription
        const registration = await navigator.serviceWorker.ready;
        
        // Convert VAPID key - UNIFIED FOR ALL PLATFORMS with validation
        const urlBase64ToUint8Array = (base64String: string) => {
          try {
            const padding = '='.repeat((4 - base64String.length % 4) % 4);
            const base64 = (base64String + padding)
              .replace(/-/g, '+')
              .replace(/_/g, '/');
            const rawData = atob(base64);
            const outputArray = new Uint8Array(rawData.length);
            for (let i = 0; i < rawData.length; ++i) {
              outputArray[i] = rawData.charCodeAt(i);
            }
            
            // Validate P-256 key length (65 bytes for uncompressed public key)
            if (outputArray.length !== 65) {
              throw new Error(`Invalid VAPID key length: ${outputArray.length} bytes (expected 65)`);
            }
            
            // Validate P-256 key format (should start with 0x04 for uncompressed)
            if (outputArray[0] !== 0x04) {
              throw new Error(`Invalid VAPID key format: first byte is 0x${outputArray[0].toString(16)} (expected 0x04)`);
            }
            
            console.log('✅ VAPID key validation passed:', outputArray.length, 'bytes');
            return outputArray;
          } catch (error) {
            console.error('❌ VAPID key conversion failed:', error);
            throw new Error(`VAPID key validation failed: ${error.message}`);
          }
        };
        
        // Use UNIFIED VAPID key from env with P-256 validation
        const UNIFIED_VAPID_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || 'BBjgzWK_1_PBZXGLQb-xQjSEUH5jLsNNgx8N0LgOcKUkZeCUaNV_gRE-QM5pKS2bPKUhVJLn0Q-H3BNGnOOjy8Q';
        
        // VALIDATE VAPID key format and length
        console.log('🔑 VAPID key validation:', {
          chars: UNIFIED_VAPID_KEY?.length,
          startsWith04: (() => {
            try {
              const raw = atob(UNIFIED_VAPID_KEY.replace(/-/g, '+').replace(/_/g, '/'));
              return raw.length === 65 && raw.charCodeAt(0) === 4;
            } catch(e) {
              return false;
            }
          })()
        });
        
        const applicationServerKey = urlBase64ToUint8Array(UNIFIED_VAPID_KEY);
        
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey
        });
        
        // Detect platform by endpoint (not UA)
        const isAppleEndpoint = subscription.endpoint.includes('web.push.apple.com');
        const isFCMEndpoint = subscription.endpoint.includes('fcm.googleapis.com');
        
        console.log('📱 Subscription created:', {
          isApple: isAppleEndpoint,
          isFCM: isFCMEndpoint,
          endpoint: subscription.endpoint.substring(0, 50) + '...'
        });
        
        // Save to Supabase push_subscriptions table con USER_ID corretto
        console.log('💾 Saving subscription with user_id:', user?.id);
        const { error } = await supabase
          .from('push_subscriptions')
          .upsert({
            user_id: user?.id,  // CRITICO: assicurati che non sia undefined
            endpoint: subscription.endpoint,
            p256dh: subscription.getKey('p256dh') ? btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')!))) : null,
            auth: subscription.getKey('auth') ? btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth')!))) : null
          }, {
            onConflict: 'endpoint'
          });
          
        if (error) throw error;
        
        // Update profile for preferences (NOT for UI state)
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ push_notifications_enabled: true })
          .eq('id', user?.id);
          
        if (profileError) {
          console.error('❌ Failed to save push_notifications_enabled to profile:', profileError);
          // Don't throw - profile update is for preferences only
        }
        
        console.log('✅ Push subscription saved successfully');
        // UI state will be updated by checkPushSubscriptionStatus()
        
        const platformName = isAppleEndpoint ? 'Apple Push Service' : 'Firebase Cloud Messaging';
        toast({
          title: "✅ Notifiche Push Attivate!",
          description: `🔥 ${platformName} configurato. Subscriptions salvata.`
        });
        
        // Recheck status using getSubscription()
        setTimeout(() => checkPushSubscriptionStatus(), 1000);
        
      } catch (error: any) {
        console.error('❌ Push notification setup failed:', error);
        setSettings(prev => ({ ...prev, push_notifications_enabled: false }));
        
        toast({
          title: "❌ Errore Attivazione",
          description: error.message || "Non è stato possibile attivare le notifiche push.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(true);
      
      try {
        // Unsubscribe from browser first (primary action)
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          const subscription = await registration.pushManager.getSubscription();
          if (subscription) {
            await subscription.unsubscribe();
            console.log('✅ Browser subscription unsubscribed');
          }
        }
        
        // Clean up database (secondary action)
        const [fcmResult, iosResult, profileResult] = await Promise.all([
          supabase
            .from('push_tokens')
            .delete()
            .eq('user_id', user?.id),
          supabase
            .from('push_subscriptions')
            .delete()
            .eq('user_id', user?.id),
          supabase
            .from('profiles')
            .update({ push_notifications_enabled: false })
            .eq('id', user?.id)
        ]);
        
        // UI state updated by checkPushSubscriptionStatus() - not DB
        console.log('🗑️ Database cleanup results:', {
          fcm: !fcmResult.error,
          ios: !iosResult.error, 
          profile: !profileResult.error
        });
        
        toast({
          title: "🔕 Notifiche Push Disattivate",
          description: "Subscription rimossa. Non riceverai più notifiche push."
        });
      } catch (error) {
        console.error('❌ Exception removing push subscriptions:', error);
        toast({
          title: "❌ Errore Disattivazione", 
          description: "Si è verificato un errore durante la disattivazione.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
        // Recheck actual subscription status
        setTimeout(() => checkPushSubscriptionStatus(), 500);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Main Notifications Toggle */}
      <Card className="bg-black/40 border-[#00D1FF]/20 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white font-orbitron flex items-center">
            <Bell className="w-5 h-5 mr-2" />
            Notifiche Generali
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-white font-medium">Attiva Notifiche</Label>
              <p className="text-white/70 text-sm">
                Ricevi notifiche per nuovi indizi, premi e aggiornamenti dell'app.
              </p>
            </div>
            
            {/* Apple Style Toggle Switch */}
            <div className="relative">
              <input
                type="checkbox"
                checked={settings.notifications_enabled}
                onChange={(e) => handleNotificationsToggle(e.target.checked)}
                disabled={loading}
                className="sr-only"
                id="notifications-toggle"
              />
              <label
                htmlFor="notifications-toggle"
                className={`
                  relative inline-flex h-6 w-11 items-center rounded-full cursor-pointer transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#00D1FF] focus:ring-offset-2 focus:ring-offset-black
                  ${settings.notifications_enabled 
                    ? 'bg-[#00D1FF]' 
                    : 'bg-gray-600'
                  }
                  ${loading ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                <span
                  className={`
                    inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 shadow-lg
                    ${settings.notifications_enabled 
                      ? 'translate-x-6' 
                      : 'translate-x-1'
                    }
                  `}
                />
              </label>
              
              {/* Loading indicator */}
              {loading && (
                <div className="absolute -right-8 top-1">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#00D1FF]"></div>
                </div>
              )}
            </div>
          </div>

          {/* Push Notifications Toggle - Apple Style */}
          <div className="border-t border-white/10 pt-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-white font-medium flex items-center">
                  <Smartphone className="w-4 h-4 mr-2" />
                  Notifiche Push
                </Label>
                <p className="text-white/70 text-sm">
                  Ricevi notifiche push OS-native (iOS/Android) su questo dispositivo.
                </p>
                {!isSupported && (
                  <p className="text-red-400 text-xs">
                    ⚠️ Notifiche push non supportate su questo dispositivo
                  </p>
                )}
                {permission === 'denied' && (
                  <p className="text-red-400 text-xs">
                    🚫 Permesso notifiche bloccato - modifica impostazioni browser
                  </p>
                )}
              </div>
              
              {/* Apple Style Toggle Switch */}
              <div className="relative">
                <input
                  type="checkbox"
                  checked={settings.push_notifications_enabled}
                  onChange={(e) => handlePushNotificationsToggle(e.target.checked)}
                  disabled={loading || status === 'loading' || !isSupported}
                  className="sr-only"
                  id="push-notifications-toggle"
                />
                <label
                  htmlFor="push-notifications-toggle"
                  className={`
                    relative inline-flex h-6 w-11 items-center rounded-full cursor-pointer transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#00D1FF] focus:ring-offset-2 focus:ring-offset-black
                    ${settings.push_notifications_enabled
                      ? 'bg-[#00D1FF]' 
                      : 'bg-gray-600'
                    }
                    ${(loading || status === 'loading' || !isSupported) 
                      ? 'opacity-50 cursor-not-allowed' 
                      : ''
                    }
                  `}
                >
                  <span
                    className={`
                      inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 shadow-lg
                      ${settings.push_notifications_enabled
                        ? 'translate-x-6' 
                        : 'translate-x-1'
                      }
                    `}
                  />
                </label>
                
                {/* Loading indicator */}
                {(loading || status === 'loading') && (
                  <div className="absolute -right-8 top-1">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#00D1FF]"></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Hints Preferences */}
      <Card className="bg-black/40 border-[#00D1FF]/20 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white font-orbitron">Indizi Settimanali</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Label className="text-white font-medium">Frequenza Indizi</Label>
            <Select
              value={settings.weekly_hints}
              onValueChange={handleWeeklyHintsChange}
              disabled={loading || !settings.notifications_enabled}
            >
              <SelectTrigger className="bg-black/20 border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-black/90 border-white/20">
                <SelectItem value="all" className="text-white">
                  Tutti gli indizi
                </SelectItem>
                <SelectItem value="only-premium" className="text-white">
                  Solo indizi premium
                </SelectItem>
                <SelectItem value="none" className="text-white">
                  Nessun indizio
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-white/70 text-sm">
              Scegli quale tipo di indizi ricevere via notifica ogni settimana.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Reward Preferences */}
      <Card className="bg-black/40 border-[#00D1FF]/20 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white font-orbitron">Premi Preferiti</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-white/70 text-sm">
            Seleziona le categorie di premi che ti interessano di più per ricevere notifiche mirate.
          </p>
          
          <div className="grid grid-cols-1 gap-3">
            {rewardOptions.map((reward) => (
              <div
                key={reward.id}
                className="flex items-center space-x-3 p-3 bg-black/20 rounded-lg border border-white/10"
              >
                <Checkbox
                  id={reward.id}
                  checked={settings.preferred_rewards.includes(reward.id)}
                  onCheckedChange={(checked) => 
                    handleRewardPreferenceChange(reward.id, checked as boolean)
                  }
                  disabled={loading || !settings.notifications_enabled}
                  className="border-white/30 data-[state=checked]:bg-[#00D1FF] data-[state=checked]:border-[#00D1FF]"
                />
                <Label
                  htmlFor={reward.id}
                  className="text-white font-medium flex items-center space-x-2 cursor-pointer flex-1"
                >
                  <span className="text-lg">{reward.icon}</span>
                  <span>{reward.label}</span>
                </Label>
              </div>
            ))}
          </div>

          <div className="pt-4">
            <Button
              onClick={() => saveSettings({})}
              disabled={loading || !settings.notifications_enabled}
              className="w-full bg-[#00D1FF] hover:bg-[#00B8E6] text-black font-semibold"
            >
              {loading ? 'Salvataggio...' : 'Salva Preferenze'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notification Status */}
      {!settings.notifications_enabled && (
        <Card className="bg-yellow-900/20 border-yellow-500/20 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <VolumeX className="w-5 h-5 text-yellow-400" />
              <div>
                <p className="text-yellow-400 font-medium">Notifiche Disabilitate</p>
                <p className="text-yellow-300/70 text-sm">
                  Attiva le notifiche per ricevere aggiornamenti sui premi e nuovi indizi.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
};

export default NotificationsSettings;