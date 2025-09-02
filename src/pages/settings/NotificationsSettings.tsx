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
    checkPushSubscriptionStatus();
  }, [user]); // Check real subscription status on mount

  // Check push subscription status using getSubscription() (SORGENTE VERITÀ)
  const checkPushSubscriptionStatus = async () => {
    if (!user) {
      console.log('🔍 No user - skipping push check');
      return;
    }
    
    try {
      console.log('🔍 Checking real push subscription status...');
      
      // SORGENTE VERITÀ: getSubscription() 
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        const subscription = await registration.pushManager.getSubscription();
        const isActive = !!subscription;
        
        console.log('📱 getSubscription() result:', { 
          hasSubscription: isActive,
          endpoint: subscription?.endpoint?.substring(0, 50) + '...'
        });
        
        // Toggle enabled = stato reale del pushManager (NON il DB)
        setSettings(prev => ({ ...prev, push_notifications_enabled: isActive }));
        setPushTokenExists(isActive);
        
        if (isActive) {
          console.log('✅ Active push subscription found');
        } else {
          console.log('❌ No active push subscription');
        }
      } else {
        console.log('❌ No service worker registration');
        setSettings(prev => ({ ...prev, push_notifications_enabled: false }));
        setPushTokenExists(false);
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

  // Enhanced push notifications toggle W3C + VAPID
  const handlePushNotificationsToggle = async (enabled: boolean) => {
    console.log('🚀 PUSH TOGGLE:', enabled, { isSupported, permission });
    
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
        // Request permission first
        if (Notification.permission === 'default') {
          const permission = await Notification.requestPermission();
          if (permission !== 'granted') {
            throw new Error('Notification permission denied');
          }
        }
        
        // Register service worker (/sw.js ONLY)
        const registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
        await navigator.serviceWorker.ready;
        
        // Base64url decoder per VAPID (OBBLIGATORIO)
        const b64urlToUint8 = (s: string) => {
          const p = '='.repeat((4 - s.length % 4) % 4);
          const b64 = (s + p).replace(/-/g, '+').replace(/_/g, '/');
          const raw = atob(b64);
          return Uint8Array.from([...raw].map(c => c.charCodeAt(0)));
        };
        
        // OBBLIGATORIO: sempre usare applicationServerKey (W3C + VAPID)
        const VAPID_PUBLIC_KEY = 'BCboRJTDYR4W2lbR4_BLoSJUkbORYxmqyBi0oDZvbMUbwU-dq4U-tOkMLlpTSL9OYDAgQDmcswZ0eY8wRK5BV_U';
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: b64urlToUint8(VAPID_PUBLIC_KEY)
        });
        
        // Get subscription JSON per Supabase
        const subJSON = subscription.toJSON();
        console.log('📱 Subscription JSON:', subJSON);
        
        // Save via Supabase edge function 
        const savePayload = {
          subscription: subJSON,
          client_id: crypto.randomUUID(),
          platform: subJSON.endpoint?.includes('web.push.apple.com') ? 'apple' : 'fcm',
          ua: navigator.userAgent,
          user_id: user?.id
        };
        
        console.log('💾 Saving subscription to Supabase...');
        const { data, error } = await supabase.functions.invoke('push_subscribe', {
          body: savePayload
        });
        
        if (error) {
          console.error('❌ Supabase edge function error:', error);
          throw new Error(error.message);
        }
        
        console.log('✅ Subscription saved:', data);
        
        // Update local state AND profile
        await supabase
          .from('profiles')
          .update({ push_notifications_enabled: true })
          .eq('id', user?.id);
        
        setSettings(prev => ({ ...prev, push_notifications_enabled: true }));
        setPushTokenExists(true);
        
        const isApple = subJSON.endpoint?.includes('web.push.apple.com');
        toast({
          title: `✅ Notifiche Push Attivate!`,
          description: `${isApple ? '🍎 Apple' : '🟢 FCM'} Push Service configurato correttamente.`
        });
        
        // Recheck real status
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
        setLoading(true);
      }
    } else {
      setLoading(true);
      
      try {
        // Unsubscribe from push manager (SORGENTE VERITÀ)
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          const subscription = await registration.pushManager.getSubscription();
          if (subscription) {
            await subscription.unsubscribe();
            console.log('✅ Push subscription unsubscribed');
          }
        }
        
        // Remove from database and update profile
        const [subscriptionsResult, tokensResult, profileResult] = await Promise.all([
          supabase
            .from('push_subscriptions')
            .delete()
            .eq('user_id', user?.id),
          supabase
            .from('push_tokens')
            .delete()
            .eq('user_id', user?.id),
          supabase
            .from('profiles')
            .update({ push_notifications_enabled: false })
            .eq('id', user?.id)
        ]);
        
        setPushTokenExists(false);
        setSettings(prev => ({ ...prev, push_notifications_enabled: false }));
        
        toast({
          title: "🔕 Notifiche Push Disattivate",
          description: "Sottoscrizioni rimosse correttamente."
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