
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
  // Add grecaptcha here as well to ensure it's available in all contexts
  grecaptcha?: {
    ready: (callback: () => void) => void;
    execute: (siteKey: string, options: { action: string }) => Promise<string>;
  };
}
