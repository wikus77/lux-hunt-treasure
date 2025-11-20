// @ts-nocheck
import { useState, useEffect, useCallback } from 'react';
import { detectInitialLanguage } from './lang-detection';
import { supabase } from '@/integrations/supabase/client';

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
    // © 2025 Joseph MULÉ – M1SSION™ — avoid bundler dynamic import issues
    const res = await fetch(`/locales/${lang}.json`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const translations = await res.json();
    translationCache[lang] = translations;
    return translations;
  } catch (error) {
    console.warn(`Failed to load translations for ${lang}, fallback to en`, error);
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
      
      let initialLang: SupportedLanguage;
      
      try {
        // 1. Prova a caricare la lingua dal profilo Supabase
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('language')
            .eq('id', user.id)
            .single();
          
          if (profile?.language && SUPPORTED_LANGUAGES.includes(profile.language as SupportedLanguage)) {
            initialLang = profile.language as SupportedLanguage;
            localStorage.setItem(STORAGE_KEY, initialLang);
          } else {
            // 2. Fallback su localStorage
            const savedLang = localStorage.getItem(STORAGE_KEY) as SupportedLanguage;
            if (savedLang && SUPPORTED_LANGUAGES.includes(savedLang)) {
              initialLang = savedLang;
            } else {
              // 3. Rileva la lingua del browser
              initialLang = detectInitialLanguage();
              localStorage.setItem(STORAGE_KEY, initialLang);
              
              // Salva la lingua rilevata nel profilo
              await supabase
                .from('profiles')
                .update({ language: initialLang })
                .eq('id', user.id);
            }
          }
        } else {
          // Utente non autenticato: usa localStorage o rileva dal browser
          const savedLang = localStorage.getItem(STORAGE_KEY) as SupportedLanguage;
          if (savedLang && SUPPORTED_LANGUAGES.includes(savedLang)) {
            initialLang = savedLang;
          } else {
            initialLang = detectInitialLanguage();
            localStorage.setItem(STORAGE_KEY, initialLang);
          }
        }
      } catch (error) {
        console.error('Error initializing language:', error);
        // Fallback in caso di errore
        const savedLang = localStorage.getItem(STORAGE_KEY) as SupportedLanguage;
        if (savedLang && SUPPORTED_LANGUAGES.includes(savedLang)) {
          initialLang = savedLang;
        } else {
          initialLang = detectInitialLanguage();
          localStorage.setItem(STORAGE_KEY, initialLang);
        }
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
    
    // Salva la lingua anche nel profilo Supabase se l'utente è autenticato
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('profiles')
          .update({ language: lang })
          .eq('id', user.id);
      }
    } catch (error) {
      console.warn('Could not save language to profile:', error);
    }
    
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