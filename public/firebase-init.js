/* M1SSION™ FCM config (non-ESM) */
(function () {
  try {
    const config = {
      apiKey: "AIzaSyDgY_2prLtVvme616VpfBgTyCJV1aW7mXs",
      authDomain: "m1ssion-app.firebaseapp.com",
      projectId: "m1ssion-app",
      storageBucket: "m1ssion-app.firebasestorage.app",
      messagingSenderId: "21417361168",
      appId: "1:21417361168:web:58841299455ee4bcc7af95",
      vapidKey: "BMrCxTSkgHgNAynMRoieqvKPeEPq1L-dk7-hY4jyBSEt6Rwk9O7XfrR5VmQmLMOBWTycyONDk1oKGxhxuhcunkI"
    };
    self.__FIREBASE_CFG__ = config;
    console.log('[M1SSION FCM] Config initialized for project:', config.projectId);
  } catch (e) {
    console.error('[M1SSION FCM] Config init error:', e);
    self.__FIREBASE_CFG__ = null;
  }
})();