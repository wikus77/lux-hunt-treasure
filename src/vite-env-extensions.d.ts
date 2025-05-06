
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
}

