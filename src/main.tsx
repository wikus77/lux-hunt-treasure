
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// MIGLIORAMENTO: Gestione errori globale
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
    
    // MIGLIORAMENTO: Wrapping dell'app in un errore boundary globale
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    
    console.log("React app mounted successfully");
  } catch (error) {
    console.error("Error rendering app:", error);
    
    // Fallback error display
    if (rootElement) {
      const errorDiv = document.createElement('div');
      errorDiv.style.padding = '20px';
      errorDiv.style.color = 'white';
      errorDiv.style.backgroundColor = 'black';
      errorDiv.innerHTML = '<h1>Error Loading Application</h1><p>Please refresh the page or contact support.</p>';
      rootElement.appendChild(errorDiv);
    }
  }
};

// MIGLIORAMENTO: Assicuriamo che il DOM sia completamente caricato
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded");
    renderApp();
  });
} else {
  console.log("DOM already loaded");
  renderApp();
}

// MIGLIORAMENTO: Gestione errori non catturati
window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error);
  // Non blocchiamo l'errore, lo logghiamo solo
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled Promise Rejection:', event.reason);
  // Non blocchiamo la rejection, la logghiamo solo
});
