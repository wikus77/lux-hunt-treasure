// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import { useEffect, useState } from 'react';
import { detectInitialLanguage } from '@/intl/lang-detection';
import { landingTranslations } from '@/intl/translations';

type SupportedLanguage = 'en' | 'it' | 'fr' | 'es' | 'de' | 'pt' | 'zh' | 'ar';

export const useLandingTranslations = () => {
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>('en');
  const [translations, setTranslations] = useState(landingTranslations.en);

  useEffect(() => {
    const detectedLanguage = detectInitialLanguage();
    setCurrentLanguage(detectedLanguage);
    setTranslations(landingTranslations[detectedLanguage]);
  }, []);

  const t = (key: string): string => {
    const keys = key.split('.');
    let result: any = translations;
    
    for (const k of keys) {
      result = result?.[k];
      if (result === undefined) {
        console.warn(`Translation key "${key}" not found for language "${currentLanguage}"`);
        return key;
      }
    }
    
    return result;
  };

  return {
    t,
    currentLanguage,
    setLanguage: (lang: SupportedLanguage) => {
      setCurrentLanguage(lang);
      setTranslations(landingTranslations[lang]);
    }
  };
};