
import React from 'react';
import ReactDOM from 'react-dom/client';
import * as Sentry from "@sentry/react";
import App from './App';
import './index.css';
import { Toaster } from 'sonner';

// ✅ Inserisce manualmente il meta tag viewport per iOS safe area
const metaTag = document.createElement('meta');
metaTag.name = "viewport";
metaTag.content = "width=device-width, initial-scale=1, viewport-fit=cover";
document.head.appendChild(metaTag);

// ✅ Inizializza Sentry (momentaneamente disattivato)
Sentry.init({
  dsn: "[INSERISCI LA TUA DSN DI SENTRY QUI]",
  integrations: [
    Sentry.browserTracingIntegration(),
  ],
  tracesSampleRate: 1.0,
  enabled: false
});

// ✅ Rendering con gestione errori avanzata
const renderApp = () => {
  console.log("Attempting to render app");

  const rootElement = document.getElementById('root');

  if (!rootElement) {
    console.error("Root element not found!");
    const fallbackElement = document.createElement('div');
    fallbackElement.innerHTML = '<div style="padding: 20px; color: white; background: black;">Root element not found. Please refresh the page.</div>';
    document.body.appendChild(fallbackElement);
    return;
  }

  try {
    console.log("Creating React root");
    const root = ReactDOM.createRoot(rootElement);

    root.render(
      <React.StrictMode>
        <App />
        <Toaster position="top-right" richColors closeButton />
      </React.StrictMode>
    );

    console.log("React app mounted successfully");
  } catch (error) {
    console.error("Error rendering app:", error);

    const errorDiv = document.createElement('div');
    errorDiv.style.padding = '20px';
    errorDiv.style.color = 'white';
    errorDiv.style.backgroundColor = 'black';
    errorDiv.innerHTML = '<h1>Error Loading Application</h1><p>Si è verificato un errore durante il caricamento dell\'applicazione. Riprova tra qualche istante o contatta il supporto.</p><button onclick="window.location.reload()" style="background: #333; color: white; padding: 8px 16px; margin-top: 16px; border: none; border-radius: 4px;">Ricarica pagina</button>';
    rootElement.appendChild(errorDiv);
  }
};

// ✅ Avvia quando il DOM è pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded");
    renderApp();
  });
} else {
  console.log("DOM already loaded");
  renderApp();
}

// ✅ Gestione errori globali
window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled Promise Rejection:', event.reason);
});
