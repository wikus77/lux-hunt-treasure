
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
}
