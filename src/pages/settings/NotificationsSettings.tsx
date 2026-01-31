// @ts-nocheck
// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
import React, { useState, useEffect, Suspense, lazy } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Bell, Volume2, VolumeX, RefreshCw, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNotificationPreferences } from '@/hooks/useNotificationPreferences';
import UnifiedHeader from '@/components/layout/UnifiedHeader';
import BottomNavigation from '@/components/layout/BottomNavigation';
import { useWouterNavigation } from '@/hooks/useWouterNavigation';
import { CircularBackButton } from '@/components/ui/CircularBackButton';
import { NativePushDiagnostic } from "@/components/push/NativePushDiagnostic";
import { Capacitor } from '@capacitor/core';

// 🔧 FIX 23/01/2026: Lazy load web push components to prevent crash on native iOS
// These components access navigator.serviceWorker, PushManager, Notification which don't exist on native
const UnifiedPushToggle = lazy(() => import('@/components/UnifiedPushToggle').then(m => ({ default: m.UnifiedPushToggle })));
const PushToggleV2 = lazy(() => import('@/components/push/PushToggleV2'));
const PushDebugPanel = lazy(() => import('@/components/PushDebugPanel'));
const NotificationsStatus = lazy(() => import('@/components/NotificationsStatus'));
const PushInspector = lazy(() => import('@/components/PushInspector'));

// Safe check for native platform
const isNativePlatform = (): boolean => {
  try {
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
};

// Loading fallback for lazy components
const PushLoadingFallback = () => (
  <div className="p-4 rounded-lg bg-white/5 border border-white/10 animate-pulse">
    <div className="h-4 bg-white/10 rounded w-1/3 mb-2"></div>
    <div className="h-3 bg-white/10 rounded w-2/3"></div>
  </div>
);

// Error fallback for web push components on native
const WebPushNotAvailable = () => (
  <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
    <div className="flex items-center gap-2 text-yellow-400 text-sm">
      <AlertCircle className="w-4 h-4" />
      <span>Web Push non disponibile su app nativa. Usa il pannello Native Push qui sotto.</span>
    </div>
  </div>
);

// Simple error boundary wrapper for push components
class ErrorBoundaryWrapper extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[NotificationsSettings] Push component error:', error.message);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
          <div className="flex items-center gap-2 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>Errore nel caricamento delle notifiche push. Ricarica la pagina.</span>
          </div>
          <p className="text-xs text-red-400/60 mt-1">
            {this.state.error?.message || 'Errore sconosciuto'}
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

interface NotificationSettings {
  notifications_enabled: boolean;
  weekly_hints: 'all' | 'only-premium' | 'none';
  push_notifications_enabled: boolean;
}

const NotificationsSettings: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { navigate } = useWouterNavigation();
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
    // 🔧 FIX 23/01/2026: Guard against undefined user
    if (!user?.id) {
      console.log('[NotificationsSettings] No user, skipping load');
      return;
    }

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
    // 🔧 FIX 23/01/2026: Guard against undefined user
    if (!user?.id) {
      console.warn('[NotificationsSettings] Cannot save - no user');
      return;
    }

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

  // 🔧 P1 FIX 31/01/2026: REMOVED duplicate UnifiedHeader/BottomNavigation
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-background/90">
      {/* UnifiedHeader REMOVED - provided by GlobalLayout */}
      
      {/* 🔧 FIX 28/01/2026: Layout come Info App */}
      <main className="pt-16 pb-20 px-4">
        <div className="max-w-lg mx-auto space-y-6">
          {/* Header with Circular Back Button */}
          <div className="flex items-center gap-3 mb-4">
            <CircularBackButton onClick={() => navigate('/settings')} size="md" />
            <div>
              <h1 className="text-xl font-orbitron text-white">Notifiche</h1>
              <p className="text-white/60 text-sm">Gestisci le tue preferenze di notifica</p>
            </div>
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

          {/* Push Notifications Section */}
          <div className="border-t border-white/10 pt-4 space-y-4">
            {/* 🔧 FIX 23/01/2026: Separate Web Push (PWA) and Native Push (iOS/Android) */}
            
            {/* NATIVE PUSH - Show on iOS/Android Capacitor apps */}
            {isNativePlatform() && (
              <ErrorBoundaryWrapper>
                <NativePushDiagnostic />
              </ErrorBoundaryWrapper>
            )}

            {/* WEB PUSH - Only show on web/PWA, NOT on native (would crash) */}
            {!isNativePlatform() && (
              <Suspense fallback={<PushLoadingFallback />}>
                {import.meta.env.VITE_PUSH_TOGGLE_V2 === '1' ? (
                  <PushToggleV2 data-push-toggle-v2 />
                ) : (
                  <UnifiedPushToggle className="w-full" data-push-toggle-v1 />
                )}
                {user?.id && (
                  <>
                    <div className="mt-4">
                      <NotificationsStatus userId={user.id} />
                    </div>
                    <PushInspector userId={user.id} />
                  </>
                )}
              </Suspense>
            )}

            {/* Native platform notice for web push section */}
            {isNativePlatform() && (
              <WebPushNotAvailable />
            )}
          </div>

          {/* Debug Panel for Push Notifications - Solo development + Web only */}
          {import.meta.env.DEV && !isNativePlatform() && !(window as any).__M1_PROD_MODE__ && (
            <Suspense fallback={<PushLoadingFallback />}>
              <div className="border-t border-white/10 pt-4">
                <PushDebugPanel />
              </div>
            </Suspense>
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
        </div>
      </main>
      
      {/* BottomNavigation REMOVED - provided by GlobalLayout */}
    </div>
  );
};

export default NotificationsSettings;