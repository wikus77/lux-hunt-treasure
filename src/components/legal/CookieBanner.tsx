// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Cookie, Settings, X, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
}

const CookieBanner: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [loading, setLoading] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    analytics: false,
    marketing: false,
    preferences: false
  });

  useEffect(() => {
    checkCookieConsent();
  }, [user]);

  const checkCookieConsent = async () => {
    try {
      // Check localStorage first (for anonymous users)
      const savedConsent = localStorage.getItem('cookie_consent');
      
      if (user) {
        // For authenticated users, check database
        const { data, error } = await supabase
          .from('user_cookie_preferences')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error loading cookie preferences:', error);
        }

        if (data) {
          setPreferences({
            essential: data.essential_cookies,
            analytics: data.analytics_cookies,
            marketing: data.marketing_cookies,
            preferences: data.preferences_cookies
          });
          return; // User has already set preferences
        }
      } else if (savedConsent) {
        // Anonymous user has set preferences
        setPreferences(JSON.parse(savedConsent));
        return;
      }

      // Show banner if no consent found
      setShowBanner(true);
    } catch (error) {
      console.error('Error checking cookie consent:', error);
      setShowBanner(true);
    }
  };

  const handleAcceptAll = async () => {
    const allAccepted = {
      essential: true,
      analytics: true,
      marketing: true,
      preferences: true
    };
    
    await saveCookiePreferences(allAccepted);
    setShowBanner(false);
    
    toast({
      title: "🍪 Cookie accettati",
      description: "Hai accettato tutti i cookie. Grazie!"
    });
  };

  const handleRejectAll = async () => {
    const onlyEssential = {
      essential: true,
      analytics: false,
      marketing: false,
      preferences: false
    };
    
    await saveCookiePreferences(onlyEssential);
    setShowBanner(false);
    
    toast({
      title: "🍪 Cookie rifiutati",
      description: "Solo i cookie essenziali saranno utilizzati."
    });
  };

  const handleSaveCustom = async () => {
    setLoading(true);
    try {
      await saveCookiePreferences(preferences);
      setShowBanner(false);
      setShowSettings(false);
      
      toast({
        title: "🍪 Preferenze salvate",
        description: "Le tue preferenze sui cookie sono state aggiornate."
      });
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast({
        title: "❌ Errore",
        description: "Impossibile salvare le preferenze. Riprova.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveCookiePreferences = async (prefs: CookiePreferences) => {
    try {
      if (user) {
        // Save to database for authenticated users
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

        // Also save consent record
        await supabase.from('user_consents').upsert({
          user_id: user.id,
          cookie_consent: true
        }, { onConflict: 'user_id' });

      } else {
        // Save to localStorage for anonymous users
        localStorage.setItem('cookie_consent', JSON.stringify(prefs));
      }

      setPreferences(prefs);
    } catch (error) {
      console.error('Error saving cookie preferences:', error);
      throw error;
    }
  };

  if (!showBanner) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-end md:items-center md:justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="w-full max-w-md"
        >
          {!showSettings ? (
            // Main Cookie Banner
            <Card className="bg-gradient-to-br from-[#131524] to-[#1a1d3a] border-[#00D1FF]/30">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center text-white">
                  <Cookie className="w-5 h-5 mr-2 text-[#00D1FF]" />
                  Cookie Policy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-white/80 text-sm">
                  Utilizziamo cookie per migliorare la tua esperienza, analizzare il traffico 
                  e personalizzare i contenuti. Puoi gestire le tue preferenze o accettare tutto.
                </p>
                
                <div className="flex flex-col space-y-2">
                  <Button
                    onClick={handleAcceptAll}
                    className="bg-gradient-to-r from-[#00D1FF] to-[#7B2BF9] hover:opacity-90"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Accetta tutto
                  </Button>
                  
                  <Button
                    onClick={handleRejectAll}
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Rifiuta tutto
                  </Button>
                  
                  <Button
                    onClick={() => setShowSettings(true)}
                    variant="ghost"
                    className="text-[#00D1FF] hover:bg-[#00D1FF]/10"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Gestisci preferenze
                  </Button>
                </div>
                
                <p className="text-xs text-white/60 text-center">
                  Consulta la nostra{' '}
                  <button 
                    onClick={() => window.open('/cookie-policy', '_blank')}
                    className="text-[#00D1FF] hover:underline"
                  >
                    Cookie Policy completa
                  </button>
                </p>
              </CardContent>
            </Card>
          ) : (
            // Cookie Settings Panel
            <Card className="bg-gradient-to-br from-[#131524] to-[#1a1d3a] border-[#00D1FF]/30">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between text-white">
                  <span className="flex items-center">
                    <Settings className="w-5 h-5 mr-2 text-[#00D1FF]" />
                    Preferenze Cookie
                  </span>
                  <Button
                    onClick={() => setShowSettings(false)}
                    size="sm"
                    variant="ghost"
                    className="text-white/70 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="text-white font-medium">Cookie Essenziali</h4>
                      <p className="text-white/60 text-xs">Necessari per il funzionamento dell'app</p>
                    </div>
                    <Switch 
                      checked={preferences.essential}
                      disabled={true}
                      className="data-[state=checked]:bg-[#00D1FF]"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="text-white font-medium">Cookie Analitici</h4>
                      <p className="text-white/60 text-xs">Ci aiutano a migliorare l'esperienza</p>
                    </div>
                    <Switch 
                      checked={preferences.analytics}
                      onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, analytics: checked }))}
                      className="data-[state=checked]:bg-[#00D1FF]"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="text-white font-medium">Cookie Marketing</h4>
                      <p className="text-white/60 text-xs">Per contenuti e pubblicità personalizzati</p>
                    </div>
                    <Switch 
                      checked={preferences.marketing}
                      onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, marketing: checked }))}
                      className="data-[state=checked]:bg-[#00D1FF]"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="text-white font-medium">Cookie Preferenze</h4>
                      <p className="text-white/60 text-xs">Ricordano le tue impostazioni</p>
                    </div>
                    <Switch 
                      checked={preferences.preferences}
                      onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, preferences: checked }))}
                      className="data-[state=checked]:bg-[#00D1FF]"
                    />
                  </div>
                </div>
                
                <Button
                  onClick={handleSaveCustom}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#00D1FF] to-[#7B2BF9] hover:opacity-90"
                >
                  {loading ? 'Salvataggio...' : 'Salva preferenze'}
                </Button>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CookieBanner;