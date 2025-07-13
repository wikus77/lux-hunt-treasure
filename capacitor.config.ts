
// M1SSION™ - Capacitor Configuration for iOS/Android Build
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.2716f91b957c47ba91e06f572f3ce00d',
  appName: 'M1SSION',
  webDir: 'dist',
  bundledWebRuntime: false,
  
  // Enhanced server configuration for development
  server: {
    url: "https://2716f91b-957c-47ba-91e0-6f572f3ce00d.lovableproject.com?forceHideBadge=true",
    cleartext: true,
    hostname: "localhost"
  },

  // iOS specific configuration
  ios: {
    scheme: 'M1SSION',
    backgroundColor: '#000000',
    contentInset: 'automatic',
    allowsLinkPreview: false,
    scrollEnabled: true,
    // Enhanced safe area handling
    webContentsDebuggingEnabled: true,
    limitsNavigationsToAppBoundDomains: false
  },

  // Android specific configuration  
  android: {
    backgroundColor: '#000000',
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true,
    // Enhanced keyboard handling
    resizeOnFullScreen: true
  },

  // Enhanced plugins configuration
  plugins: {
    DynamicIsland: {
      class: 'M1SSIONLiveActivity'
    },
    
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      launchFadeOutDuration: 1000,
      backgroundColor: '#000000',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      androidSpinnerStyle: 'large',
      iosSpinnerStyle: 'small',
      spinnerColor: '#00e5ff',
      splashFullScreen: true,
      splashImmersive: true,
      layoutName: 'launch_screen',
      useDialog: false,
    },
    
    StatusBar: {
      style: 'dark',
      backgroundColor: '#000000',
      overlaysWebView: false,
    },

    Keyboard: {
      resize: 'body',
      style: 'dark',
      resizeOnFullScreen: true,
    },

    Device: {
      // No additional config needed
    },

    Haptics: {
      // No additional config needed  
    },

    App: {
      // No additional config needed
    },

    Network: {
      // No additional config needed
    },

    SafeArea: {
      // Custom plugin configuration
      enabled: true,
      customInsets: false
    }
  }
};

export default config;
