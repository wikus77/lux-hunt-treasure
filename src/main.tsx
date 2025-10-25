/* © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™ */
/* M1SSION™ AG-X0197 */
import './styles/map.css';
import './styles/effects/ritual-distortion.css';

import React from 'react';
import ReactDOM from 'react-dom/client';
import * as Sentry from "@sentry/react";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import './index.css';
import './styles/toast-animations.css';
import './i18n/i18n'; // <-- importa PRIMA di render

import { I18nextProvider } from 'react-i18next';
import i18n from './i18n/i18n';

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Production safety: Hide debug content in production builds
if (import.meta.env.PROD) {
  import('./styles/prod-hide-debug.css');
  // Ensure no shim dump is visible in production
  (window as any).__M1_NO_SHIM_DUMP__ = true;
}
import { setupProductionConsole, enableProductionOptimizations } from './utils/productionSafety';
import { setupProductionLogging, monitorPerformance } from './utils/buildOptimization';
import { diagnostics } from './metrics/interestSignals';
import { initBadgeDiagnostics } from './utils/badgeDiagnostics';
import { initDiagnostics } from './utils/diagnostics';
// import { initPWABadgeDiagnostics, createBadgeTestHelpers } from './utils/pwaBadgeAudit'; // Dynamic import instead
// import { EnhancedToastProvider } from '@/components/ui/enhanced-toast-provider'; // Rimosso per evitare toast duplicati

// Ensure global Stripe fallback is available across the app (no side effects)
import './lib/stripeFallback';

// Expose KB populate helper globally (hard guard against tree-shaking)
import { populateKnowledgeBase } from '@/utils/populateKnowledgeBase';
if (typeof window !== 'undefined') {
  (window as any).__populateKB__ = populateKnowledgeBase;
  console.log('✅ [GLOBAL] window.__populateKB__ disponibile (main.tsx)');
}


// DEV-only: Verify Supabase singleton at boot
if (import.meta.env.DEV) {
  setTimeout(() => {
    import('@/lib/supabase/diag').then(({ getSupabaseDiag }) => {
      const d = getSupabaseDiag();
      if (d.count !== 1) {
        // eslint-disable-next-line no-console
        console.warn('[SUPABASE-DIAG] ⚠️ Expected singleton (count=1), got:', d.count);
      } else {
        // eslint-disable-next-line no-console
        console.info('[SUPABASE-DIAG] ✅ Singleton OK (count=1)');
      }
    });
  }, 500);
}

// Initialize diagnostics early (development only)
if (import.meta.env.DEV) {
  console.log('🔍 M1SSION™ Diagnostics ready');
}

// Initialize badge diagnostics
initBadgeDiagnostics();

// SW Controller enforcement ONLY for Pages.dev (NON tocca push chain)
const ensureMainSWController = async () => {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;
  
  // ONLY enforce on *.pages.dev domains
  if (!location.hostname.endsWith('.pages.dev')) return;
  
  try {
    const ctrl = navigator.serviceWorker.controller?.scriptURL || '';
    console.log('[SW-GUARD] Current controller:', ctrl);
    
    if (!ctrl.endsWith('/sw.js')) {
      console.log('🔧 Pages.dev: Ensuring /sw.js as main controller');
      
      // Register main SW with immediate activation
      const registration = await navigator.serviceWorker.register('/sw.js', { 
        scope: '/', 
        updateViaCache: 'none' 
      });
      
      // Force activation without waiting
      if (registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }
      
      // One-time reload on controller change with loop protection
      const reloadKey = 'sw-main-reload';
      if (!sessionStorage.getItem(reloadKey)) {
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          sessionStorage.setItem(reloadKey, '1');
          console.log('🔄 Controller changed to /sw.js, reloading...');
          location.reload();
        }, { once: true });
      }
    } else {
      console.log('✅ Main SW already controlling');
    }
  } catch (error) {
    console.warn('SW controller enforcement failed:', error);
  }
};

// Initialize SW controller enforcement (non-blocking)
ensureMainSWController();

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

// M1SSION™ Debug Bridge - Expose ENV and helpers for runtime diagnostics
if (typeof window !== 'undefined') {
  (window as any).__M1_DEBUG = Object.assign((window as any).__M1_DEBUG ?? {}, {
    env: { 
      TERRAIN: !!import.meta.env.VITE_TERRAIN_URL,
      CONTOUR: !!import.meta.env.VITE_CONTOUR_URL,
      SUPABASE_URL: !!import.meta.env.VITE_SUPABASE_URL,
      SUPABASE_ANON_KEY: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
    },
    presence: {
      status: 'INIT',
      last: null,
      error: null,
      count: 0
    },
    terrain3D: {
      available: false,
      terrainUrl: import.meta.env.VITE_TERRAIN_URL || null,
      active: false
    },
    ping: (m: string) => console.log('[M1DEBUG]', m)
  });
  console.log('🐛 M1DEBUG bridge ready - window.__M1_DEBUG.ping("test")');
  console.log('🗺️  Terrain URL:', import.meta.env.VITE_TERRAIN_URL ? 'CONFIGURED' : 'MISSING');
}

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
  // ⚡ PRODUZIONE: Solo se esplicitamente richiesto con ?diag=1
  if (import.meta.env.PROD && !new URLSearchParams(window.location.search).get('diag')) return;
  if (new URLSearchParams(window.location.search).get('noerr') === '1') return;
  
  const showErrorOverlay = (error: any, context: string) => {
    // 🔥 ENHANCED: Previene overlay duplicati
    const existing = document.getElementById('error-overlay');
    if (existing) existing.remove();
    
    const overlay = document.createElement('div');
    overlay.id = 'error-overlay';
    overlay.style.cssText = `
      position: fixed; top: 0; left: 0; right: 0; bottom: 0; 
      background: rgba(0,0,0,0.97); color: white; z-index: 999999;
      font-family: 'Courier New', monospace; padding: 20px;
      overflow: auto; font-size: 14px; backdrop-filter: blur(2px);
    `;
    
    // 🔥 ENHANCED: Rilevamento automatico tipo errore
    const isStripeError = (error?.message || '').includes('getStripe');
    const isNetworkError = (error?.message || '').includes('Failed to fetch');
    const isSWError = (error?.message || '').includes('service worker');
    
    const getErrorType = () => {
      if (isStripeError) return '💳 STRIPE ERROR';
      if (isNetworkError) return '🌐 NETWORK ERROR';
      if (isSWError) return '⚙️ SERVICE WORKER ERROR';
      return '🚨 RUNTIME ERROR';
    };
    
    const getSuggestion = () => {
      if (isStripeError) return '💡 Prova a ricaricare con reset cache o controlla la configurazione Stripe';
      if (isNetworkError) return '💡 Verifica la connessione internet o riprova più tardi';
      if (isSWError) return '💡 Ricarica la pagina per risolvere i problemi del service worker';
      return '💡 Prova a ricaricare la pagina. Se il problema persiste, usa Reset App';
    };
    
    overlay.innerHTML = `
      <div style="max-width: 900px; margin: 0 auto;">
        <h2 style="color: #ff6b6b; margin-bottom: 10px; display: flex; align-items: center; gap: 10px;">
          ${getErrorType()} (${context})
        </h2>
        <div style="background: #1a1a2e; padding: 12px; border-radius: 8px; margin-bottom: 15px; border-left: 4px solid #4361ee;">
          <strong>${getSuggestion()}</strong>
        </div>
        <pre style="background: #0f0f23; padding: 15px; border-radius: 8px; white-space: pre-wrap; font-size: 12px; max-height: 300px; overflow: auto; border: 1px solid #333;">
${error?.stack || error?.message || String(error)}
        </pre>
        <div style="margin-top: 20px; display: flex; gap: 10px; flex-wrap: wrap;">
          <button onclick="this.parentElement.parentElement.parentElement.remove()" 
                  style="background: #333; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 12px;">
            ❌ Chiudi
          </button>
          <button onclick="if('caches' in window){caches.keys().then(n => n.forEach(name => caches.delete(name))).finally(() => window.location.reload());} else {window.location.reload();}" 
                  style="background: #4361ee; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 12px;">
            🔄 Ricarica + Cache Reset
          </button>
          <button onclick="localStorage.setItem('push:disable', '1'); window.location.reload();" 
                  style="background: #f39c12; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 12px;">
            🔔 Disabilita Push
          </button>
          <button onclick="localStorage.clear(); sessionStorage.clear(); window.location.href='/app-reset.html';" 
                  style="background: #e74c3c; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 12px;">
            🔨 Reset App Completo
          </button>
          <button onclick="window.location.href='/?noerr=1'" 
                  style="background: #666; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 12px;">
            🚫 Disabilita Overlay
          </button>
        </div>
        <div style="margin-top: 15px; padding: 10px; background: #16213e; border-radius: 6px; font-size: 11px; color: #a0a0a0;">
          <strong>Debug Info:</strong> ${navigator.userAgent.includes('Mobile') ? '📱 Mobile' : '🖥️ Desktop'} | 
          ${window.location.protocol === 'capacitor:' ? '📱 Capacitor' : '🌐 Web'} | 
          SW: ${navigator.serviceWorker?.controller?.scriptURL?.split('/').pop() || 'None'}
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
    console.log("[BOOT] Creating React root with fail-open configuration");
    const root = ReactDOM.createRoot(rootElement);
    
    // Enhanced app rendering with PWA Loading Guard to prevent black screen
    root.render(
      <I18nextProvider i18n={i18n}>
        <QueryClientProvider client={queryClient}>
          <React.Suspense fallback={
            <div className="min-h-screen bg-background flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground font-orbitron">Inizializzazione M1SSION™...</p>
                <div className="text-xs text-muted-foreground">
                  Se il caricamento si blocca, ricarica la pagina
                </div>
              </div>
            </div>
          }>
            <App />
          </React.Suspense>
        </QueryClientProvider>
      </I18nextProvider>
    );
    
    console.log("✅ ENHANCED REACT APP MOUNTED SUCCESSFULLY");
    
    // PWA splash screen is handled via CSS and PWA manifest
    console.log("✅ PWA mode - no splash screen management needed");
  } catch (error) {
    console.error("[BOOT] CRITICAL ERROR RENDERING APP:", error);
    
    // Enhanced error display with fail-open approach
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
          L'applicazione M1SSION™ ha riscontrato un errore critico. 
          Usa i bottoni sotto per riavviare l'app.
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
            🔄 Ricarica App
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
            🔨 Reset Completo
          </button>
        </div>
        <details style="margin-top: 20px; max-width: 600px; text-align: left;">
          <summary style="cursor: pointer; margin-bottom: 10px; color: #aaa;">Dettagli tecnici</summary>
          <pre style="background: #111; padding: 10px; border-radius: 4px; overflow: auto; font-size: 12px;">${error?.stack || error?.message || String(error)}</pre>
        </details>
        <div style="margin-top: 30px; font-size: 12px; color: #666;">
          M1SSION™ © 2025 Joseph MULÉ – NIYVORA KFT™
        </div>
      `;
      rootElement.appendChild(errorDiv);
    }
  }
};

// Helper function for consistent logging
const log = (message: string, data?: any) => {
  if (import.meta.env.DEV || window.location.search.includes('debug=1')) {
    console.log(`[M1SSION-SW] ${message}`, data || '');
  }
};

// SW Controller enforcement for Pages.dev (prevent other SWs from taking control)
const enforceAppSWController = async () => {
  if (!('serviceWorker' in navigator)) return;
  
  try {
    const controller = navigator.serviceWorker.controller;
    const isOnPagesdev = window.location.hostname.includes('pages.dev');
    
    log('[SW-ENFORCE] Current controller:', controller?.scriptURL || 'none');
    log('[SW-ENFORCE] On Pages.dev:', isOnPagesdev);
    
    // Only enforce on Pages.dev if controller is not our main SW
    if (isOnPagesdev && (!controller || !controller.scriptURL.endsWith('/sw.js'))) {
      console.log('[SW-ENFORCE] 🔄 Re-registering main SW on Pages.dev...');
      
      // Clear any conflicting registrations first
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const reg of registrations) {
        if (reg.scope === window.location.origin + '/' && !reg.active?.scriptURL.endsWith('/sw.js')) {
          console.log('[SW-ENFORCE] Clearing conflicting SW:', reg.active?.scriptURL);
          await reg.unregister();
        }
      }
      
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
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        `;
        toast.textContent = '🔄 Aggiornamento app...';
        document.body.appendChild(toast);
        
        setTimeout(() => {
          toast.remove();
          window.location.reload();
        }, 1500);
      };
      
      navigator.serviceWorker.addEventListener('controllerchange', showUpdateToast, { once: true });
    } else {
      console.log('[SW-ENFORCE] ✅ Main SW already controlling or not on Pages.dev');
    }
  } catch (error) {
    console.warn('[SW-ENFORCE] Failed (non-critical):', error);
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

// Initialize app with Service Worker controller protection
async function initAppWithSWGuard() {
  try {
    // Step 1: Enforce main SW controller on Pages.dev
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      await enforceAppSWController();
      
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

// Enhanced global error handling with flood prevention
let _lastErrorLog = 0;
let _errorLogCount = 0;
const ERROR_LOG_COOLDOWN = 1000; // 1 second cooldown
const MAX_ERROR_LOGS_PER_MINUTE = 5;

window.addEventListener('error', (event) => {
  const now = Date.now();
  
  // Reset counter every minute
  if (now - _lastErrorLog > 60000) {
    _errorLogCount = 0;
  }
  
  // Prevent flood: max 5 logs per minute with 1s cooldown
  if (now - _lastErrorLog < ERROR_LOG_COOLDOWN || _errorLogCount >= MAX_ERROR_LOGS_PER_MINUTE) {
    return;
  }
  
  // Skip logging if error has no meaningful information
  if (!event.error?.message && !event.filename && event.lineno === 0) {
    return;
  }
  
  _lastErrorLog = now;
  _errorLogCount++;
  
  console.error('🚨 GLOBAL ERROR:', {
    message: event.error?.message || 'Unknown error',
    filename: event.filename || 'n/a',
    lineno: event.lineno,
    colno: event.colno,
  });
});

let _lastRejectionLog = 0;
let _rejectionLogCount = 0;

window.addEventListener('unhandledrejection', (event) => {
  const now = Date.now();
  
  // Reset counter every minute
  if (now - _lastRejectionLog > 60000) {
    _rejectionLogCount = 0;
  }
  
  // Prevent flood: max 5 logs per minute with 1s cooldown
  if (now - _lastRejectionLog < ERROR_LOG_COOLDOWN || _rejectionLogCount >= MAX_ERROR_LOGS_PER_MINUTE) {
    return;
  }
  
  _lastRejectionLog = now;
  _rejectionLogCount++;
  
  console.error('🚨 UNHANDLED REJECTION:', {
    reason: event.reason instanceof Error ? event.reason.message : String(event.reason),
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
