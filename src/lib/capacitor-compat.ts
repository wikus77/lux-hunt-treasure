// © 2025 M1SSION™ - Capacitor PWA Compatibility Layer
// Provides minimal stubs for Capacitor APIs in PWA environment

export const Capacitor = { 
  isNativePlatform: () => false,
  getPlatform: () => 'web' as 'web' | 'ios' | 'android'
};

export const registerPlugin = () => ({});

export const WebPlugin = class {
  constructor() {}
};

export const Plugins = {};

export const SplashScreen = { 
  hide: async () => Promise.resolve(),
  show: async () => Promise.resolve()
};

export const PushNotifications = {
  requestPermissions: async () => ({ 
    receive: 'granted' as const 
  }),
  register: async () => Promise.resolve(),
  addListener: () => ({ 
    remove: () => {} 
  }),
  removeAllListeners: () => Promise.resolve(),
  removeAllDeliveredNotifications: () => Promise.resolve(),
  getDeliveredNotifications: () => Promise.resolve({ notifications: [] }),
  checkPermissions: async () => ({
    receive: 'granted' as const
  })
};

export const Clipboard = {
  write: async (options: { string: string }) => {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(options.string);
    }
  },
  read: async () => {
    if (navigator.clipboard) {
      const text = await navigator.clipboard.readText();
      return { value: text };
    }
    return { value: '' };
  }
};

export const Share = {
  share: async (options: { title?: string; text?: string; url?: string }) => {
    if (navigator.share) {
      await navigator.share(options);
    }
  }
};

export const Haptics = {
  impact: async () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
  },
  vibrate: async () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(100);
    }
  }
};