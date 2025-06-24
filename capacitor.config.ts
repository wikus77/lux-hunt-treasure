
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'it.m1ssion.app',
  appName: 'M1SSION',
  webDir: 'dist',
  server: {
    url: 'http://localhost:3000',
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
