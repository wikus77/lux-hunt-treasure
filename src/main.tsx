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
  
  // Register OneSignal service workers automatically
  console.log('🔔 OneSignal service workers will be registered automatically');
}
