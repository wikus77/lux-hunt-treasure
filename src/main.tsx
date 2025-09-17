/* M1SSION™ AG-X0197 */
import './styles/map.css';

import React from 'react';
import ReactDOM from 'react-dom/client';
import * as Sentry from "@sentry/react";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SplashScreen } from '@capacitor/splash-screen';
import App from './App';
import './index.css';
import './styles/toast-animations.css';
import { setupProductionConsole, enableProductionOptimizations } from './utils/productionSafety';
import { setupProductionLogging, monitorPerformance } from './utils/buildOptimization';
import { diagnostics } from './metrics/interestSignals';
import { initBadgeDiagnostics } from './utils/badgeDiagnostics';
import { initDiagnostics } from './utils/diagnostics';
// import { initPWABadgeDiagnostics, createBadgeTestHelpers } from './utils/pwaBadgeAudit'; // Dynamic import instead
// import { EnhancedToastProvider } from '@/components/ui/enhanced-toast-provider'; // Rimosso per evitare toast duplicati

// Ensure global Stripe fallback is available across the app (no side effects)
import './lib/stripeFallback';

// Initialize diagnostics early (development only)
if (import.meta.env.DEV) {
  console.log('🔍 M1SSION™ Diagnostics ready');
}

// Initialize badge diagnostics
initBadgeDiagnostics();

// PHASE 1 AUDIT: Initialize PWA badge environment detection safely
const initPWABadgeDiagnosticsSafely = async () => {
  if (typeof window !== 'undefined') {
    try {
      // Dynamic imports to ensure proper loading
      const [
        { initPWABadgeDiagnostics, createBadgeTestHelpers },
        { initializeGlobalDebugHelpers }
      ] = await Promise.all([
        import('./utils/pwaBadgeAudit'),
        import('./utils/debugHelpers')
      ]);
      
      initPWABadgeDiagnostics();
      createBadgeTestHelpers();
      initializeGlobalDebugHelpers();
      
      console.log('✅ PWA Badge diagnostics initialized');
    } catch (err) {
      console.warn('PWA Badge diagnostics initialization failed:', err);
    }
  }
};

// Call after DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPWABadgeDiagnosticsSafely);
} else {
  initPWABadgeDiagnosticsSafely();
}

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

  // Initialize production monitoring
  if (import.meta.env.PROD) {
    import('./utils/productionMonitoring').then(({ monitoring }) => {
      monitoring.trackFeature('app_initialization');
    });
  }
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

// Global error overlay for production debugging (prevents white screen)
const initErrorOverlay = () => {
  if (new URLSearchParams(window.location.search).get('noerr') === '1') return;
  
  const showErrorOverlay = (error: any, context: string) => {
    const overlay = document.createElement('div');
    overlay.id = 'error-overlay';
    overlay.style.cssText = `
      position: fixed; top: 0; left: 0; right: 0; bottom: 0; 
      background: rgba(0,0,0,0.95); color: white; z-index: 999999;
      font-family: 'Courier New', monospace; padding: 20px;
      overflow: auto; font-size: 14px;
    `;
    overlay.innerHTML = `
      <div style="max-width: 800px; margin: 0 auto;">
        <h2 style="color: #ff4444; margin-bottom: 20px;">🚨 Runtime Error (${context})</h2>
        <pre style="background: #222; padding: 15px; border-radius: 5px; white-space: pre-wrap;">
${error?.stack || error?.message || String(error)}
        </pre>
        <div style="margin-top: 20px;">
          <button onclick="this.parentElement.parentElement.parentElement.remove()" 
                  style="background: #333; color: white; border: none; padding: 10px 20px; margin-right: 10px; border-radius: 4px; cursor: pointer;">
            Chiudi
          </button>
          <button onclick="window.location.reload()" 
                  style="background: #4361ee; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer;">
            Ricarica
          </button>
          <button onclick="window.location.href='/?noerr=1'" 
                  style="background: #666; color: white; border: none; padding: 10px 20px; margin-left: 10px; border-radius: 4px; cursor: pointer;">
            Disabilita overlay
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
  };

  // Global error handlers
  window.addEventListener('error', (event) => {
    showErrorOverlay(event.error, 'JavaScript Error');
  });

  window.addEventListener('unhandledrejection', (event) => {
    showErrorOverlay(event.reason, 'Promise Rejection');
  });
};

// Enhanced error handling for better debugging
const renderApp = () => {
  console.log("🚀 ENHANCED APP INITIALIZATION - Starting render");
  console.log("🔍 MAIN.TSX - Checking for potential reload causes");
  
  // Initialize error overlay early
  initErrorOverlay();
  
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
    
    // Enhanced app rendering with PWA Loading Guard to prevent black screen
    root.render(
      <QueryClientProvider client={queryClient}>
        <React.Suspense fallback={
          <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground font-orbitron">Caricamento M1SSION™...</p>
            </div>
          </div>
        }>
          <App />
        </React.Suspense>
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

// Enhanced DOM readiness check with SW Controller Guard
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    console.log("📄 DOM fully loaded - initializing enhanced app");
    initAppWithSWGuard();
  });
} else {
  console.log("📄 DOM already loaded - initializing enhanced app immediately");
  initAppWithSWGuard();
}

// SW Controller enforcement for Pages.dev (prevent other SWs from taking control)
const enforceAppSWController = async () => {
  if (!('serviceWorker' in navigator)) return;
  
  try {
    const controller = navigator.serviceWorker.controller;
    const isOnPagesdev = window.location.hostname.includes('pages.dev');
    
    // Only enforce on Pages.dev if controller is not our main SW
    if (isOnPagesdev && (!controller || !controller.scriptURL.endsWith('/sw.js'))) {
      console.log('[SW-ENFORCE] 🔄 Re-registering main SW on Pages.dev...');
      
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none'
      });
      
      await registration.update();
      
      // Show toast and reload on controller change
      const showUpdateToast = () => {
        const toast = document.createElement('div');
        toast.style.cssText = `
          position: fixed; top: 20px; right: 20px; z-index: 999999;
          background: #4361ee; color: white; padding: 12px 20px;
          border-radius: 8px; font-family: sans-serif; font-size: 14px;
        `;
        toast.textContent = 'Aggiornamento app...';
        document.body.appendChild(toast);
        
        setTimeout(() => window.location.reload(), 1000);
      };
      
      navigator.serviceWorker.addEventListener('controllerchange', showUpdateToast, { once: true });
    }
  } catch (error) {
    console.warn('[SW-ENFORCE] Failed (non-critical):', error);
  }
};

// Initialize app with Service Worker controller protection
async function initAppWithSWGuard() {
  try {
    // Step 1: Enforce main SW controller on Pages.dev
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      enforceAppSWController();
      
      // Step 2: Ensure our app SW is the controller (existing guard)
      import('./utils/swControllerGuard').then(async ({ ensureAppSWController, logActiveSWs }) => {
        try {
          console.log('[MAIN] 🔄 Activating SW Controller Guard...');
          const success = await ensureAppSWController();
          await logActiveSWs();
          
          // Dev logging for BUILD_ID verification
          if (import.meta.env.DEV) {
            const buildId = import.meta.env.VITE_BUILD_ID;
            const controller = navigator.serviceWorker.controller;
            console.log('[MAIN] 🔍 BUILD_ID:', buildId);
            console.log('[MAIN] 🔍 Controller SW:', controller?.scriptURL || 'none');
          }
          
          if (success) {
            console.log('[MAIN] ✅ SW Controller Guard activated successfully');
          } else {
            console.warn('[MAIN] ⚠️ SW Controller Guard failed but app continues');
          }
        } catch (error) {
          console.warn('[MAIN] SW guard failed (non-critical):', error);
        }
      });
    }
    
    // Step 2: Always render app (never block on SW operations)
    renderApp();
    
  } catch (error) {
    console.error('[MAIN] Init with SW guard failed:', error);
    // Fallback: render app anyway
    renderApp();
  }
}

// Initialize silent auto-update (no UI banners, just one refresh per BUILD_ID)
if (typeof window !== 'undefined') {
  // Delay to ensure app is fully rendered before SW operations
  setTimeout(() => {
    import('./utils/silentAutoUpdate').then(({ initSilentAutoUpdate }) => {
      initSilentAutoUpdate({
        debug: import.meta.env.VITE_SW_UPDATE_DEBUG === '1' || import.meta.env.DEV
      }).catch(err => {
        console.warn('[MAIN] Silent auto-update init failed (non-critical):', err);
      });
    });
  }, 2500); // Longer delay for complete stability

  // Initialize interest signals tracking (post first paint, zero UI impact)
  const initInterestSignals = () => {
    try {
      const isDebugMode = new URLSearchParams(window.location.search).get('M1_DIAG') === '1';
      
      if (isDebugMode) {
        console.log('📊 M1SSION Interest Signals - Debug mode active');
        // Import metrics directly for immediate diagnostics
        import('./metrics/interestSignals').then(({ diagnostics }) => {
          (window as any).__M1_SIG__ = diagnostics;
          console.log('📊 M1_SIG diagnostics available:', Object.keys(diagnostics));
        });
      }
      
      // Import and initialize auto interest signals
      import('./hooks/useAutoInterestSignals').then(({ initAutoInterestSignals }) => {
        initAutoInterestSignals();
        if (isDebugMode) {
          console.log('📊 useAutoInterestSignals initialized');
        }
      }).catch(err => {
        console.warn('[MAIN] Interest signals init failed (non-critical):', err);
      });
    } catch (error) {
      console.warn('[MAIN] Interest signals setup failed (non-critical):', error);
    }
  };

  setTimeout(initInterestSignals, 3000); // After app is fully rendered

  // Initialize M1SSION preferences diagnostics (after app fully loaded)
  setTimeout(() => {
    initDiagnostics();
  }, 100);
}

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
