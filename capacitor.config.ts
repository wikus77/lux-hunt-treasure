
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'it.m1ssion.app',
  appName: 'M1SSION',
  webDir: 'dist',
  // Remove server config for production builds
  // server: {
  //   url: 'http://localhost:3000',
  //   cleartext: true,
  //   androidScheme: 'https'  
  // },
  plugins: {
    DynamicIsland: {
      class: 'M1SSIONLiveActivity'
    },
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#000000",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true
    }
  },
  ios: {
    scheme: 'M1SSION',
    contentInset: 'automatic',
    backgroundColor: '#000000',
    // iOS-specific optimizations
    preferredContentMode: 'mobile',
    allowsLinkPreview: false,
    handleApplicationURL: true
  },
  // Production build optimizations
  bundledWebRuntime: false
};

export default config;
