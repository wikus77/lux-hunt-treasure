
// ✅ DEBUG: Check if env variables are loading correctly
console.log('🔧 DEBUG: Environment variables check:', {
  FIREBASE_API_KEY: import.meta.env.VITE_FIREBASE_API_KEY ? 'SET' : 'NOT SET',
  FIREBASE_AUTH_DOMAIN: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ? 'SET' : 'NOT SET',
  FIREBASE_PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID ? 'SET' : 'NOT SET',
  NODE_ENV: import.meta.env.MODE
});

// ✅ FIXED: Using import.meta.env for Lovable environment variables
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "FALLBACK_INVALID_KEY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "m1ssion-app.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "m1ssion-app",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "m1ssion-app.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "307707487376",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:307707487376:web:29a6c9f3a5ff3caf82cabc",
  vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY || "BBg_uAhm3xdtVJgJq8IQaK0nZPOqzQjp5iKg8mY-NQ1L4_RxY6PQkH9CjEtN2LzVbG8fY5nOcWzRtX3YkM7QpW8"
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
