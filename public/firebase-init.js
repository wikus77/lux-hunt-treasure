/* M1SSION™ - Firebase Config for Production */
// Firebase Config Initialization for FCM Web Push
(function() {
  try {
    // PRODUCTION Firebase config - CORRECT values for m1ssion.eu
    const config = {
      apiKey: "AIzaSyDgY_2prLtVvme616VpfBgTyCJV1aW7mXs",
      authDomain: "m1ssion-app.firebaseapp.com",
      projectId: "m1ssion-app",
      storageBucket: "m1ssion-app.firebasestorage.app",
      messagingSenderId: "21417361168",
      appId: "1:21417361168:web:58841299455ee4bcc7af95",
      vapidKey: "BJMuwT6jgq_wAQIccbQKoVOeUkc4dB64CNtSicE8zegs12sHZs0Jz0itIEv2USImnhstQtw219nYydIDKr91n2o"
    };

    // Validate required fields
    const required = ['apiKey', 'projectId', 'messagingSenderId', 'appId', 'vapidKey'];
    const missing = required.filter(key => !config[key] || config[key].includes('your_'));
    
    if (missing.length > 0) {
      console.warn('[M1SSION FCM] Missing Firebase config:', missing);
    }

    // Expose global config
    self.__FIREBASE_CFG__ = config;
    
    console.log('[M1SSION FCM] Config initialized for project:', config.projectId);
  } catch (error) {
    console.error('[M1SSION FCM] Config init error:', error);
    self.__FIREBASE_CFG__ = null;
  }
})();