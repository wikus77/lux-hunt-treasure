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
    scheme: 'M1SSION'
  },
  android: {
    allowMixedContent: true
  }
};

export default config;