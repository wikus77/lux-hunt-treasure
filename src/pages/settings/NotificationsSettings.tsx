// 🔐 BY JOSEPH MULE — Capacitor iOS Compatible
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
import { usePushNotifications } from '@/hooks/usePushNotifications';

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
  const { isSupported, permission, requestPermission, loading: pushLoading } = usePushNotifications();
  
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
    checkPushTokenExists();
  }, [user]);

  const checkPushTokenExists = async () => {
    if (!user) return;
    
    try {
      console.log('🔍 Checking push tokens for user:', user.id);
      
      const { data, error } = await supabase
        .from('device_tokens')
        .select('id, device_type, token')
        .eq('user_id', user.id)
        .in('device_type', ['ios', 'android', 'web_push']);

      console.log('📱 Push tokens found:', data);
      
      if (!error && data && data.length > 0) {
        console.log('✅ Push tokens exist - enabling toggle');
        setPushTokenExists(true);
        setSettings(prev => ({ ...prev, push_notifications_enabled: true }));
      } else {
        console.log('❌ No push tokens found');
        setPushTokenExists(false);
        setSettings(prev => ({ ...prev, push_notifications_enabled: false }));
      }
    } catch (error) {
      console.error('Error checking push token:', error);
    }
  };

  const loadNotificationSettings = async () => {
    if (!user) return;

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('notifications_enabled, weekly_hints, preferred_rewards')
        .eq('id', user.id)
        .single();

      if (profile) {
        setSettings({
          notifications_enabled: profile.notifications_enabled ?? true,
          weekly_hints: (profile.weekly_hints as 'all' | 'only-premium' | 'none') || 'all',
          preferred_rewards: profile.preferred_rewards || [],
          push_notifications_enabled: pushTokenExists
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
          preferred_rewards: updatedSettings.preferred_rewards
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

  const handlePushNotificationsToggle = async (enabled: boolean) => {
    console.log('🔄 Push toggle clicked:', enabled);
    
    if (enabled) {
      console.log('📱 Requesting push notification permission...');
      setLoading(true);
      
      // Request push notification permission
      const result = await requestPermission();
      
      console.log('📋 Permission request result:', result);
      
      if (result.success) {
        console.log('✅ Permission granted - checking tokens again');
        
        // Re-check tokens after permission grant
        await checkPushTokenExists();
        
        toast({
          title: "✅ Notifiche Push Attivate",
          description: "Riceverai notifiche push su questo dispositivo."
        });
      } else {
        console.log('❌ Permission denied or failed');
        setSettings(prev => ({ ...prev, push_notifications_enabled: false }));
        toast({
          title: "❌ Permesso Negato",
          description: result.reason || "Le notifiche push non sono state autorizzate.",
          variant: "destructive"
        });
      }
      setLoading(false);
    } else {
      console.log('🔕 Disabling push notifications - removing tokens');
      setLoading(true);
      
      try {
        // Remove all push tokens for this user
        const { error } = await supabase
          .from('device_tokens')
          .delete()
          .eq('user_id', user?.id)
          .in('device_type', ['ios', 'android', 'web_push']);
          
        if (error) {
          console.error('❌ Error removing push tokens:', error);
          toast({
            title: "❌ Errore Disattivazione",
            description: "Non è stato possibile disattivare le notifiche push.",
            variant: "destructive"
          });
        } else {
          console.log('✅ Push tokens removed successfully');
          setPushTokenExists(false);
          setSettings(prev => ({ ...prev, push_notifications_enabled: false }));
          toast({
            title: "🔕 Notifiche Push Disattivate",
            description: "Non riceverai più notifiche push su questo dispositivo."
          });
        }
      } catch (error) {
        console.error('❌ Exception removing push tokens:', error);
        toast({
          title: "❌ Errore Disattivazione",
          description: "Si è verificato un errore durante la disattivazione.",
          variant: "destructive"
        });
      }
      
      setLoading(false);
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
                  checked={settings.push_notifications_enabled && pushTokenExists}
                  onChange={(e) => handlePushNotificationsToggle(e.target.checked)}
                  disabled={loading || pushLoading || !isSupported || permission === 'denied'}
                  className="sr-only"
                  id="push-notifications-toggle"
                />
                <label
                  htmlFor="push-notifications-toggle"
                  className={`
                    relative inline-flex h-6 w-11 items-center rounded-full cursor-pointer transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#00D1FF] focus:ring-offset-2 focus:ring-offset-black
                    ${(settings.push_notifications_enabled && pushTokenExists) 
                      ? 'bg-[#00D1FF]' 
                      : 'bg-gray-600'
                    }
                    ${(loading || pushLoading || !isSupported || permission === 'denied') 
                      ? 'opacity-50 cursor-not-allowed' 
                      : ''
                    }
                  `}
                >
                  <span
                    className={`
                      inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 shadow-lg
                      ${(settings.push_notifications_enabled && pushTokenExists) 
                        ? 'translate-x-6' 
                        : 'translate-x-1'
                      }
                    `}
                  />
                </label>
                
                {/* Loading indicator */}
                {(loading || pushLoading) && (
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