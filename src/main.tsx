
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Funzione migliorata per il rendering dell'app con migliore gestione degli errori
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
    
    // Wrapping dell'app in un errore boundary globale
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    
    console.log("React app mounted successfully");
  } catch (error) {
    console.error("Error rendering app:", error);
    
    // Migliore visualizzazione errori con dettagli aggiuntivi
    if (rootElement) {
      const errorDiv = document.createElement('div');
      errorDiv.style.padding = '20px';
      errorDiv.style.color = 'white';
      errorDiv.style.backgroundColor = 'black';
      errorDiv.innerHTML = `
        <h1>Error Loading Application</h1>
        <p>Please refresh the page or contact support.</p>
        <p style="color: red; font-size: 14px;">${error?.message || 'Unknown error'}</p>
      `;
      rootElement.appendChild(errorDiv);
    }
  }
};

// Assicuriamo che il DOM sia completamente caricato prima di tentare il rendering
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded");
    setTimeout(renderApp, 10); // Piccolo timeout per assicurare che tutte le risorse siano disponibili
  });
} else {
  console.log("DOM already loaded");
  setTimeout(renderApp, 10); // Stesso timeout per consistenza
}

// Gestione errori non catturati
window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error);
  // Logging migliorato con più informazioni di contesto
  console.error('Error details:', {
    message: event.error?.message,
    stack: event.error?.stack,
    location: window.location.href,
    timestamp: new Date().toISOString()
  });
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled Promise Rejection:', event.reason);
  // Logging migliorato
  console.error('Rejection details:', {
    message: event.reason?.message,
    stack: event.reason?.stack,
    location: window.location.href,
    timestamp: new Date().toISOString()
  });
});
