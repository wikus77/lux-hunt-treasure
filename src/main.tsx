
import React from 'react';
import ReactDOM from 'react-dom/client';
// Temporarily disable Sentry until DSN is configured
// import * as Sentry from "@sentry/react";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import './index.css';
import { Toaster } from 'sonner';

// Initialize Sentry - temporarily disabled until DSN is configured
/*
Sentry.init({
  dsn: "[INSERISCI LA TUA DSN DI SENTRY QUI]",
  integrations: [
    Sentry.browserTracingIntegration(),
  ],
  tracesSampleRate: 1.0,
  enabled: false // Disabilitato temporaneamente
});
*/

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
          <App />
          <Toaster 
            position="top-right" 
            richColors 
            closeButton 
            duration={4000}
            toastOptions={{
              style: {
                background: 'rgba(0, 0, 0, 0.8)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              },
            }}
          />
        </QueryClientProvider>
      </React.StrictMode>
    );
    
    console.log("✅ ENHANCED REACT APP MOUNTED SUCCESSFULLY");
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
}
