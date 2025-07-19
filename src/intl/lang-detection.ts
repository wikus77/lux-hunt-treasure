type SupportedLanguage = 'en' | 'it' | 'fr' | 'es' | 'de' | 'pt' | 'zh' | 'ar';

const SUPPORTED_LANGUAGES: SupportedLanguage[] = ['en', 'it', 'fr', 'es', 'de', 'pt', 'zh', 'ar'];

/**
 * Rileva la lingua iniziale del dispositivo
 * @returns Lingua supportata o fallback su 'en'
 */
export function detectInitialLanguage(): SupportedLanguage {
  try {
    // Ottiene la lingua del browser/dispositivo
    const browserLang = navigator.language || (navigator as any).userLanguage;
    
    if (!browserLang) {
      console.warn('Unable to detect browser language, using English fallback');
      return 'en';
    }

    // Estrae il codice lingua primario (es: 'it-IT' → 'it')
    const primaryLang = browserLang.toLowerCase().split('-')[0];
    
    // Verifica se la lingua è supportata
    if (SUPPORTED_LANGUAGES.includes(primaryLang as SupportedLanguage)) {
      console.log(`Detected and using language: ${primaryLang}`);
      return primaryLang as SupportedLanguage;
    }

    // Fallback su inglese se non supportata
    console.log(`Language '${primaryLang}' not supported, using English fallback`);
    return 'en';

  } catch (error) {
    console.error('Error detecting language:', error);
    return 'en';
  }
}

/**
 * Verifica se una lingua è supportata
 * @param lang Codice lingua da verificare
 * @returns true se supportata, false altrimenti
 */
export function isSupportedLanguage(lang: string): lang is SupportedLanguage {
  return SUPPORTED_LANGUAGES.includes(lang as SupportedLanguage);
}

/**
 * Ottiene tutte le lingue supportate
 * @returns Array delle lingue supportate
 */
export function getSupportedLanguages(): SupportedLanguage[] {
  return [...SUPPORTED_LANGUAGES];
}

/**
 * Ottiene il nome della lingua in formato leggibile
 * @param lang Codice lingua
 * @returns Nome della lingua
 */
export function getLanguageDisplayName(lang: SupportedLanguage): string {
  const displayNames: Record<SupportedLanguage, string> = {
    en: 'English',
    it: 'Italiano',
    fr: 'Français',
    es: 'Español',
    de: 'Deutsch',
    pt: 'Português',
    zh: '中文',
    ar: 'العربية'
  };

  return displayNames[lang] || lang;
}