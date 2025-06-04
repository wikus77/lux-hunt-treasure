
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'it.m1ssion.app',
  appName: 'M1SSION',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    // Allow capacitor://localhost for iOS WebView
    cleartext: true
  },
  plugins: {
    DynamicIsland: {
      class: 'M1SSIONLiveActivity'
    }
  },
  ios: {
    scheme: 'M1SSION',
    // Ensure proper loading of the React app
    contentInset: 'automatic'
  }
};

export default config;
