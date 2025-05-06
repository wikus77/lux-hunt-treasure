
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Add error boundary
const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error("Root element not found!");
} else {
  try {
    console.log("Mounting React app");
    
    ReactDOM.createRoot(rootElement).render(
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
