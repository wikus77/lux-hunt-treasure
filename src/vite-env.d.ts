
/// <reference types="vite/client" />

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
