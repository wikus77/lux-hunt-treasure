// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Global type definitions for M1SSION™

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
  }
}

export {};