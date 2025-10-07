
/// <reference types="vite/client" />
/// <reference types="node" />

// Asset type declarations
declare module "*.svg" {
  const src: string;
  export default src;
}

declare module "*.png" {
  const src: string;
  export default src;
}

declare module "*.jpg" {
  const src: string;
  export default src;
}

declare module "*.jpeg" {
  const src: string;
  export default src;
}

declare module "*.mp4" {
  const src: string;
  export default src;
}

declare module "*.webp" {
  const src: string;
  export default src;
}

// Browser timer compatibility for NodeJS.Timeout
declare global {
  namespace NodeJS {
    interface Timeout extends number {}
  }
}

// Process environment for browser compatibility
declare const process: {
  env: {
    NODE_ENV: string;
    [key: string]: string | undefined;
  };
};

// Dichiarazione per Cookie Script
interface Window {
  CookieScriptConsent?: {
    show: () => void;
    hide: () => void;
    renew: () => void;
    withdraw: () => void;
    categories: {
      necessary: boolean;
      preferences: boolean;
      statistics: boolean;
      marketing: boolean;
    };
  };
  dataLayer?: any[];
  gtag?: (...args: any[]) => void;
  
  // Add checkCookieConsent global function
  checkCookieConsent?: (category: 'necessary' | 'preferences' | 'statistics' | 'marketing') => boolean;
  
  // Add grecaptcha global object
  grecaptcha?: {
    ready: (callback: () => void) => void;
    execute: (siteKey: string, options: { action: string }) => Promise<string>;
  };
}

// Mobile-compatible environment interface
// Removed VITE_ variables for Capacitor compatibility
interface ImportMetaEnv {
  readonly NODE_ENV: string;
  readonly VITE_VAPID_PUBLIC_KEY: string;
  readonly VITE_PWA_VERSION: string;
}

// Process environment for browser compatibility
declare const process: {
  env: {
    NODE_ENV: string;
    [key: string]: string | undefined;
  };
};

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// PWA version constant
declare const __PWA_VERSION__: string;

// Mailjet response types
interface MailjetResponse {
  Messages: MailjetMessage[];
  success: boolean;
  error?: string;
}

interface MailjetMessage {
  Status: string;
  To: MailjetRecipient[];
  Cc?: MailjetRecipient[];
  Bcc?: MailjetRecipient[];
}

interface MailjetRecipient {
  Email: string;
  MessageUUID?: string;
  MessageID?: number;
  MessageHref?: string;
}

// Public VAPID helper module declaration
declare module '/vapid-helper.js' {
  export function loadVAPIDPublicKey(): Promise<string>;
  export function urlBase64ToUint8Array(base64url: string): Uint8Array;
}
