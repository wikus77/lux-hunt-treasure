import { useState, useEffect, useCallback } from 'react';
import { detectInitialLanguage } from './lang-detection';

type SupportedLanguage = 'en' | 'it' | 'fr' | 'es' | 'de' | 'pt' | 'zh' | 'ar';

interface TranslationObject {
  [key: string]: string | TranslationObject;
}

interface UseI18nReturn {
  currentLang: SupportedLanguage;
  t: (key: string) => string;
  setLang: (lang: SupportedLanguage) => void;
  isLoading: boolean;
}

const STORAGE_KEY = 'localStorage.lang';
const SUPPORTED_LANGUAGES: SupportedLanguage[] = ['en', 'it', 'fr', 'es', 'de', 'pt', 'zh', 'ar'];

// Cache per le traduzioni caricate
const translationCache: Record<SupportedLanguage, TranslationObject | null> = {
  en: null,
  it: null,
  fr: null,
  es: null,
  de: null,
  pt: null,
  zh: null,
  ar: null
};

// Funzione per caricare le traduzioni
async function loadTranslations(lang: SupportedLanguage): Promise<TranslationObject> {
  if (translationCache[lang]) {
    return translationCache[lang]!;
  }

  try {
    const response = await import(`./${lang}.json`);
    const translations = response.default || response;
    translationCache[lang] = translations;
    return translations;
  } catch (error) {
    console.warn(`Failed to load translations for ${lang}, fallback to en`);
    if (lang !== 'en') {
      return loadTranslations('en');
    }
    return {};
  }
}

// Funzione per ottenere il valore nested da una chiave con dot notation
function getNestedValue(obj: TranslationObject, key: string): string {
  const keys = key.split('.');
  let current: any = obj;
  
  for (const k of keys) {
    if (current && typeof current === 'object' && k in current) {
      current = current[k];
    } else {
      return key; // Ritorna la chiave stessa se non trova la traduzione
    }
  }
  
  return typeof current === 'string' ? current : key;
}

export function useI18n(): UseI18nReturn {
  const [currentLang, setCurrentLangState] = useState<SupportedLanguage>('en');
  const [translations, setTranslations] = useState<TranslationObject>({});
  const [isLoading, setIsLoading] = useState(true);

  // Inizializzazione della lingua
  useEffect(() => {
    const initializeLanguage = async () => {
      setIsLoading(true);
      
      // Verifica se c'è una lingua salvata
      const savedLang = localStorage.getItem(STORAGE_KEY) as SupportedLanguage;
      let initialLang: SupportedLanguage;
      
      if (savedLang && SUPPORTED_LANGUAGES.includes(savedLang)) {
        initialLang = savedLang;
      } else {
        initialLang = detectInitialLanguage();
        localStorage.setItem(STORAGE_KEY, initialLang);
      }
      
      setCurrentLangState(initialLang);
      
      // Carica le traduzioni
      try {
        const loadedTranslations = await loadTranslations(initialLang);
        setTranslations(loadedTranslations);
      } catch (error) {
        console.error('Error loading translations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeLanguage();
  }, []);

  // Funzione per cambiare lingua
  const setLang = useCallback(async (lang: SupportedLanguage) => {
    if (!SUPPORTED_LANGUAGES.includes(lang)) {
      console.warn(`Language ${lang} not supported, keeping current language`);
      return;
    }

    setIsLoading(true);
    setCurrentLangState(lang);
    localStorage.setItem(STORAGE_KEY, lang);
    
    try {
      const loadedTranslations = await loadTranslations(lang);
      setTranslations(loadedTranslations);
    } catch (error) {
      console.error('Error loading translations:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Funzione di traduzione
  const t = useCallback((key: string): string => {
    if (!translations || Object.keys(translations).length === 0) {
      return key;
    }
    
    return getNestedValue(translations, key);
  }, [translations]);

  return {
    currentLang,
    t,
    setLang,
    isLoading
  };
}