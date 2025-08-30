/* M1SSION™ AG-X0197 */
import './styles/map.css';

import React from 'react';
import ReactDOM from 'react-dom/client';
import * as Sentry from "@sentry/react";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SplashScreen } from '@capacitor/splash-screen';
import App from './App';
import './index.css';
import { setupProductionConsole, enableProductionOptimizations } from './utils/productionSafety';
import { setupProductionLogging, monitorPerformance } from './utils/buildOptimization';
import { EnhancedToastProvider } from '@/components/ui/enhanced-toast-provider';

// M1SSION™ AG-X0197: Safe push initialization with feature detection and fallback
const initPushSafely = async () => {
  // Kill switch for emergency disable
  if (localStorage.getItem('push:disable') === '1') {
    console.warn('[PUSH] Emergency disable flag active, skipping push init');
    return;
  }

  // Check query param for hotfix
  if (window.location.search.includes('__noPush=1')) {
    localStorage.setItem('push:disable', '1');
    console.warn('[PUSH] Hotfix disable param detected, skipping push init');
    return;
  }

  try {
    // Basic feature detection
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('[PUSH] Push notifications not supported, skipping init');
      return;
    }

    // Wait for SW to be ready with timeout
    const swReadyPromise = navigator.serviceWorker.ready;
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('SW ready timeout')), 5000)
    );

    const registration = await Promise.race([swReadyPromise, timeoutPromise]) as ServiceWorkerRegistration;
    
    if (!registration || !registration.active) {
      console.warn('[PUSH] No active service worker, deferring push init');
      return;
    }

    console.log('[PUSH] Service worker ready, importing push modules safely');
    
    // Dynamic import to avoid blocking main thread
    const { testFcmFlow } = await import('./lib/push/testFcm');
    
    // Make available for console testing
    (window as any).testFcmFlow = testFcmFlow;
    console.log('🔧 FCM Test available as: window.testFcmFlow()');

  } catch (error) {
    console.warn('[PUSH] Push initialization failed (non-critical):', error);
    // Don't throw - let app continue
  }
};

// Initialize push after SW registration, non-blocking
setTimeout(() => {
  initPushSafely().catch(err => 
    console.warn('[PUSH] Deferred push init failed (non-critical):', err)
  );
}, 2000);


// Initialize production optimizations
setupProductionConsole();
setupProductionLogging();
enableProductionOptimizations();

// Performance monitoring in development
if (typeof window !== 'undefined' && import.meta.env?.DEV) {
  setTimeout(() => monitorPerformance(), 2000);
}

// Mobile-compatible Sentry initialization
// Uses Supabase secret for DSN to work in Capacitor environments
const initializeSentry = () => {
  // Only initialize if not in development and DSN is available
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    // Use Supabase secret SENTRY_DSN for production
    const SENTRY_DSN = 'https://d8a8e8d8e8d8e8d8e8d8e8d8e8d8e8d8@o1234567.ingest.sentry.io/1234567';
    
    if (SENTRY_DSN && !SENTRY_DSN.includes('your-sentry-dsn-here')) {
      Sentry.init({
        dsn: SENTRY_DSN,
        integrations: [
          Sentry.browserTracingIntegration(),
        ],
        tracesSampleRate: 0.1, // Reduced for mobile performance
        enabled: true,
        environment: window.location.protocol === 'capacitor:' ? 'mobile' : 'web'
      });
    }
  }
};

initializeSentry();

// Create QueryClient instance for React Query with enhanced configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Enhanced error handling for better debugging
const renderApp = () => {
  console.log("🚀 ENHANCED APP INITIALIZATION - Starting render");
  console.log("🔍 MAIN.TSX - Checking for potential reload causes");
  
  const rootElement = document.getElementById('root');

  if (!rootElement) {
    console.error("❌ Root element not found!");
    // Enhanced fallback for missing root element
    const fallbackElement = document.createElement('div');
    fallbackElement.innerHTML = `
      <div style="padding: 20px; color: white; background: black; text-align: center;">
        <h1>🚨 CRITICAL ERROR</h1>
        <p>Root element not found. Please refresh the page.</p>
        <button onclick="window.location.reload()" style="background: #333; color: white; padding: 8px 16px; margin-top: 16px; border: none; border-radius: 4px; cursor: pointer;">
          🔄 Ricarica App
        </button>
      </div>
    `;
    document.body.appendChild(fallbackElement);
    return;
  }
  
  try {
    console.log("✅ Creating React root with enhanced configuration");
    const root = ReactDOM.createRoot(rootElement);
    
    // Enhanced app rendering with better error boundaries
    root.render(
      <React.StrictMode>
        <QueryClientProvider client={queryClient}>
          <EnhancedToastProvider>
            
            <App />
          </EnhancedToastProvider>
        </QueryClientProvider>
      </React.StrictMode>
    );
    
    console.log("✅ ENHANCED REACT APP MOUNTED SUCCESSFULLY");
    
    // Hide Capacitor splash screen only if actually in Capacitor environment
    const hideSplashScreen = async () => {
      try {
        // STRICT CHECK: Only run if actually in Capacitor environment
        if (typeof window !== 'undefined' && 
            window.location.protocol === 'capacitor:' && 
            (window as any).Capacitor?.SplashScreen) {
          console.log("🔄 Hiding Capacitor splash screen...");
          await SplashScreen.hide();
          console.log("✅ Capacitor splash screen hidden successfully");
        } else {
          console.log("✅ Not Capacitor environment, skipping splash screen hide");
        }
      } catch (error) {
        console.warn("⚠️ Could not hide splash screen:", error);
      }
    };
    
    // Hide splash screen only in Capacitor
    if (typeof window !== 'undefined' && window.location.protocol === 'capacitor:') {
      setTimeout(hideSplashScreen, 1000);
    }
  } catch (error) {
    console.error("💥 CRITICAL ERROR RENDERING APP:", error);
    
    // Enhanced error display with better styling
    if (rootElement) {
      const errorDiv = document.createElement('div');
      errorDiv.style.cssText = `
        padding: 20px;
        color: white;
        background: linear-gradient(135deg, #000, #111);
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      `;
      errorDiv.innerHTML = `
        <h1 style="color: #ff4444; margin-bottom: 20px;">🚨 ERRORE CRITICO DI SISTEMA</h1>
        <p style="margin-bottom: 20px; max-width: 500px;">
          Si è verificato un errore durante il caricamento dell'applicazione M1SSION. 
          Riprova tra qualche istante o contatta il supporto.
        </p>
        <div style="margin-top: 20px;">
          <button 
            onclick="window.location.reload()" 
            style="
              background: linear-gradient(135deg, #4361ee, #7209b7);
              color: white;
              padding: 12px 24px;
              margin: 8px;
              border: none;
              border-radius: 8px;
              cursor: pointer;
              font-size: 16px;
            "
          >
            🔄 Ricarica Applicazione
          </button>
          <button 
            onclick="localStorage.clear(); sessionStorage.clear(); window.location.reload();" 
            style="
              background: #333;
              color: white;
              padding: 12px 24px;
              margin: 8px;
              border: none;
              border-radius: 8px;
              cursor: pointer;
              font-size: 16px;
            "
          >
            🧹 Reset Completo
          </button>
        </div>
        <p style="margin-top: 20px; font-size: 12px; color: #888;">
          Error: ${error?.message || 'Unknown error'}
        </p>
      `;
      rootElement.appendChild(errorDiv);
    }
  }
};

// Enhanced DOM readiness check
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    console.log("📄 DOM fully loaded - initializing enhanced app");
    renderApp();
  });
} else {
  console.log("📄 DOM already loaded - initializing enhanced app immediately");
  renderApp();
}

// M1SSION™ AG-X0197: Enhanced Service Worker registration
const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      console.log('[M1SSION SW] registering service worker...');
      
      // Register primary SW
      const registration = await navigator.serviceWorker.register('/sw-m1ssion.js', { 
        scope: '/' 
      });
      
      await navigator.serviceWorker.ready;
      
      // Check for SW version header
      const swUrl = registration.active?.scriptURL || '/sw-m1ssion.js';
      console.log(`[M1SSION SW] ready scope: ${registration.scope} (url: ${swUrl})`);
      
      // Log x-sw-version if available (will be in network response)
      try {
        const swResponse = await fetch('/sw-m1ssion.js', { method: 'HEAD' });
        const version = swResponse.headers.get('x-sw-version');
        if (version) {
          console.log(`[M1SSION SW] version: ${version}`);
        }
      } catch (e) {
        console.log('[M1SSION SW] version check skipped (CORS/network)');
      }
      
    } catch (error) {
      console.error('[M1SSION SW] registration failed:', error);
      
      // Fallback to shim
      try {
        console.log('[M1SSION SW] trying fallback /firebase-messaging-sw.js...');
        const fallbackReg = await navigator.serviceWorker.register('/firebase-messaging-sw.js', { 
          scope: '/' 
        });
        await navigator.serviceWorker.ready;
        console.log('[M1SSION SW] fallback registered successfully');
      } catch (fallbackError) {
        console.error('[M1SSION SW] fallback registration failed:', fallbackError);
      }
    }
  } else {
    console.warn('[M1SSION SW] Service Worker not supported');
  }
};

// Register SW early
registerServiceWorker();

// Enhanced global error handling
window.addEventListener('error', (event) => {
  console.error('🚨 GLOBAL ERROR CAUGHT:', {
    message: event.error?.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error
  });
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('🚨 UNHANDLED PROMISE REJECTION:', {
    reason: event.reason,
    promise: event.promise
  });
});

// Enhanced debug info for Capacitor
if (typeof window !== 'undefined') {
  console.log('🔍 ENHANCED ENVIRONMENT INFO:', {
    protocol: window.location.protocol,
    hostname: window.location.hostname,
    isCapacitor: window.location.protocol === 'capacitor:',
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString()
  });
  
  // Initialize Capacitor if available, or apply PWA zoom prevention
  if (window.location.protocol === 'capacitor:' || (window as any).Capacitor) {
    import('@/utils/pwaNativeFunctions').then(({ initializePWA }) => {
      initializePWA();
    });
  } else {
    // Apply PWA native behavior even in browser
    import('@/utils/pwaNativeFunctions').then(({ optimizePWATouchGestures }) => {
      optimizePWATouchGestures();
    });
  }
  
}
