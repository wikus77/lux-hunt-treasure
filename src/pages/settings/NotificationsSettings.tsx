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

interface NotificationSettings {
  notifications_enabled: boolean;
  weekly_hints: 'all' | 'only-premium' | 'none';
  preferred_rewards: string[];
  push_notifications_enabled: boolean;
}

const NotificationsSettings: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  // VAPID key decoder
  // VAPID base64url decoder (sicuro)
  const b64urlToUint8 = (b64url: string) => {
    const pad = '='.repeat((4 - (b64url.length % 4)) % 4);
    const b64 = (b64url + pad).replace(/-/g, '+').replace(/_/g, '/');
    const raw = atob(b64);
    const out = new Uint8Array(raw.length);
    for(let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
    return out;
  };
  
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
    const checkSupport = async () => {
      // Feature detection ONLY (no UA detection)
      const supportsPush = location.protocol === 'https:' &&
        'Notification' in window && 
        'serviceWorker' in navigator && 
        'PushManager' in window;
      
      setIsSupported(supportsPush);
      console.log('Push API supported:', supportsPush);
      
      if (supportsPush) {
        try {
          // Register /sw.js (unified service worker)
          await navigator.serviceWorker.register('/sw.js', { scope: '/' });
          const registration = await navigator.serviceWorker.ready;
          
          // SOURCE OF TRUTH: getSubscription()
          const subscription = await registration.pushManager.getSubscription();
          setIsEnabled(!!subscription);
          
          console.log('Subscription status:', !!subscription);
          if (subscription) {
            console.log('Active subscription:', subscription.toJSON());
          }
        } catch (error) {
          console.error('Error checking push subscription:', error);
        }
      }
    };

    checkSupport();
    loadNotificationSettings();
  }, [user]);

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

    setIsLoading(true);
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
      setIsLoading(false);
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

  const handleToggle = async () => {
    if (!isSupported) return;
    
    setIsLoading(true);
    
    try {
      const registration = await navigator.serviceWorker.ready;
      
      if (isEnabled) {
        // OFF: unsubscribe + best-effort delete
        const subscription = await registration.pushManager.getSubscription();
        
        if (subscription) {
          await subscription.unsubscribe();
          console.log('Unsubscribed successfully');
          
          // Best-effort delete from DB
          try {
            const SUPA = 'https://vkjrqirvdvjbemsfzxof.supabase.co';
            const ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZranJxaXJ2ZHZqYmVtc2Z6eG9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwMzQyMjYsImV4cCI6MjA2MDYxMDIyNn0.rb0F3dhKXwb_110--08Jsi4pt_jx-5IWwhi96eYMxBk';
            
            await fetch(`${SUPA}/functions/v1/push_subscribe`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${ANON}`,
                'apikey': ANON
              },
              body: JSON.stringify({ user_id: user?.id, unsubscribe: true })
            });
          } catch (e) {
            console.warn('DB delete failed (non-critical):', e);
          }
        }
        
        setIsEnabled(false);
        toast({
          title: "🔕 Notifiche disabilitate",
          description: "Push notifications disattivate"
        });
        
      } else {
        // ON: request permission + subscribe + save
        const permission = await Notification.requestPermission();
        
        if (permission !== 'granted') {
          toast({
            title: "❌ Permessi negati",
            description: "Permessi per le notifiche negati"
          });
          return;
        }
        
        // ALWAYS use applicationServerKey
        const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY || 'BCboRJTDYR4W2lbR4_BLoSJUkbORYxmqyBi0oDZvbMUbwU-dq4U-tOkMLlpTSL9OYDAgQDmcswZ0eY8wRK5BV_U';
        
        console.log('VAPID public bytes:', b64urlToUint8(vapidKey).length); // must be 65
        
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: b64urlToUint8(vapidKey)
        });
        
        const subJSON = subscription.toJSON();
        console.log('New subscription:', subJSON);
        
        // Save using subscription.toJSON()
        const subscriptionData = {
          subscription: subJSON,
          user_id: user?.id,
          client_id: crypto.randomUUID(),
          platform: subJSON.endpoint.includes('web.push.apple.com') ? 'apple' : 'fcm',
          ua: navigator.userAgent
        };
        
        const SUPA = 'https://vkjrqirvdvjbemsfzxof.supabase.co';
        const ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZranJxaXJ2ZHZqYmVtc2Z6eG9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwMzQyMjYsImV4cCI6MjA2MDYxMDIyNn0.rb0F3dhKXwb_110--08Jsi4pt_jx-5IWwhi96eYMxBk';
        
        const saveResponse = await fetch(`${SUPA}/functions/v1/push_subscribe`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${ANON}`,
            'apikey': ANON
          },
          body: JSON.stringify(subscriptionData)
        });
        
        const saveText = await saveResponse.text();
        console.log('Save response:', saveResponse.status, saveText);
        
        if (saveResponse.status >= 200 && saveResponse.status <= 299) {
          setIsEnabled(true);
          toast({
            title: "✅ Notifiche abilitate",
            description: "Push notifications attivate"
          });
        } else {
          throw new Error(`Save failed: ${saveResponse.status} - ${saveText}`);
        }
      }
    } catch (error) {
      console.error('Error toggling notifications:', error);
      toast({
        title: "❌ Errore",
        description: `Errore: ${error.message}`
      });
    } finally {
      setIsLoading(false);
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
            
            <Switch
              checked={settings.notifications_enabled}
              onCheckedChange={handleNotificationsToggle}
              disabled={isLoading}
            />
          </div>

          {/* Push Notifications Toggle */}
          <div className="border-t border-white/10 pt-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-white font-medium flex items-center">
                  <Smartphone className="w-4 h-4 mr-2" />
                  Notifiche Push
                </Label>
                <p className="text-white/70 text-sm">
                  Ricevi notifiche push native su questo dispositivo.
                </p>
                {!isSupported && (
                  <p className="text-red-400 text-xs">
                    ⚠️ Notifiche push non supportate su questo dispositivo
                  </p>
                )}
              </div>
              
              <Switch
                checked={isEnabled}
                onCheckedChange={handleToggle}
                disabled={isLoading || !isSupported}
              />
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
              disabled={isLoading || !settings.notifications_enabled}
            >
              <SelectTrigger className="bg-black/60 border-[#00D1FF]/30 text-white">
                <SelectValue placeholder="Seleziona frequenza" />
              </SelectTrigger>
              <SelectContent className="bg-black border-[#00D1FF]/30">
                <SelectItem value="all" className="text-white hover:bg-[#00D1FF]/20">
                  Tutti gli indizi
                </SelectItem>
                <SelectItem value="only-premium" className="text-white hover:bg-[#00D1FF]/20">
                  Solo indizi premium
                </SelectItem>
                <SelectItem value="none" className="text-white hover:bg-[#00D1FF]/20">
                  Nessun indizio
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Reward Preferences */}
      <Card className="bg-black/40 border-[#00D1FF]/20 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white font-orbitron">Preferenze Premi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Label className="text-white font-medium">Categorie di Interesse</Label>
            <p className="text-white/70 text-sm">
              Seleziona le categorie di premi che ti interessano di più.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {rewardOptions.map((reward) => (
                <div key={reward.id} className="flex items-center space-x-3">
                  <Checkbox
                    id={reward.id}
                    checked={settings.preferred_rewards.includes(reward.id)}
                    onCheckedChange={(checked) => 
                      handleRewardPreferenceChange(reward.id, checked as boolean)
                    }
                    disabled={isLoading || !settings.notifications_enabled}
                    className="border-[#00D1FF]/30 data-[state=checked]:bg-[#00D1FF]"
                  />
                  <Label 
                    htmlFor={reward.id} 
                    className="text-white cursor-pointer flex items-center"
                  >
                    <span className="mr-2">{reward.icon}</span>
                    {reward.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audio Preferences */}
      <Card className="bg-black/40 border-[#00D1FF]/20 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white font-orbitron">Audio & Suoni</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-white font-medium flex items-center">
                <Volume2 className="w-4 h-4 mr-2" />
                Suoni di Notifica
              </Label>
              <p className="text-white/70 text-sm">
                Riproduci suoni quando arrivano nuove notifiche.
              </p>
            </div>
            
            <Switch
              checked={true}
              disabled={true}
              className="opacity-50"
            />
          </div>
          
          <div className="text-center">
            <p className="text-white/50 text-sm">
              Le preferenze audio verranno implementate nelle prossime versioni.
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default NotificationsSettings;