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
    appId: "50cb75f7-f065-4626-9a63-ce5692fa7e70",
    environment: 'production',
    allowedOrigins: ['https://m1ssion.eu', 'https://www.m1ssion.eu']
  },
  
  // Development/Preview (per testing su Lovable)
  development: {
    appId: "50cb75f7-f065-4626-9a63-ce5692fa7e70", // Stesso ID per ora
    environment: 'development',
    allowedOrigins: ['https://*.lovable.app', 'http://localhost:3000', 'http://localhost:5173']
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
  
  return {
    appId: config.appId,
    allowLocalhostAsSecureOrigin: true,
    serviceWorkerPath: '/OneSignalSDKWorker.js',
    serviceWorkerUpdaterPath: '/OneSignalSDKUpdaterWorker.js',
    safari_web_id: `web.onesignal.auto.${config.appId}`,
    // Per testing su domini non autorizzati
    autoResubscribe: true,
    persistNotification: true
  };
};