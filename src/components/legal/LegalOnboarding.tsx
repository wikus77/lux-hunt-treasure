// © 2025 M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Check, FileText, Globe } from 'lucide-react';
import { useLegalConsent } from '@/hooks/useLegalConsent';
import { useLocation } from 'wouter';
import { toast } from 'sonner';

type SupportedLanguage = 'en' | 'fr' | 'es' | 'de';

interface LegalContent {
  title: string;
  description: string;
  acceptButton: string;
  learnMore: string;
  skillBased: string;
}

const translations: Record<SupportedLanguage, LegalContent> = {
  en: {
    title: "Legal Terms - M1SSION™",
    description: "To play M1SSION™, you must accept our Terms of Use. This is not a lottery or gambling game. It is a skill-based experience.",
    acceptButton: "✅ I Accept",
    learnMore: "Learn More",
    skillBased: "🎯 Skill-Based Game - No Gambling"
  },
  fr: {
    title: "Conditions Légales - M1SSION™",
    description: "Pour jouer à M1SSION™, vous devez accepter nos Conditions d'utilisation. Ce n'est pas un jeu de hasard, mais un jeu basé sur l'habileté.",
    acceptButton: "✅ J'accepte",
    learnMore: "En savoir plus",
    skillBased: "🎯 Jeu d'Habileté - Pas de Jeu de Hasard"
  },
  es: {
    title: "Términos Legales - M1SSION™",
    description: "Para jugar a M1SSION™, debes aceptar nuestros Términos de uso. No es un juego de azar, sino un desafío de habilidad.",
    acceptButton: "✅ Acepto",
    learnMore: "Saber más",
    skillBased: "🎯 Juego de Habilidad - Sin Apuestas"
  },
  de: {
    title: "Rechtliche Bedingungen - M1SSION™",
    description: "Um M1SSION™ zu spielen, musst du unsere Nutzungsbedingungen akzeptieren. Es handelt sich nicht um ein Glücksspiel, sondern um ein Geschicklichkeitsspiel.",
    acceptButton: "✅ Ich akzeptiere",
    learnMore: "Mehr erfahren",
    skillBased: "🎯 Geschicklichkeitsspiel - Kein Glücksspiel"
  }
};

const LegalOnboarding: React.FC = () => {
  const { needsConsent, isLoading, acceptLegalConsent } = useLegalConsent();
  const [currentLang, setCurrentLang] = useState<SupportedLanguage>('en');
  const [accepting, setAccepting] = useState(false);
  const [, setLocation] = useLocation();

  console.log('🏛️ LegalOnboarding render:', { needsConsent, isLoading });

  useEffect(() => {
    // Auto-detect browser language
    const detectLanguage = (): SupportedLanguage => {
      const browserLang = navigator.language.toLowerCase();
      
      if (browserLang.startsWith('fr')) return 'fr';
      if (browserLang.startsWith('es')) return 'es';
      if (browserLang.startsWith('de')) return 'de';
      return 'en'; // Default to English
    };

    setCurrentLang(detectLanguage());
  }, []);

  const handleAccept = async (e?: React.MouseEvent | React.FormEvent) => {
    // CRITICAL: Prevent any form submission or page reload
    e?.preventDefault?.();
    e?.stopPropagation?.();
    
    setAccepting(true);
    try {
      const success = await acceptLegalConsent();
      
      // CRITICAL: Verify localStorage persistence before redirect
      const saved = localStorage.getItem('m1ssion_legal_consent');
      
      if (success && saved === 'true') {
        console.log('✅ Legal consent saved, redirecting to home');
        setLocation('/home'); // Explicit redirect to home
      } else {
        console.error('❌ localStorage save failed or consent not accepted');
        toast.error('Errore nel salvataggio del consenso. Riprova.');
      }
    } catch (error) {
      console.error('❌ Error accepting consent:', error);
      toast.error('Errore. Riprova.');
    } finally {
      setAccepting(false);
    }
  };

  const handleLanguageChange = (lang: SupportedLanguage) => {
    setCurrentLang(lang);
  };

  const openTerms = () => {
    console.log('🔗 Opening terms page...');
    
    // PWA-compatible navigation - use internal routing instead of window.open
    setLocation('/terms');
  };

  if (isLoading) {
    console.log('🏛️ LegalOnboarding: Loading state');
    return null;
  }
  
  if (!needsConsent) {
    console.log('🏛️ LegalOnboarding: No consent needed');
    return null;
  }
  
  console.log('🏛️ LegalOnboarding: Showing banner for language:', currentLang);

  const content = translations[currentLang];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[10000] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="w-full max-w-lg"
        >
          <Card className="bg-gradient-to-br from-gray-900/95 to-black/95 border-[#00D1FF]/30 shadow-2xl">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between mb-4">
                <CardTitle className="flex items-center text-white text-lg">
                  <Shield className="w-6 h-6 mr-3 text-[#00D1FF]" />
                  {content.title}
                </CardTitle>
                
                {/* Language Selector */}
                <div className="flex gap-1">
                  {(['en', 'fr', 'es', 'de'] as SupportedLanguage[]).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => handleLanguageChange(lang)}
                      className={`px-2 py-1 text-xs rounded-md transition-all ${
                        currentLang === lang
                          ? 'bg-[#00D1FF] text-black font-semibold'
                          : 'bg-white/10 text-white/70 hover:bg-white/20'
                      }`}
                    >
                      {lang.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Skill-Based Badge */}
              <div className="flex items-center justify-center mb-4">
                <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-full px-4 py-2">
                  <span className="text-green-400 text-sm font-medium">
                    {content.skillBased}
                  </span>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-white/90 text-base leading-relaxed mb-6">
                  {content.description}
                </p>
              </div>

              {/* Key Points */}
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center text-sm text-white/80">
                  <Check className="w-4 h-4 mr-3 text-green-400 flex-shrink-0" />
                  <span>Skill-based gameplay only</span>
                </div>
                <div className="flex items-center text-sm text-white/80">
                  <Check className="w-4 h-4 mr-3 text-green-400 flex-shrink-0" />
                  <span>No gambling or random mechanics</span>
                </div>
                <div className="flex items-center text-sm text-white/80">
                  <Check className="w-4 h-4 mr-3 text-green-400 flex-shrink-0" />
                  <span>Fair play and transparency</span>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-col space-y-3 pt-4">
                <Button
                  onClick={handleAccept}
                  disabled={accepting}
                  className="w-full bg-gradient-to-r from-[#00D1FF] to-[#7B2BF9] hover:opacity-90 text-white font-semibold py-3"
                >
                  {accepting ? (
                    <div className="flex items-center">
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    content.acceptButton
                  )}
                </Button>
                
                <Button
                  onClick={() => {
                    console.log('🔗 Learn More button clicked');
                    openTerms();
                  }}
                  variant="outline"
                  className="w-full border-white/20 text-white hover:bg-white/10"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  {content.learnMore}
                </Button>
              </div>
              
              {/* Footer */}
              <div className="text-center pt-4 border-t border-white/10">
                <p className="text-xs text-white/50">
                  © 2025 M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default LegalOnboarding;