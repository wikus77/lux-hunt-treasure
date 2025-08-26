/* M1SSION™ AG-X0197 */
// Firebase Config Initialization for FCM Web Push
(function() {
  try {
    // Build Firebase config from environment or fallback
    const config = {
      apiKey: "AIzaSyAI4vsOdZoGq89tNEt5qKJJHkOJWlzULw8",
      authDomain: "m1ssion-app.firebaseapp.com", 
      projectId: "m1ssion-app",
      storageBucket: "m1ssion-app.appspot.com",
      messagingSenderId: "21417361168",
      appId: "1:21417361168:web:a4d5c3b1f2e1a9b8c7d9e0",
      vapidKey: "BHW33etXfpUnlLl5FwwsF1z7W48tPnlyJrF52zwEEEHiSIw0ED19ReIhFNm2DOiMTbJU_mPlFtqLGPboP6U-HHA"
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