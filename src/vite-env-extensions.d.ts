
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
  
  // Add Globe.gl type definition
  Globe?: () => any;
  
  // Add type definitions for Apple Pay
  ApplePaySession?: {
    canMakePayments: () => boolean;
    new (version: number, request: any): any;
  };
  
  // Add type definitions for Google Pay
  google?: {
    payments?: {
      api?: {
        PaymentsClient?: any;
      };
    };
  };
  
  // Add Map-related callback functions
  initMap?: () => void;
  initMapCallback?: () => void;
  
  // Add Cloudflare Turnstile type definitions
  turnstile?: {
    ready: (callback: () => void) => void;
    render: (container: string, options: any) => string;
    reset: (widgetId: string) => void;
  };
  
  // Add Turnstile callback that's used in the script loading
  onloadTurnstileCallback?: () => void;
}
