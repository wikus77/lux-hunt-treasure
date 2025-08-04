
// ✅ DYNAMIC LOADING: Load Firebase config from Supabase edge function
let firebaseConfig: any = null;
let configPromise: Promise<any> | null = null;

// Default fallback config (will be replaced by dynamic config)
const fallbackConfig = {
  apiKey: "FALLBACK_INVALID_KEY",
  authDomain: "m1ssion-app.firebaseapp.com",
  projectId: "m1ssion-app",
  storageBucket: "m1ssion-app.appspot.com",
  messagingSenderId: "307707487376",
  appId: "1:307707487376:web:29a6c9f3a5ff3caf82cabc",
  vapidKey: "BBg_uAhm3xdtVJgJq8IQaK0nZPOqzQjp5iKg8mY-NQ1L4_RxY6PQkM7QpW8"
};

// Function to load Firebase config dynamically
const loadFirebaseConfig = async () => {
  if (firebaseConfig) {
    return firebaseConfig;
  }

  if (configPromise) {
    return configPromise;
  }

  configPromise = (async () => {
    try {
      console.log('🔧 DYNAMIC CONFIG: Loading Firebase config from edge function...');
      
      const response = await fetch('https://vkjrqirvdvjbemsfzxof.supabase.co/functions/v1/get-firebase-config', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZranJxaXJ2ZHZqYmVtc2Z6eG9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwMzQyMjYsImV4cCI6MjA2MDYxMDIyNn0.rb0F3dhKXwb_110--08Jsi4pt_jx-5IWwhi96eYMxBk'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to load config');
      }

      firebaseConfig = result.config;
      console.log('✅ DYNAMIC CONFIG: Firebase config loaded successfully');
      console.log('🔧 CONFIG PREVIEW:', {
        apiKey: firebaseConfig.apiKey?.substring(0, 10) + '...',
        authDomain: firebaseConfig.authDomain,
        projectId: firebaseConfig.projectId,
        vapidKey: firebaseConfig.vapidKey?.substring(0, 10) + '...'
      });

      return firebaseConfig;

    } catch (error) {
      console.error('❌ DYNAMIC CONFIG: Failed to load Firebase config:', error);
      console.log('🔄 DYNAMIC CONFIG: Using fallback config');
      firebaseConfig = fallbackConfig;
      return firebaseConfig;
    }
  })();

  return configPromise;
};

// Export function to get config (async)
export const getFirebaseConfig = loadFirebaseConfig;

// Export synchronous config for immediate use (will be fallback initially)
export { fallbackConfig as firebaseConfig };

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
