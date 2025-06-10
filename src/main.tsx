
import React from 'react';
import ReactDOM from 'react-dom/client';
import * as Sentry from "@sentry/react";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import './index.css';
import { Toaster } from 'sonner';

// Initialize Sentry - now enabled with production DSN
Sentry.init({
  dsn: "https://2db074620da1ba3a3cc6c19025d1d99d@o4508522827235328.ingest.us.sentry.io/4508522829529088",
  integrations: [
    Sentry.browserTracingIntegration(),
  ],
  tracesSampleRate: 0.2, // 20% sampling
  environment: "production",
  release: "m1ssion@1.0.0",
  enabled: true,
  beforeSend(event, hint) {
    // Whitelist developer - don't track errors from developer email
    const user = event.user;
    if (user?.email === 'wikus77@hotmail.it') {
      return null; // Skip tracking for developer
    }
    
    // Filter out sensitive data
    if (event.exception) {
      event.exception.values?.forEach(exception => {
        if (exception.stacktrace?.frames) {
          exception.stacktrace.frames.forEach(frame => {
            // Remove sensitive query parameters or data
            if (frame.vars) {
              delete frame.vars.password;
              delete frame.vars.token;
              delete frame.vars.apiKey;
            }
          });
        }
      });
    }
    
    return event;
  }
});

// Create QueryClient instance for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Gestione errori globale migliorata
const renderApp = () => {
  console.log("Attempting to render app");
  
  const rootElement = document.getElementById('root');

  if (!rootElement) {
    console.error("Root element not found!");
    // Fallback per visualizzare un messaggio di errore anche se root non esiste
    const fallbackElement = document.createElement('div');
    fallbackElement.innerHTML = '<div style="padding: 20px; color: white; background: black;">Root element not found. Please refresh the page.</div>';
    document.body.appendChild(fallbackElement);
    return;
  }
  
  try {
    console.log("Creating React root");
    const root = ReactDOM.createRoot(rootElement);
    
    // Wrapping dell'app in un errore boundary globale e Toaster per notifiche
    root.render(
      <React.StrictMode>
        <Sentry.ErrorBoundary fallback={<div style={{ padding: '20px', color: 'white', background: 'black' }}>Qualcosa è andato storto.</div>}>
          <QueryClientProvider client={queryClient}>
            <App />
            <Toaster position="top-right" richColors closeButton />
          </QueryClientProvider>
        </Sentry.ErrorBoundary>
      </React.StrictMode>
    );
    
    console.log("React app mounted successfully");
  } catch (error) {
    console.error("Error rendering app:", error);
    Sentry.captureException(error);
    
    // Fallback error display migliorato
    if (rootElement) {
      const errorDiv = document.createElement('div');
      errorDiv.style.padding = '20px';
      errorDiv.style.color = 'white';
      errorDiv.style.backgroundColor = 'black';
      errorDiv.innerHTML = '<h1>Error Loading Application</h1><p>Si è verificato un errore durante il caricamento dell\'applicazione. Riprova tra qualche istante o contatta il supporto.</p><button onclick="window.location.reload()" style="background: #333; color: white; padding: 8px 16px; margin-top: 16px; border: none; border-radius: 4px;">Ricarica pagina</button>';
      rootElement.appendChild(errorDiv);
    }
  }
};

// Assicuriamo che il DOM sia completamente caricato e che l'app sia idratata correttamente
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded");
    renderApp();
  });
} else {
  console.log("DOM already loaded");
  renderApp();
}

// Gestione errori non catturati con Sentry
window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error);
  Sentry.captureException(event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled Promise Rejection:', event.reason);
  Sentry.captureException(event.reason);
});
