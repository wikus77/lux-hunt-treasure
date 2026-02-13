// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

// NOTE IMPORTANTI (PALLETTI):
// - Non installare librerie nuove: usa i18next/react-i18next già presenti oppure fallback interno.
// - Non modificare altri file dell'app. Questo modulo è drop-in e innocuo.
// - Nessuna regressione: se le traduzioni mancano, fai fallback all'inglese.
// - Rilevazione lingua: usa lingua del device/OS (navigator.language), con override opzionale salvato in localStorage.
// - Le uniche lingue supportate qui sono: en, it, fr. Qualsiasi altra → fallback 'en'.
// - Non toccare network, routing, o logiche di business. Solo i18n bootstrap.

// i18next and react-i18next are guaranteed to be installed (see package.json)
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from '../locales/en/common.json';
import it from '../locales/it/common.json';
import fr from '../locales/fr/common.json';

// ---- Costanti & Utils
const STORAGE_KEY = 'm1_locale';
const STORAGE_KEY_MODE = 'm1_locale_mode'; // 'auto' | 'manual'
const SUPPORTED = ['en', 'it', 'fr'] as const;
type SupportedLang = (typeof SUPPORTED)[number];
type LocaleMode = 'auto' | 'manual';

function normalize(lang: string | undefined | null): SupportedLang {
  if (!lang || typeof lang !== 'string') return 'en';
  const lower = lang.toLowerCase();
  // match en, it, fr anche se formati en-GB, it-IT, fr-FR
  for (const code of SUPPORTED) {
    if (lower === code || lower.startsWith(code + '-')) return code;
  }
  return 'en';
}

export function getDeviceLocale(): SupportedLang {
  const nav = (globalThis as any)?.navigator;
  const byList = Array.isArray(nav?.languages) && nav.languages.length > 0 ? nav.languages[0] : null;
  const raw = byList || nav?.language || nav?.userLanguage || 'en';
  return normalize(raw);
}

export function getSavedLocale(): SupportedLang | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? normalize(raw) : null;
  } catch {
    return null;
  }
}

// 🔧 FIX iOS: Legge il mode (auto/manual) - default 'auto' se assente
function getLocaleMode(): LocaleMode {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MODE);
    return raw === 'manual' ? 'manual' : 'auto';
  } catch {
    return 'auto';
  }
}

// 🔧 FIX iOS: Setta override MANUALE (chiamato da LanguageSettings)
export function setLocale(lng: SupportedLang): void {
  try {
    localStorage.setItem(STORAGE_KEY, lng);
    localStorage.setItem(STORAGE_KEY_MODE, 'manual'); // Marca come override manuale
  } catch {
    /* ignore */
  }
  if (i18next?.changeLanguage) {
    i18next.changeLanguage(lng);
  }
}

// 🔧 FIX iOS: Torna a seguire OS (reset override manuale)
export function clearLocaleOverride(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.setItem(STORAGE_KEY_MODE, 'auto');
  } catch {
    /* ignore */
  }
  // Aggiorna i18next con lingua OS
  const osLang = getDeviceLocale();
  if (i18next?.changeLanguage) {
    i18next.changeLanguage(osLang);
  }
}

// 🔧 FIX iOS: OS-driven di default, override solo se mode === 'manual'
export function getDefaultLocale(): SupportedLang {
  const mode = getLocaleMode();
  if (mode === 'manual') {
    const saved = getSavedLocale();
    if (saved) return saved;
  }
  // AUTO: segue sempre OS (ignora eventuali m1_locale legacy senza mode)
  return getDeviceLocale();
}

// ---- Risorse
const resources = {
  en: { common: en },
  it: { common: it },
  fr: { common: fr },
};

// ---- Bootstrap i18n (reale se i18next presente, altrimenti no-op)
let _initialized = false;

export async function initI18n(): Promise<void> {
  if (_initialized) return;

  const lng = getDefaultLocale();

  if (i18next && initReactI18next) {
    // i18next reale
    await i18next
      .use(initReactI18next)
      .init({
        resources,
        lng,
        fallbackLng: 'en',
        supportedLngs: SUPPORTED as unknown as string[],
        ns: ['common'],
        defaultNS: 'common',
        interpolation: { escapeValue: false },
        // Non tocchiamo detection plugin per non aggiungere dipendenze.
        // Rilevazione custom con getDefaultLocale().
      })
      .catch(() => {
        // Anche in caso di errore, evitare crash.
      });
  }

  _initialized = true;
}

// Helper di traduzione sicuro (funziona anche in no-op)
export function t(key: string, vars?: Record<string, unknown>): string {
  if (i18next?.t) {
    return i18next.t(key, vars);
  }
  // fallback semplice: ritorna la chiave se manca i18next
  return key;
}

// Accessor lingua corrente (robusto)
export function getLocale(): SupportedLang {
  if (i18next?.language) return normalize(i18next.language);
  return getDefaultLocale();
}

// Hook React opzionale (no crash se react-i18next manca)
export function useI18nSafe() {
  // Evitiamo importare hook reali per non vincolare dipendenze qui.
  return {
    t,
    locale: getLocale(),
    setLocale,
  };
}

// Auto-inizializzazione all'import
initI18n().catch(console.error);

export default i18next;
