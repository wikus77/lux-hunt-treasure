// @ts-nocheck
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
import PushToggleV2 from '@/components/push/PushToggleV2';
import PushDebugPanel from '@/components/PushDebugPanel';
import { useNotificationPreferences } from '@/hooks/useNotificationPreferences';
import NotificationsStatus from '@/components/NotificationsStatus';
import PushInspector from "@/components/PushInspector";

interface NotificationSettings {
  notifications_enabled: boolean;
  weekly_hints: 'all' | 'only-premium' | 'none';
  push_notifications_enabled: boolean;
}

const NotificationsSettings: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
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

          {/* Push Notifications with V2 toggle when flag enabled */}
          <div className="border-t border-white/10 pt-4">
            {import.meta.env.VITE_PUSH_TOGGLE_V2 === '1' ? (
              <PushToggleV2 data-push-toggle-v2 />
            ) : (
              <UnifiedPushToggle className="w-full" data-push-toggle-v1 />
            )}
            <div className="mt-4">
              <NotificationsStatus userId="495246c1-9154-4f01-a428-7f37fe230180" />
            </div>
            {/* Audit read-only */}
            <PushInspector userId={"495246c1-9154-4f01-a428-7f37fe230180"} />
          </div>

          {/* Debug Panel for Push Notifications - Solo development */}
          {import.meta.env.DEV && !(window as any).__M1_PROD_MODE__ && (
            <div className="border-t border-white/10 pt-4">
              <PushDebugPanel />
            </div>
          )}
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