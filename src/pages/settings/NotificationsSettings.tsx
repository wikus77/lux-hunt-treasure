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
import { Bell, Volume2, VolumeX, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { UnifiedPushToggle } from '@/components/UnifiedPushToggle';
import PushDebugPanel from '@/components/PushDebugPanel';
import { useNotificationPreferences } from '@/hooks/useNotificationPreferences';
import NotificationsStatus from '@/components/NotificationsStatus';
import PushInspector from "@/components/PushInspector";
import { canUseNotifications, canUseServiceWorker, isIOSDevice, isPWAMode, getPlatformInfo } from '@/utils/push/support';

interface NotificationSettings {
  notifications_enabled: boolean;
  weekly_hints: 'all' | 'only-premium' | 'none';
  push_notifications_enabled: boolean;
}

const NotificationsSettings: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [pushRegistrationError, setPushRegistrationError] = useState<string | null>(null);
  const [subscriptionData, setSubscriptionData] = useState<{
    sw?: PushSubscription | null;
    db?: any;
    match: boolean;
  }>({ match: false });
  
  // SSR-safe feature detection
  const canUseNotif = typeof window !== 'undefined' && 'Notification' in window;
  const canUseSW = typeof navigator !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window;
  const platformInfo = typeof window !== 'undefined' ? getPlatformInfo() : null;
  
  // Safe feature detection
  const isNotificationSupported = canUseNotifications();
  const isServiceWorkerSupported = canUseServiceWorker();
  const isIOSNotPWA = isIOSDevice() && !isPWAMode();
  
  // Use the proper notification preferences hook
  const {
    preferences,
    resolvedTags,
    isLoading: prefsLoading,
    availableCategories,
    updatePreference,
    togglePreference,
    refreshPreferences,
    hasActivePreferences
  } = useNotificationPreferences();
  
  const [settings, setSettings] = useState<NotificationSettings>({
    notifications_enabled: true,
    weekly_hints: 'all',
    push_notifications_enabled: false
  });

  // Category icons mapping - aligned with database categories
  const categoryIcons: Record<string, string> = {
    'Luxury & moda': '💎',
    'Viaggi & esperienze': '✈️',
    'Sport & fitness': '⚽',
    'Tecnologia': '📱',
    'Food & beverage': '🍷',
    'Arte & cultura': '🎨'
  };

  useEffect(() => {
    loadNotificationSettings();
    if (user && canUseSW) {
      updateTelemetry();
    }
  }, [user]);

  const loadNotificationSettings = async () => {
    if (!user) return;

    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('notifications_enabled, weekly_hints, push_notifications_enabled')
        .eq('id', user.id)
        .single();

      if (profile && !error) {
        setSettings({
          notifications_enabled: profile.notifications_enabled ?? true,
          weekly_hints: (profile.weekly_hints as 'all' | 'only-premium' | 'none') || 'all',
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

  const handleCategoryToggle = async (category: string) => {
    const success = await togglePreference(category);
    if (success) {
      toast({
        title: "✅ Preferenza aggiornata",
        description: `Categoria "${category}" ${preferences[category] ? 'disabilitata' : 'abilitata'}.`
      });
    } else {
      toast({
        title: "❌ Errore",
        description: "Impossibile aggiornare la preferenza. Riprova.",
        variant: "destructive"
      });
    }
  };

  const handleRefreshPreferences = async () => {
    await refreshPreferences();
    toast({
      title: "🔄 Preferenze aggiornate",
      description: "Cache delle preferenze aggiornata dal database."
    });
  };

  const VAPID_PUBLIC = 'BMkETBgIgFEj0MOINyixtfrde9ZiMbj-5YEtsX8GpnuXpABax28h6dLjmJ7RK6rlZXUJg1N_z3ba0X6E7Qmjj7A';
  
  const subscribeToPush = async () => {
    if (!canUseSW) {
      throw new Error('Service Worker non supportato');
    }
    
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.subscribe({ 
      userVisibleOnly: true, 
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC)
    });

    const provider = sub.endpoint.includes('web.push.apple.com') ? 'apns' : 
                    (sub.endpoint.includes('fcm.googleapis.com') ? 'fcm' : 'mozilla');
    
    const platform = platformInfo?.platform || 'web';

    const subscriptionData = {
      user_id: user!.id,
      endpoint: sub.endpoint,
      keys: sub.toJSON()?.keys || {},
      provider,
      platform
    };

    // Try Edge Function first (service role), fallback to client
    try {
      // Try via webpush-upsert edge function
      const { data, error } = await supabase.functions.invoke('webpush-upsert', {
        body: subscriptionData
      });
      
      if (error) throw error;
      console.log('✅ Subscription saved via Edge Function');
    } catch (edgeError) {
      console.warn('⚠️ Edge Function failed, using client:', edgeError);
      
      // Fallback to client-side insert
      const { error } = await supabase
        .from('webpush_subscriptions')
        .upsert({
          ...subscriptionData,
          p256dh: subscriptionData.keys.p256dh || '',
          auth: subscriptionData.keys.auth || ''
        });

      if (error) {
        throw new Error(`Database save failed: ${error.message}`);
      }
    }

    // Update telemetry
    await updateTelemetry();

    const endpointHost = new URL(sub.endpoint).hostname;
    toast({
      title: "✅ Push registrato",
      description: `Provider: ${provider}, Platform: ${platform}`
    });

    return sub;
  };
  
  const updateTelemetry = async () => {
    if (!canUseSW || !user) return;
    
    try {
      const reg = await navigator.serviceWorker.ready;
      const swSub = await reg.pushManager.getSubscription();
      
      // Get latest DB subscription
      const { data: dbSub } = await supabase
        .from('webpush_subscriptions')
        .select('endpoint, keys, provider, platform')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      const match = swSub?.endpoint === dbSub?.endpoint;
      
      setSubscriptionData({
        sw: swSub,
        db: dbSub,
        match
      });
    } catch (error) {
      console.warn('Telemetry update failed:', error);
    }
  };
  
  const handleSyncSubscription = async () => {
    if (!subscriptionData.sw) return;
    
    try {
      await subscribeToPush();
      toast({
        title: "🔄 Sincronizzato",
        description: "Subscription sincronizzata con il database."
      });
    } catch (error) {
      toast({
        title: "❌ Errore sincronizzazione",
        description: error instanceof Error ? error.message : 'Errore sconosciuto',
        variant: "destructive"
      });
    }
  };

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const handleRetryPushRegistration = async () => {
    setPushRegistrationError(null);
    
    if (!canUseNotif) {
      setPushRegistrationError("Le notifiche non sono supportate su questo dispositivo/browser.");
      toast({
        title: "❌ Non supportato",
        description: "Le notifiche push non sono supportate su questo dispositivo/browser.",
        variant: "destructive"
      });
      return;
    }

    if (isIOSNotPWA) {
      toast({
        title: "📱 iPhone/iPad - Aggiungi alla Home",
        description: "Per le notifiche push devi aggiungere M1SSION alla Home. Tocca il pulsante Condividi (📤) e poi 'Aggiungi alla schermata Home'.",
        duration: 10000
      });
      return;
    }

    try {
      if (!canUseSW) {
        throw new Error('Service Worker o PushManager non supportato');
      }

      // Request permission with clear UI
      if (Notification.permission !== 'granted') {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          throw new Error('Permesso per le notifiche negato');
        }
      }

      // Subscribe and save
      await subscribeToPush();

      toast({
        title: "✅ Registrazione completata",
        description: "Le notifiche push sono ora attive."
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Errore sconosciuto';
      setPushRegistrationError(errorMessage);
      toast({
        title: "❌ Errore registrazione",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto p-6 space-y-6"
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Impostazioni Notifiche</h1>
        <p className="text-white/70">Gestisci le tue preferenze di notifica e comunicazione</p>
      </div>

      {/* Email Notifications */}
      <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Bell className="w-5 h-5 mr-2" />
            Notifiche Email
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-white font-medium">Notifiche Generali</Label>
              <p className="text-white/70 text-sm">
                Ricevi aggiornamenti importanti via email
              </p>
            </div>
            <Switch
              checked={settings.notifications_enabled}
              onCheckedChange={handleNotificationsToggle}
              disabled={loading}
            />
          </div>

          <div className="space-y-3">
            <Label className="text-white font-medium">Suggerimenti Settimanali</Label>
            <Select
              value={settings.weekly_hints}
              onValueChange={handleWeeklyHintsChange}
              disabled={loading}
            >
              <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                <SelectItem value="all" className="text-white">Tutti i suggerimenti</SelectItem>
                <SelectItem value="only-premium" className="text-white">Solo suggerimenti premium</SelectItem>
                <SelectItem value="none" className="text-white">Nessun suggerimento</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-white font-medium">Categorie di Interesse per Feed</Label>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleRefreshPreferences}
                disabled={prefsLoading}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${prefsLoading ? 'animate-spin' : ''}`} />
                Aggiorna
              </Button>
            </div>
            <p className="text-white/70 text-sm">
              Seleziona le categorie per ricevere notifiche sui contenuti che ti interessano di più
            </p>
            {hasActivePreferences && (
              <div className="text-sm text-green-400 mb-2">
                ✅ {resolvedTags.length} tag attivi: {resolvedTags.join(', ')}
              </div>
            )}
            <div className="grid grid-cols-1 gap-3">
              {availableCategories.map((category) => (
                <div key={category} className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50 border border-gray-700">
                  <Label 
                    htmlFor={category} 
                    className="text-white flex items-center cursor-pointer flex-1"
                  >
                    <span className="mr-3 text-lg">{categoryIcons[category] || '📱'}</span>
                    <div>
                      <div className="font-medium">{category}</div>
                      {preferences[category] && (
                        <div className="text-xs text-green-400 mt-1">Attiva</div>
                      )}
                    </div>
                  </Label>
                  <Switch
                    id={category}
                    checked={preferences[category] || false}
                    onCheckedChange={() => handleCategoryToggle(category)}
                    disabled={prefsLoading || loading}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Push Notifications with iOS PWA Gating */}
          <div className="border-t border-white/10 pt-4">
            {/* iOS PWA Gating */}
            {isIOSNotPWA && (
              <div className="mb-4 p-4 bg-orange-900/20 border border-orange-700/50 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">📱</div>
                  <div>
                    <h3 className="text-white font-medium mb-2">iPhone/iPad - Aggiungi alla Home</h3>
                    <p className="text-white/70 text-sm mb-3">
                      Per abilitare le notifiche push su iOS, devi aggiungere M1SSION alla schermata Home:
                    </p>
                    <ol className="text-white/70 text-sm space-y-1 list-decimal list-inside mb-3">
                      <li>Tocca il pulsante Condividi (📤) in Safari</li>
                      <li>Seleziona "Aggiungi alla schermata Home"</li>
                      <li>Conferma e apri M1SSION dalla Home</li>
                    </ol>
                    <p className="text-orange-300 text-sm font-medium">
                      Le notifiche push funzionano solo in modalità PWA su iOS.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Notification Support Warning */}
            {!isNotificationSupported && (
              <div className="mb-4 p-4 bg-red-900/20 border border-red-700/50 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">❌</div>
                  <div>
                    <h3 className="text-white font-medium mb-2">Notifiche non supportate</h3>
                    <p className="text-white/70 text-sm">
                      Il tuo browser non supporta le notifiche push. Prova ad aggiornare il browser o usa un browser compatibile.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Push Registration Error */}
            {pushRegistrationError && (
              <div className="mb-4 p-4 bg-red-900/20 border border-red-700/50 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">⚠️</div>
                  <div className="flex-1">
                    <h3 className="text-white font-medium mb-2">Errore Registrazione Push</h3>
                    <p className="text-white/70 text-sm mb-3">{pushRegistrationError}</p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleRetryPushRegistration}
                      className="text-white border-white/20 hover:bg-white/10"
                    >
                      🔄 Riprova registrazione
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Push Toggle (only if supported and not iOS non-PWA) */}
            {isNotificationSupported && !isIOSNotPWA && (
              <>
                <UnifiedPushToggle className="w-full" />
                <div className="mt-4">
                  <NotificationsStatus userId="495246c1-9154-4f01-a428-7f37fe230180" />
                </div>
                
                {/* Telemetry Status */}
                <div className="mt-4 p-4 bg-gray-800/50 border border-gray-700 rounded-lg">
                  <h4 className="text-white font-medium mb-3">🔍 Telemetria Push</h4>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/70">SW Endpoint:</span>
                      <span className="text-white font-mono">
                        {subscriptionData.sw?.endpoint ? 
                          new URL(subscriptionData.sw.endpoint).hostname : 'N/A'}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-white/70">DB Endpoint:</span>
                      <span className="text-white font-mono">
                        {subscriptionData.db?.endpoint ? 
                          new URL(subscriptionData.db.endpoint).hostname : 'N/A'}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-white/70">Status:</span>
                      <span className={`font-medium ${subscriptionData.match ? 'text-green-400' : 'text-orange-400'}`}>
                        {subscriptionData.match ? '✅ MATCH' : '❌ NO MATCH'}
                      </span>
                    </div>
                    
                    {!subscriptionData.match && subscriptionData.sw && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleSyncSubscription}
                        className="w-full mt-2"
                      >
                        🔄 Sincronizza
                      </Button>
                    )}
                  </div>
                </div>
                
                {/* Audit read-only */}
                <PushInspector userId={"495246c1-9154-4f01-a428-7f37fe230180"} />
              </>
            )}
          </div>

          {/* Debug Panel for Push Notifications */}
          <div className="border-t border-white/10 pt-4">
            <PushDebugPanel />
          </div>
        </CardContent>
      </Card>

      {/* Sound Preferences */}
      <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Volume2 className="w-5 h-5 mr-2" />
            Preferenze Audio
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-white font-medium">Suoni di Notifica</Label>
              <p className="text-white/70 text-sm">
                Riproduci suoni per le notifiche importanti
              </p>
            </div>
            <Switch
              checked={true}
              disabled={loading}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-white font-medium">Feedback Aptico</Label>
              <p className="text-white/70 text-sm">
                Vibrazioni per dispositivi mobile
              </p>
            </div>
            <Switch
              checked={true}
              disabled={loading}
            />
          </div>
        </CardContent>
      </Card>

      {/* Privacy Note */}
      <Card className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border-blue-700/50">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <Bell className="w-5 h-5 text-blue-400 mt-0.5" />
            <div className="space-y-2">
              <h3 className="text-white font-medium">Privacy e Controllo</h3>
              <p className="text-white/70 text-sm">
                Tutte le notifiche possono essere disabilitate in qualsiasi momento. 
                I tuoi dati di preferenza sono crittografati e non vengono condivisi con terze parti.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default NotificationsSettings;