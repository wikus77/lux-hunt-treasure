
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.m1ssion.app',
  appName: 'M1SSION',
  webDir: 'dist',
  server: {
    url: 'http://192.168.178.126:3000',
    cleartext: true,
    androidScheme: 'https'
  },
  plugins: {
    DynamicIsland: {
      class: 'M1SSIONLiveActivity'
    }
  },
  ios: {
    scheme: 'M1SSION'
  }
};

export default config;
