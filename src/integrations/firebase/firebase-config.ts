
// ✅ UPDATED: Using Supabase secrets for Firebase configuration
export const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "AIzaSyC71GUysMmPq8m3ZkUHvBYTDCRUaAo3mio",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "m1ssion-app.firebaseapp.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "m1ssion-app",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "m1ssion-app.appspot.com",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "307707487376",
  appId: process.env.FIREBASE_APP_ID || "1:307707487376:web:29a6c9f3a5ff3caf82cabc",
  vapidKey: process.env.FIREBASE_VAPID_KEY || "BBg_uAhm3xdtVJgJq8IQaK0nZPOqzQjp5iKg8mY-NQ1L4_RxY6PQkH9CjEtN2LzVbG8fY5nOcWzRtX3YkM7QpW8"
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
