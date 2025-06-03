
import React from 'react';
import ReactDOM from 'react-dom/client';
import * as Sentry from "@sentry/react";
import { App as CapacitorApp } from '@capacitor/app';
import { supabase } from '@/integrations/supabase/client';
import App from './App';
import './index.css';
import { Toaster } from 'sonner';

// Initialize Sentry - DISABLED for development
// Disattivato temporaneamente Sentry per evitare errori in modalità sviluppatore
if (import.meta.env.MODE !== 'development' && import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    integrations: [
      Sentry.browserTracingIntegration(),
    ],
    tracesSampleRate: 1.0,
    enabled: true
  });
} else {
  console.log("Sentry disabled in development mode");
}

// Magic link handler for Capacitor
CapacitorApp.addListener('appUrlOpen', async ({ url }) => {
  if (url?.includes('type=magiclink')) {
    const cleanedUrl = new URL(url);
    const token = cleanedUrl.searchParams.get('token');
    if (token) {
      try {
        const { data, error } = await supabase.auth.verifyOtp({
          type: 'magiclink',
          token,
        });
        if (!error && data.session) {
          console.log('✅ Sessione salvata da magic link Capacitor');
          window.location.href = '/home';
        } else {
          console.error('❌ Errore nel verificare magic link:', error);
        }
      } catch (err) {
        console.error('❌ Errore imprevisto magic link:', err);
      }
    }
  }
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
        <App />
        <Toaster position="top-right" richColors closeButton />
      </React.StrictMode>
    );
    
    console.log("React app mounted successfully");
  } catch (error) {
    console.error("Error rendering app:", error);
    
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

// Gestione errori non catturati
window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled Promise Rejection:', event.reason);
});
