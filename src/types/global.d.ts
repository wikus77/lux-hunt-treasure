// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Global type definitions for M1SSION™

/// <reference types="node" />

declare global {
  interface Navigator {
    standalone?: boolean;
  }

  interface Performance {
    memory?: {
      usedJSHeapSize: number;
      jsHeapSizeLimit: number;
      totalJSHeapSize: number;
    };
  }

  interface Window {
    gc?: () => void;
    ENV?: Record<string, string>;
    getStripe?: () => any;
    __STRIPE_PK__?: string;
    DEBUG_PAGES?: boolean;
    OneSignal?: any;
    OneSignalInitialized?: boolean;
    plausible?: (event: string, options?: { props?: Record<string, any> }) => void;
  }

  // Browser-compatible timer types
  namespace NodeJS {
    interface Timeout extends number {}
    interface Timer extends number {}
  }

  // Environment variables for browser
  const process: {
    env: {
      NODE_ENV: string;
      [key: string]: string | undefined;
    };
  };
}

export {};