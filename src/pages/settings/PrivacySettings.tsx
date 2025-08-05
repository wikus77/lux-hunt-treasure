// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useWouterNavigation } from '@/hooks/useWouterNavigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Shield, Eye, Database, Cookie, ArrowLeft } from 'lucide-react';
import UnifiedHeader from '@/components/layout/UnifiedHeader';
import BottomNavigation from '@/components/layout/BottomNavigation';
import { useProfileImage } from '@/hooks/useProfileImage';

interface PrivacySettings {
  data_collection: boolean;
  analytics_enabled: boolean;
  marketing_consent: boolean;
  cookie_preferences: {
    essential: boolean;
    analytics: boolean;
    marketing: boolean;
  };
}

const PrivacySettings: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { navigate } = useWouterNavigation();
  const { profileImage } = useProfileImage();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<PrivacySettings>({
    data_collection: true,
    analytics_enabled: true,
    marketing_consent: false,
    cookie_preferences: {
      essential: true,
      analytics: true,
      marketing: false
    }
  });

  useEffect(() => {
    loadPrivacySettings();
  }, [user]);

  const loadPrivacySettings = async () => {
    if (!user) return;

    try {
      // Use localStorage for privacy settings since they're not in database yet
      const storedSettings = localStorage.getItem(`privacy_settings_${user.id}`);
      if (storedSettings) {
        setSettings(JSON.parse(storedSettings));
      }
    } catch (error) {
      console.error('Error loading privacy settings:', error);
    }
  };

  const saveSettings = async (newSettings: Partial<PrivacySettings>) => {
    if (!user) return;

    setLoading(true);
    try {
      const updatedSettings = { ...settings, ...newSettings };
      
      // Save to localStorage for now
      localStorage.setItem(`privacy_settings_${user.id}`, JSON.stringify(updatedSettings));

      setSettings(updatedSettings);
      
      toast({
        title: "✅ Impostazioni privacy salvate",
        description: "Le tue preferenze sulla privacy sono state aggiornate."
      });
    } catch (error) {
      console.error('Error saving privacy settings:', error);
      toast({
        title: "❌ Errore salvataggio",
        description: "Impossibile salvare le impostazioni. Riprova.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDataCollectionToggle = async (enabled: boolean) => {
    await saveSettings({ data_collection: enabled });
  };

  const handleAnalyticsToggle = async (enabled: boolean) => {
    await saveSettings({ analytics_enabled: enabled });
  };

  const handleMarketingToggle = async (enabled: boolean) => {
    await saveSettings({ marketing_consent: enabled });
  };

  const handleCookiePreferenceChange = async (type: keyof PrivacySettings['cookie_preferences'], enabled: boolean) => {
    const newCookiePreferences = {
      ...settings.cookie_preferences,
      [type]: enabled
    };
    await saveSettings({ cookie_preferences: newCookiePreferences });
  };

  return (
    <div className="min-h-screen">
      <UnifiedHeader profileImage={profileImage || user?.user_metadata?.avatar_url} />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="px-4 space-y-6"
        style={{ 
          paddingTop: 'calc(72px + 47px + env(safe-area-inset-top, 0px))',
          paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 0px))'
        }}
      >
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/settings')}
          className="mb-4 text-white/70 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Indietro
        </Button>

        {/* Data Collection */}
        <Card className="bg-black/40 border-[#00D1FF]/20 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white font-orbitron flex items-center">
              <Database className="w-5 h-5 mr-2" />
              Raccolta Dati
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-white font-medium">Consenso Raccolta Dati</Label>
                <p className="text-white/70 text-sm">
                  Autorizza M1SSION™ a raccogliere dati per migliorare l'esperienza utente.
                </p>
              </div>
              <Switch
                checked={settings.data_collection}
                onCheckedChange={handleDataCollectionToggle}
                disabled={loading}
              />
            </div>

            <div className="flex items-center justify-between border-t border-white/10 pt-4">
              <div className="space-y-1">
                <Label className="text-white font-medium">Analytics</Label>
                <p className="text-white/70 text-sm">
                  Consenti l'analisi del comportamento per ottimizzare l'app.
                </p>
              </div>
              <Switch
                checked={settings.analytics_enabled}
                onCheckedChange={handleAnalyticsToggle}
                disabled={loading}
              />
            </div>

            <div className="flex items-center justify-between border-t border-white/10 pt-4">
              <div className="space-y-1">
                <Label className="text-white font-medium">Marketing</Label>
                <p className="text-white/70 text-sm">
                  Ricevi comunicazioni promozionali e offerte personalizzate.
                </p>
              </div>
              <Switch
                checked={settings.marketing_consent}
                onCheckedChange={handleMarketingToggle}
                disabled={loading}
              />
            </div>
          </CardContent>
        </Card>

        {/* Cookie Preferences */}
        <Card className="bg-black/40 border-[#00D1FF]/20 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white font-orbitron flex items-center">
              <Cookie className="w-5 h-5 mr-2" />
              Preferenze Cookie
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-white font-medium">Cookie Essenziali</Label>
                <p className="text-white/70 text-sm">
                  Necessari per il funzionamento base dell'applicazione.
                </p>
              </div>
              <Switch
                checked={settings.cookie_preferences.essential}
                onCheckedChange={(enabled) => handleCookiePreferenceChange('essential', enabled)}
                disabled={true} // Essential cookies cannot be disabled
              />
            </div>

            <div className="flex items-center justify-between border-t border-white/10 pt-4">
              <div className="space-y-1">
                <Label className="text-white font-medium">Cookie Analytics</Label>
                <p className="text-white/70 text-sm">
                  Utilizzati per analizzare l'uso dell'app e migliorare le prestazioni.
                </p>
              </div>
              <Switch
                checked={settings.cookie_preferences.analytics}
                onCheckedChange={(enabled) => handleCookiePreferenceChange('analytics', enabled)}
                disabled={loading}
              />
            </div>

            <div className="flex items-center justify-between border-t border-white/10 pt-4">
              <div className="space-y-1">
                <Label className="text-white font-medium">Cookie Marketing</Label>
                <p className="text-white/70 text-sm">
                  Per personalizzare annunci e contenuti promozionali.
                </p>
              </div>
              <Switch
                checked={settings.cookie_preferences.marketing}
                onCheckedChange={(enabled) => handleCookiePreferenceChange('marketing', enabled)}
                disabled={loading}
              />
            </div>
          </CardContent>
        </Card>

        {/* Privacy Information */}
        <Card className="bg-black/40 border-[#00D1FF]/20 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white font-orbitron flex items-center">
              <Eye className="w-5 h-5 mr-2" />
              Informazioni Privacy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-white/70 text-sm">
              I tuoi dati sono protetti secondo il Regolamento GDPR e vengono utilizzati 
              esclusivamente per migliorare la tua esperienza con M1SSION™.
            </p>
            
            <div className="space-y-2">
              <h4 className="text-white font-medium">Dati Raccolti:</h4>
              <ul className="text-white/70 text-sm space-y-1 ml-4">
                <li>• Informazioni del profilo utente</li>
                <li>• Progressi di gioco e indizi completati</li>
                <li>• Preferenze dell'applicazione</li>
                <li>• Dati di utilizzo anonimi (se autorizzato)</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="text-white font-medium">I Tuoi Diritti:</h4>
              <ul className="text-white/70 text-sm space-y-1 ml-4">
                <li>• Accesso ai tuoi dati personali</li>
                <li>• Correzione di informazioni inesatte</li>
                <li>• Cancellazione del tuo account</li>
                <li>• Portabilità dei dati</li>
              </ul>
            </div>

            <Button
              variant="outline"
              className="w-full border-white/20 text-white hover:bg-white/10"
            >
              Scarica i Miei Dati
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Bottom Navigation */}
      <div 
        style={{ 
          position: 'fixed', 
          bottom: 0, 
          left: 0, 
          right: 0, 
          width: '100vw',
          zIndex: 10000
        } as React.CSSProperties}
      >
        <BottomNavigation />
      </div>
    </div>
  );
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
export default PrivacySettings;