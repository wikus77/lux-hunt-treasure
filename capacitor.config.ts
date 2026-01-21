import { CapacitorConfig } from '@capacitor/core';

const config: CapacitorConfig = {
  appId: 'eu.m1ssion.app',
  appName: 'M1SSION',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    }
  },
  ios: {
    scheme: 'M1SSION',
    // M1SSION™ WRAP FIX: Prevent double safe-area application
    contentInset: 'never',
    scrollEnabled: true
  },
  android: {
    allowMixedContent: true
  }
};

export default config;