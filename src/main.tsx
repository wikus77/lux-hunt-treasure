
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// CORREZIONE: Garantiamo che il DOM sia completamente caricato
document.addEventListener('DOMContentLoaded', () => {
  console.log("DOM fully loaded");
  
  const rootElement = document.getElementById('root');

  if (!rootElement) {
    console.error("Root element not found!");
    // Fallback per visualizzare un messaggio di errore anche se root non esiste
    const fallbackElement = document.createElement('div');
    fallbackElement.innerHTML = '<div style="padding: 20px; color: white; background: black;">Root element not found. Please refresh the page.</div>';
    document.body.appendChild(fallbackElement);
  } else {
    try {
      console.log("Mounting React app");
      
      // Ensuring the root element is not null before creating root
      const root = ReactDOM.createRoot(rootElement);
      
      root.render(
        <React.StrictMode>
          <App />
        </React.StrictMode>
      );
      
      console.log("React app mounted successfully");
    } catch (error) {
      console.error("Error rendering app:", error);
      
      // Fallback error display
      const errorDiv = document.createElement('div');
      errorDiv.style.padding = '20px';
      errorDiv.style.color = 'white';
      errorDiv.style.backgroundColor = 'black';
      errorDiv.innerHTML = '<h1>Error Loading Application</h1><p>Please refresh the page or contact support.</p>';
      rootElement.appendChild(errorDiv);
    }
  }
});
