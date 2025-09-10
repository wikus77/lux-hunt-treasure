// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Notification System Diagnostics

const isDev = import.meta.env.DEV;

export interface NotificationDiagnostics {
  unreadCount: number;
  badgeApiSupported: boolean;
  realtimeConnected: boolean;
  lastSyncAt: number;
  lastRealtimeUpdate?: {
    count: number;
    timestamp: number;
    payload?: any;
  };
  lastBadgeUpdate?: {
    count: number;
    timestamp: number;
  };
  errors?: Array<{
    message: string;
    timestamp: number;
    context?: string;
  }>;
}

// Centralized diagnostics state
let diagnostics: NotificationDiagnostics = {
  unreadCount: 0,
  badgeApiSupported: false,
  realtimeConnected: false,
  lastSyncAt: 0,
  errors: []
};

// Update diagnostics
export const updateDiagnostics = (updates: Partial<NotificationDiagnostics>) => {
  diagnostics = { ...diagnostics, ...updates };
  
  if (isDev && typeof window !== 'undefined') {
    window.__M1_NOTIFICATIONS_DIAG__ = diagnostics;
  }
};

// Log diagnostic error
export const logDiagnosticError = (message: string, context?: string) => {
  const error = {
    message,
    timestamp: Date.now(),
    context
  };
  
  diagnostics.errors = [...(diagnostics.errors || []), error].slice(-10); // Keep last 10 errors
  
  if (isDev) {
    console.error(`🔔 [NotificationDiag] ${message}`, context || '');
    window.__M1_NOTIFICATIONS_DIAG__ = diagnostics;
  }
};

// Get current diagnostics
export const getDiagnostics = (): NotificationDiagnostics => {
  return { ...diagnostics };
};

// Development debug utility
if (isDev && typeof window !== 'undefined') {
  window.__M1_BADGE__ = window.__M1_BADGE__ || {};
  window.__M1_BADGE__!.getDiagnostics = getDiagnostics;
  window.__M1_BADGE__!.state = () => diagnostics;
}