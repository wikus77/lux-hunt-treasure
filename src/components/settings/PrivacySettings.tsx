// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// @ts-nocheck

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Shield, Cookie, Bell, TrendingUp, Mail, Eye, Save } from 'lucide-react';
import { useConsentManagement } from '@/hooks/useConsentManagement';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';

interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
}

const PrivacySettings: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { consents, updateConsent, isLoading } = useConsentManagement();
  const [cookiePrefs, setCookiePrefs] = useState<CookiePreferences>({
    essential: true,
    analytics: false,
    marketing: false,
    preferences: false
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadCookiePreferences();
  }, [user]);

  const loadCookiePreferences = async () => {
    if (!user) {
      // For anonymous users, load from localStorage
      const saved = localStorage.getItem('cookie_consent');
      if (saved) {
        setCookiePrefs(JSON.parse(saved));
      }
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_cookie_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading cookie preferences:', error);
        return;
      }

      if (data) {
        setCookiePrefs({
          essential: data.essential_cookies,
          analytics: data.analytics_cookies,
          marketing: data.marketing_cookies,
          preferences: data.preferences_cookies
        });
      }
    } catch (error) {
      console.error('Error loading cookie preferences:', error);
    }
  };

  const saveCookiePreferences = async (prefs: CookiePreferences) => {
    setSaving(true);
    try {
      if (user) {
        const { error } = await supabase
          .from('user_cookie_preferences')
          .upsert({
            user_id: user.id,
            essential_cookies: prefs.essential,
            analytics_cookies: prefs.analytics,
            marketing_cookies: prefs.marketing,
            preferences_cookies: prefs.preferences
          }, { onConflict: 'user_id' });

        if (error) throw error;
      } else {
        localStorage.setItem('cookie_consent', JSON.stringify(prefs));
      }

      toast({
        title: "🍪 Preferenze salvate",
        description: "Le tue preferenze sui cookie sono state aggiornate con successo."
      });
    } catch (error) {
      console.error('Error saving cookie preferences:', error);
      toast({
        title: "❌ Errore",
        description: "Impossibile salvare le preferenze. Riprova.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleConsentChange = async (type: keyof typeof consents, value: boolean) => {
    const success = await updateConsent(type, value);
    if (success) {
      toast({
        title: "✅ Preferenze aggiornate",
        description: `Consenso per ${type} ${value ? 'concesso' : 'revocato'}.`
      });
    } else {
      toast({
        title: "❌ Errore",
        description: "Impossibile aggiornare le preferenze. Riprova.",
        variant: "destructive"
      });
    }
  };

  const handleCookieChange = (type: keyof CookiePreferences, value: boolean) => {
    setCookiePrefs(prev => ({ ...prev, [type]: value }));
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00D1FF] mx-auto mb-4"></div>
        <p className="text-white/60">Caricamento preferenze...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* GDPR Consents */}
      <Card className="bg-black/40 border-[#00D1FF]/20 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white font-orbitron flex items-center">
            <Shield className="w-5 h-5 mr-2 text-[#00D1FF]" />
            Gestione Consensi GDPR
          </CardTitle>
          <p className="text-white/70 text-sm">
            Gestisci i tuoi consensi per il trattamento dei dati personali secondo il GDPR.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-[#00D1FF]" />
                <div className="flex-1">
                  <h4 className="text-white font-medium">Marketing e Comunicazioni</h4>
                  <p className="text-white/60 text-sm">
                    Ricevi email promozionali, newsletter e aggiornamenti su M1SSION™
                  </p>
                </div>
              </div>
              <Switch 
                checked={consents.marketing}
                onCheckedChange={(checked) => handleConsentChange('marketing', checked)}
                className="data-[state=checked]:bg-[#00D1FF]"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <TrendingUp className="w-5 h-5 text-[#00D1FF]" />
                <div className="flex-1">
                  <h4 className="text-white font-medium">Analisi e Statistiche</h4>
                  <p className="text-white/60 text-sm">
                    Analisi dell'utilizzo dell'app per migliorare l'esperienza utente
                  </p>
                </div>
              </div>
              <Switch 
                checked={consents.analytics}
                onCheckedChange={(checked) => handleConsentChange('analytics', checked)}
                className="data-[state=checked]:bg-[#00D1FF]"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Eye className="w-5 h-5 text-[#00D1FF]" />
                <div className="flex-1">
                  <h4 className="text-white font-medium">Profilazione</h4>
                  <p className="text-white/60 text-sm">
                    Creazione di profili utente per contenuti personalizzati
                  </p>
                </div>
              </div>
              <Switch 
                checked={consents.profiling}
                onCheckedChange={(checked) => handleConsentChange('profiling', checked)}
                className="data-[state=checked]:bg-[#00D1FF]"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Bell className="w-5 h-5 text-[#00D1FF]" />
                <div className="flex-1">
                  <h4 className="text-white font-medium">Comunicazioni di Servizio</h4>
                  <p className="text-white/60 text-sm">
                    Notifiche relative alle missioni, account e sicurezza
                  </p>
                </div>
              </div>
              <Switch 
                checked={consents.communications}
                onCheckedChange={(checked) => handleConsentChange('communications', checked)}
                className="data-[state=checked]:bg-[#00D1FF]"
              />
            </div>
          </div>

          <div className="bg-[#00D1FF]/10 p-4 rounded-lg border border-[#00D1FF]/20">
            <p className="text-[#00D1FF] text-sm">
              <strong>GDPR:</strong> Puoi modificare questi consensi in qualsiasi momento. 
              La revoca non influenzerà la legalità del trattamento basato sul consenso prima della revoca.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Cookie Preferences */}
      <Card className="bg-black/40 border-[#00D1FF]/20 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white font-orbitron flex items-center">
            <Cookie className="w-5 h-5 mr-2 text-[#00D1FF]" />
            Preferenze Cookie
          </CardTitle>
          <p className="text-white/70 text-sm">
            Controlla quali cookie utilizzare per personalizzare la tua esperienza.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between opacity-60">
              <div className="flex-1">
                <h4 className="text-white font-medium">Cookie Essenziali</h4>
                <p className="text-white/60 text-sm">
                  Necessari per il funzionamento base dell'app (sempre attivi)
                </p>
              </div>
              <Switch 
                checked={cookiePrefs.essential}
                disabled={true}
                className="data-[state=checked]:bg-[#00D1FF]"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h4 className="text-white font-medium">Cookie Analitici</h4>
                <p className="text-white/60 text-sm">
                  Raccolgono informazioni sull'utilizzo dell'app in modo anonimo
                </p>
              </div>
              <Switch 
                checked={cookiePrefs.analytics}
                onCheckedChange={(checked) => handleCookieChange('analytics', checked)}
                className="data-[state=checked]:bg-[#00D1FF]"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h4 className="text-white font-medium">Cookie Marketing</h4>
                <p className="text-white/60 text-sm">
                  Utilizzati per contenuti e pubblicità personalizzati
                </p>
              </div>
              <Switch 
                checked={cookiePrefs.marketing}
                onCheckedChange={(checked) => handleCookieChange('marketing', checked)}
                className="data-[state=checked]:bg-[#00D1FF]"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h4 className="text-white font-medium">Cookie di Preferenze</h4>
                <p className="text-white/60 text-sm">
                  Ricordano le tue impostazioni per le sessioni future
                </p>
              </div>
              <Switch 
                checked={cookiePrefs.preferences}
                onCheckedChange={(checked) => handleCookieChange('preferences', checked)}
                className="data-[state=checked]:bg-[#00D1FF]"
              />
            </div>
          </div>

          <Button
            onClick={() => saveCookiePreferences(cookiePrefs)}
            disabled={saving}
            className="w-full bg-gradient-to-r from-[#00D1FF] to-[#7B2BF9] hover:opacity-90"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Salvataggio...' : 'Salva Preferenze Cookie'}
          </Button>
        </CardContent>
      </Card>

      {/* Privacy Info */}
      <Card className="bg-black/40 border-[#00D1FF]/20 backdrop-blur-sm">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <Shield className="w-12 h-12 text-[#00D1FF] mx-auto" />
            <div>
              <h3 className="text-white font-semibold mb-2">La tua privacy è importante</h3>
              <p className="text-white/70 text-sm mb-4">
                M1SSION™ rispetta la tua privacy e ti consente di controllare completamente 
                come vengono utilizzati i tuoi dati.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                variant="outline"
                onClick={() => window.open('/privacy-policy', '_blank')}
                className="border-white/20 text-white hover:bg-white/10"
              >
                Leggi Privacy Policy
              </Button>
              
              <Button
                variant="outline"
                onClick={() => window.open('/cookie-policy', '_blank')}
                className="border-white/20 text-white hover:bg-white/10"
              >
                Leggi Cookie Policy
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PrivacySettings;