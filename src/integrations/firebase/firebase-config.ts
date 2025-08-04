
// ✅ AGGRESSIVE DEBUG: Force logging environment variables immediately
const envVars = {
  VITE_FIREBASE_API_KEY: import.meta.env.VITE_FIREBASE_API_KEY,
  VITE_FIREBASE_AUTH_DOMAIN: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  VITE_FIREBASE_PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  VITE_FIREBASE_STORAGE_BUCKET: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  VITE_FIREBASE_MESSAGING_SENDER_ID: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  VITE_FIREBASE_APP_ID: import.meta.env.VITE_FIREBASE_APP_ID,
  VITE_FIREBASE_VAPID_KEY: import.meta.env.VITE_FIREBASE_VAPID_KEY
};

console.log('🔧 AGGRESSIVE DEBUG: Raw environment variables:', envVars);
console.log('🔧 AGGRESSIVE DEBUG: Environment check:', {
  FIREBASE_API_KEY: envVars.VITE_FIREBASE_API_KEY ? 'SET (' + envVars.VITE_FIREBASE_API_KEY.substring(0, 10) + '...)' : 'NOT SET',
  FIREBASE_AUTH_DOMAIN: envVars.VITE_FIREBASE_AUTH_DOMAIN ? 'SET' : 'NOT SET',
  FIREBASE_PROJECT_ID: envVars.VITE_FIREBASE_PROJECT_ID ? 'SET' : 'NOT SET',
  FIREBASE_STORAGE_BUCKET: envVars.VITE_FIREBASE_STORAGE_BUCKET ? 'SET' : 'NOT SET',
  FIREBASE_MESSAGING_SENDER_ID: envVars.VITE_FIREBASE_MESSAGING_SENDER_ID ? 'SET' : 'NOT SET',
  FIREBASE_APP_ID: envVars.VITE_FIREBASE_APP_ID ? 'SET' : 'NOT SET',
  FIREBASE_VAPID_KEY: envVars.VITE_FIREBASE_VAPID_KEY ? 'SET (' + envVars.VITE_FIREBASE_VAPID_KEY.substring(0, 10) + '...)' : 'NOT SET',
  NODE_ENV: import.meta.env.MODE
});

// ✅ FIXED: Using validated environment variables
export const firebaseConfig = {
  apiKey: envVars.VITE_FIREBASE_API_KEY || "FALLBACK_INVALID_KEY",
  authDomain: envVars.VITE_FIREBASE_AUTH_DOMAIN || "m1ssion-app.firebaseapp.com",
  projectId: envVars.VITE_FIREBASE_PROJECT_ID || "m1ssion-app",
  storageBucket: envVars.VITE_FIREBASE_STORAGE_BUCKET || "m1ssion-app.appspot.com",
  messagingSenderId: envVars.VITE_FIREBASE_MESSAGING_SENDER_ID || "307707487376",
  appId: envVars.VITE_FIREBASE_APP_ID || "1:307707487376:web:29a6c9f3a5ff3caf82cabc",
  vapidKey: envVars.VITE_FIREBASE_VAPID_KEY || "BBg_uAhm3xdtVJgJq8IQaK0nZPOqzQjp5iKg8mY-NQ1L4_RxY6PQkH9CjEtN2LzVbG8fY5nOcWzRtX3YkM7QpW8"
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
