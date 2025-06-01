
import React from 'react';
import ReactDOM from 'react-dom/client';
import * as Sentry from "@sentry/react";
import App from './App';
import './index.css';
import { Toaster } from 'sonner';

// ✅ Inserisce il meta tag viewport per la safe area su iOS
const metaTag = document.createElement('meta');
metaTag.name = "viewport";
metaTag.content = "width=device-width, initial-scale=1, viewport-fit=cover";
document.head.appendChild(metaTag);

// ✅ Inizializza Sentry (puoi attivarlo sostituendo la DSN e mettendo `enabled: true`)
Sentry.init({
  dsn: "[INSERISCI_LA_TUA_DSN_DI_SENTRY]",
  integrations: [
    Sentry.browserTracingIntegration(),
  ],
  tracesSampleRate: 1.0,
  enabled: false,
});

// ✅ Funzione di rendering con fallback automatico
const renderApp = () => {
  const rootElement = document.getElementById('root');

  if (!rootElement) {
    const fallback = document.createElement('div');
    fallback.innerHTML = `
      <div style="padding: 20px; color: white; background: black;">
        <strong>Root element not found.</strong><br/>
        Please refresh the page.
      </div>`;
    document.body.appendChild(fallback);
    return;
  }

  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
        <Toaster position="top-right" richColors closeButton />
      </React.StrictMode>
    );
  } catch (error) {
    const errorDiv = document.createElement('div');
    errorDiv.style.padding = '20px';
    errorDiv.style.color = 'white';
    errorDiv.style.backgroundColor = 'black';
    errorDiv.innerHTML = `
      <h1>Error Loading Application</h1>
      <p>Si è verificato un errore durante il caricamento dell'applicazione.</p>
      <button onclick="window.location.reload()" style="background: #333; color: white; padding: 8px 16px; margin-top: 16px; border: none; border-radius: 4px;">
        Ricarica pagina
      </button>`;
    rootElement.appendChild(errorDiv);
  }
};

// ✅ Avvia quando il DOM è pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderApp);
} else {
  renderApp();
}

// ✅ Gestione globale errori JS e Promise
window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled Promise Rejection:', event.reason);
});

