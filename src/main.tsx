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
// import { EnhancedToastProvider } from '@/components/ui/enhanced-toast-provider'; // Rimosso per evitare toast duplicati

// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
// Import and apply kill switch utilities
import { isPushDisabled, checkHotfixDisable } from './utils/pushKillSwitch';

// Safe push initialization with robust error handling
const initPushSafely = async () => {
  try {
    // Kill switch checks (URL param and localStorage)
    if (checkHotfixDisable() || isPushDisabled()) {
      console.warn('[PUSH] Kill switch active, skipping push initialization');
      return;
    }

    // Basic feature detection
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('[PUSH] Push notifications not supported');
      return;
    }

    // Wait for SW to be ready with extended timeout and fallback
    let registration;
    try {
      const swReadyPromise = navigator.serviceWorker.ready;
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('SW ready timeout')), 8000)
      );

      registration = await Promise.race([swReadyPromise, timeoutPromise]);
      
      if (!registration?.active) {
        console.warn('[PUSH] No active service worker found, deferring');
        return;
      }
    } catch (swError) {
      console.warn('[PUSH] Service worker not ready:', swError);
      return;
    }

    console.log('[PUSH] Service worker ready, loading push modules safely');
    
    // Dynamic import with additional safety
    try {
      const pushModule = await import('./lib/push/testFcm');
      if (pushModule?.testFcmFlow) {
        (window as any).testFcmFlow = pushModule.testFcmFlow;
        console.log('🔧 FCM Test available: window.testFcmFlow()');
      }
    } catch (importError) {
      console.warn('[PUSH] Push module import failed (non-critical):', importError);
    }

  } catch (error) {
    console.warn('[PUSH] Push initialization failed (non-critical):', error);
    // Never throw - let app continue
  }
};

// Defer push initialization to avoid blocking app boot
setTimeout(() => {
  initPushSafely().catch(err => 
    console.warn('[PUSH] Deferred push init error (non-critical):', err)
  );
}, 3000);


// Initialize production optimizations
setupProductionConsole();
setupProductionLogging();
enableProductionOptimizations();

// Initialize performance and accessibility enhancements
if (typeof window !== 'undefined') {
  import('./utils/performanceOptimizer').then(({ initPerformanceOptimizations }) => {
    initPerformanceOptimizations();
  });
  
  import('./utils/accessibilityEnhancer').then(({ initAccessibilityEnhancements }) => {
    initAccessibilityEnhancements();
  });
}

// Performance monitoring in development
if (typeof window !== 'undefined' && import.meta.env?.DEV) {
  setTimeout(() => monitorPerformance(), 2000);
}

// Secure Sentry initialization with environment variables
const initializeSentry = () => {
  // Only initialize if not in development and DSN is available
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    // Use environment variable for DSN - no hardcoded values
    const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;
    
    if (SENTRY_DSN && !SENTRY_DSN.includes('placeholder')) {
      Sentry.init({
        dsn: SENTRY_DSN,
        integrations: [
          Sentry.browserTracingIntegration(),
        ],
        tracesSampleRate: 0.1, // Reduced for mobile performance
        enabled: true,
        environment: window.location.protocol === 'capacitor:' ? 'mobile' : 'web'
      });
    } else if (import.meta.env.PROD) {
      console.warn('⚠️ Sentry DSN not configured in production');
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
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
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

// SW registration is now handled by swControl utils only - no duplicate registration

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
