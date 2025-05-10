
/// <reference types="vite/client" />

// Dichiarazione per Cookiebot
interface Window {
  Cookiebot?: {
    show: () => void;
    hide: () => void;
    renew: () => void;
    withdraw: () => void;
    consent: {
      statistics: boolean;
      marketing: boolean;
      preferences: boolean;
      necessary: boolean;
    };
  };
  dataLayer?: any[];
  gtag?: (...args: any[]) => void;
  klaro?: any; // Aggiungiamo la dichiarazione per klaro
}

// Environment variables for EmailJS
interface ImportMetaEnv {
  readonly VITE_EMAILJS_SERVICE_ID: string;
  readonly VITE_EMAILJS_TEMPLATE_ID: string;
  readonly VITE_EMAILJS_USER_ID: string;
  readonly VITE_CONTACT_TO_EMAIL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
