// Add type definition for CookieScriptConsent

interface Window {
  CookieScriptConsent?: {
    categories: {
      necessary: boolean;
      preferences: boolean;
      statistics: boolean;
      marketing: boolean;
    };
    show: () => void;
    hide: () => void;
    renew: () => void;
    withdraw: () => void;
  };
  checkCookieConsent?: (category: 'necessary' | 'preferences' | 'statistics' | 'marketing') => boolean;
}
