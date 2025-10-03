// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import base bundles (common). In futuro puoi splittare per namespace/pagine.
import en from '../locales/en/common.json';
import it from '../locales/it/common.json';
import fr from '../locales/fr/common.json';

// Normalizza lingua tipo "en-GB" -> "en"
function normalize(lang?: string) {
  const code = (lang || 'en').toLowerCase();
  if (code.startsWith('it')) return 'it';
  if (code.startsWith('fr')) return 'fr';
  return 'en';
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    supportedLngs: ['en', 'it', 'fr'],
    load: 'languageOnly',
    detection: {
      // Usa lingua device/OS via browser APIs
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'm1ssion_lang',
    },
    interpolation: { escapeValue: false },
    resources: {
      en: { translation: en },
      it: { translation: it },
      fr: { translation: fr },
    },
    parseMissingKeyHandler: (key) => {
      // fallback pulito in dev
      return key;
    },
    initImmediate: true,
  });

// Forza normalizzazione alla sola lingua principale (en/it/fr)
const current = normalize(i18n.language);
if (current !== i18n.language) {
  i18n.changeLanguage(current);
}

export default i18n;
