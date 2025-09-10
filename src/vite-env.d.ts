
/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

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
  
  // M1SSION Diagnostic interface for development
  __M1_DIAG__?: {
    lastBadgeUpdate?: { count: number; timestamp: number };
    badgeApiError?: { error: string; timestamp: number };
    lastRealtimeUpdate?: { count: number; timestamp: number; payload: any };
    realtimeStatus?: string;
    unreadNotifications?: {
      currentCount: number;
      isLoading: boolean;
      error: string | null;
      badgeApiSupported: boolean;
      userId?: string;
      refreshCount: () => void;
      getState: () => any;
    };
  };
}

// Mobile-compatible environment interface
// Removed VITE_ variables for Capacitor compatibility
interface ImportMetaEnv {
  readonly NODE_ENV: string;
  readonly VITE_VAPID_PUBLIC_KEY: string;
  readonly VITE_PWA_VERSION: string;
}

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

// Badge API support for notifications
interface Navigator {
  setAppBadge?: (contents?: number) => Promise<void>;
  clearAppBadge?: () => Promise<void>;
  standalone?: boolean;
}
