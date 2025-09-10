// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
declare global {
  interface Window {
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

  interface Navigator {
    setAppBadge?: (contents?: number) => Promise<void>;
    clearAppBadge?: () => Promise<void>;
    standalone?: boolean;
  }
}

export {};