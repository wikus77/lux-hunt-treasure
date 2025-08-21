// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
// OneSignal Configuration Manager

export interface OneSignalConfig {
  appId: string;
  environment: 'production' | 'development' | 'preview';
  allowedOrigins: string[];
}

// Configuration per environment
const ONE_SIGNAL_CONFIGS: Record<string, OneSignalConfig> = {
  // Production (m1ssion.eu)
  production: {
    appId: "5e0cb75f-f065-4626-9a63-ce5692f7a7e0", // FIXED: Correct App ID
    environment: 'production',
    allowedOrigins: ['https://m1ssion.eu', 'https://www.m1ssion.eu']
  },
  
  // Development/Preview (BYPASS MODE per testing)
  development: {
    appId: "5e0cb75f-f065-4626-9a63-ce5692f7a7e0", // FIXED: Correct App ID
    environment: 'development',
    allowedOrigins: [
      'https://*.lovable.app', 
      'http://localhost:3000', 
      'http://localhost:5173',
      'http://localhost:8080', // ADDED: Missing localhost:8080
      'https://localhost:8080'
    ]
  }
};

export const getOneSignalConfig = (): OneSignalConfig => {
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  
  console.log('🔍 OneSignal Config: Detecting environment', { hostname, protocol });
  
  // Production check
  if (hostname === 'm1ssion.eu' || hostname === 'www.m1ssion.eu') {
    console.log('✅ OneSignal Config: Using PRODUCTION config');
    return ONE_SIGNAL_CONFIGS.production;
  }
  
  // Development/Preview (Lovable, localhost, etc.)
  console.log('🔧 OneSignal Config: Using DEVELOPMENT config');
  return ONE_SIGNAL_CONFIGS.development;
};

export const getOneSignalInitConfig = () => {
  const config = getOneSignalConfig();
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  
  console.log('🛰️ OneSignal Init Config:', { 
    appId: config.appId, 
    hostname: window.location.hostname,
    isLocalhost 
  });
  
  return {
    appId: config.appId,
    allowLocalhostAsSecureOrigin: true,
    // iOS Safari specific settings
    requiresUserPrivacyConsent: false,
    autoRegister: false, // Manual control for iOS
    serviceWorkerPath: '/OneSignalSDKWorker.js',
    serviceWorkerUpdaterPath: '/OneSignalSDKUpdaterWorker.js',
    serviceWorkerParam: { scope: '/' },
    // Safari Web Push specific
    safari_web_id: undefined, // Let OneSignal auto-detect
    // Enhanced localhost support
    ...(isLocalhost && {
      restrictedOriginValidation: false,
      httpPermissionRequest: {
        enable: true,
        useModal: true
      }
    }),
    autoResubscribe: true,
    persistNotification: true
  };
};