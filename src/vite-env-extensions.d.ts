
/// <reference types="vite/client" />

// Per il globo 3D
interface Window {
  Globe: () => any;
  initMap?: () => void;
  initMapCallback?: () => void;
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
  // Add turnstile here to ensure it's available in all contexts
  turnstile?: {
    ready: (callback: () => void) => void;
    render: (container: string, options: any) => string;
    reset: (widgetId: string) => void;
  };
  // Type definitions for Cookie Script
  checkCookieConsent?: (category: 'necessary' | 'preferences' | 'statistics' | 'marketing') => boolean;
  CookieScriptConsent?: {
    show?: () => void;
    hide?: () => void;
    renew?: () => void;
    withdraw?: () => void;
    categories: {
      necessary: boolean;
      preferences: boolean;
      statistics: boolean;
      marketing: boolean;
    };
  };
}
