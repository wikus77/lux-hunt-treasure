
/// <reference types="vite/client" />

// Definizione dei tipi per le librerie esterne utilizzate nel progetto

// Globe per InteractiveGlobe
interface Window {
  Globe?: any;
  ApplePaySession?: any;
  turnstile?: any;
  initMap?: Function;
  initMapCallback?: Function;
  onloadTurnstileCallback?: Function;
}

// Google Payments
declare namespace google {
  namespace payments {
    namespace api {
      class PaymentsClient {
        constructor(options?: any);
        isReadyToPay(request: any): Promise<any>;
        createButton(options: any): HTMLElement;
        loadPaymentData(request: any): Promise<any>;
      }
    }
  }
}

// Aggiunta per TypeScript per i tipi relativi a stripe
declare module '@stripe/stripe-js';
