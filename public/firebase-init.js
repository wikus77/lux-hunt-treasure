/* M1SSION™ - Firebase Config ESM Module */
// PRODUCTION Firebase configuration - VERIFIED for m1ssion.eu

// Export config as ESM module
const firebaseConfig = {
  apiKey: "AIzaSyDgY_2prLtVvme616VpfBgTyCJV1aW7mXs",
  authDomain: "m1ssion-app.firebaseapp.com",
  projectId: "m1ssion-app",
  storageBucket: "m1ssion-app.firebasestorage.app",
  messagingSenderId: "21417361168",
  appId: "1:21417361168:web:58841299455ee4bcc7af95",
  vapidKey: "BJMuwT6jgq_wAQIccbQKoVOeUkc4dB64CNtSicE8zegs12sHZs0Jz0itIEv2USImnhstQtw219nYydIDKr91n2o"
};

// Set global config for Service Worker compatibility
if (typeof self !== 'undefined') {
  self.__FIREBASE_CFG__ = firebaseConfig;
}

// Set window global for diagnostics
if (typeof window !== 'undefined') {
  window.__FIREBASE_CFG__ = firebaseConfig;
}

console.log('[M1SSION FCM] ✅ Config loaded for project:', firebaseConfig.projectId);

// ESM export
export default firebaseConfig;