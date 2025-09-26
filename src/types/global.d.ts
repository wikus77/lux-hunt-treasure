// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Global type definitions for M1SSION™

/// <reference types="vite/client" />
/// <reference types="node" />

// Asset module declarations
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

// Browser timeout compatibility  
type BrowserTimeout = number;

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

  // Browser-compatible timer types for NodeJS.Timeout compatibility
  namespace NodeJS {
    interface Timeout extends number {}
    interface Timer extends number {}
  }

  // Environment variables for browser compatibility
  const process: {
    env: {
      NODE_ENV: string;
      [key: string]: string | undefined;
    };
  };
}

export {};