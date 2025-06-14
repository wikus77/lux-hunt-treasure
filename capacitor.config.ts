
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.m1ssion.app',
  appName: 'M1SSION',
  webDir: 'dist',
  bundledWebRuntime: false,
  server: {
    androidScheme: 'http',
    iosScheme: 'http'
    // Removed localhost URL - app will now load from bundled files
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
