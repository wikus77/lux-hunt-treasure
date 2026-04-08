
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
  /** LIVE TARGET™ Phase 1.3C — set when map screen loads (liveTargetRuntimeGlobals). */
  __LIVE_TARGET_RUNTIME__?: Record<string, unknown>;

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
// Complete VITE_ environment variables declarations
interface ImportMetaEnv {
  readonly NODE_ENV: string;
  readonly VITE_VAPID_PUBLIC_KEY: string;
  readonly VITE_PWA_VERSION: string;

  // Supabase
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_SUPABASE_PROJECT_REF?: string;
  readonly VITE_SUPABASE_FUNCTIONS_BASE?: string;

  // Stripe
  readonly VITE_STRIPE_PUBLISHABLE_KEY?: string;

  // Google Maps
  readonly VITE_GOOGLE_MAPS_API_KEY?: string;

  // Norah AI
  readonly VITE_NORAH_BASE_URL?: string;

  // Debug / Flags
  readonly VITE_DIAG?: string;
  readonly VITE_BADGE_DEBUG?: string;
  readonly VITE_SHOW_RECONNECT_BADGE?: string;
  readonly VITE_SW_UPDATE_DEBUG?: string;
  readonly VITE_QA_MODE?: string;
  readonly VITE_BUNDLE_ANALYZE?: string;

  // Feature flags
  readonly VITE_VICTORY_ORCHESTRATION_V1?: string;
  readonly VITE_VICTORY_SYSTEM_V4_REAL_DAILY?: string;
  readonly VITE_VICTORY_ORCH_QA_HARNESS?: string;
  /** PE reward A/V sync tracing: `true` or localStorage `m1_pe_sync_debug=true` */
  readonly VITE_PE_SYNC_DEBUG?: string;
  readonly VITE_LIVING_MAP_USE_MOCK?: string;
  readonly VITE_ENABLE_LIVING_MAP?: string;
  readonly VITE_DEMO_WEATHER?: string;

  /** Live Target map marker: `1` / `0` (see featureFlags LIVE_TARGET_ENABLED). */
  readonly VITE_LIVE_TARGET?: string;
  /** Extra `[LiveTarget]` console diagnostics on production builds when `true`. */
  readonly VITE_LIVE_TARGET_LOG?: string;
  /**
   * Phase 1.3 forensic: huge high-contrast marker + screen-lock anchor + rich `[LiveTarget]` logs.
   * Remove after validation. Set `true` only for device screenshots.
   */
  readonly VITE_LIVE_TARGET_DEBUG?: string;

  // Sentry
  readonly VITE_SENTRY_DSN?: string;

  // Build
  readonly VITE_BUILD_ID?: string;
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
