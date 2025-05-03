
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Set dark background
document.documentElement.style.backgroundColor = 'black';
document.body.style.backgroundColor = 'black';

// Simple refresh detection
const setupRefreshDetection = () => {
  try {
    if (sessionStorage.getItem('initialPageLoad') === null) {
      sessionStorage.setItem('initialPageLoad', 'completed');
      console.log("First visit in this session");
      localStorage.setItem('wasRefreshed', 'false');
    } else {
      console.log("Refresh detected");
      sessionStorage.setItem('wasRefreshed', 'true');
    }
  } catch (error) {
    console.error("Session error:", error);
  }
};

// Ensure visibility
const ensureVisibility = () => {
  document.body.style.visibility = 'visible';
  document.body.style.opacity = '1';
  document.body.style.display = 'block';
};

// Error fallback
const showErrorFallback = (message = 'Si è verificato un errore. Ricarica la pagina.') => {
  console.error("Error:", message);
  document.body.innerHTML = `
    <div style="
      display: flex; 
      flex-direction: column; 
      align-items: center; 
      justify-content: center; 
      height: 100vh; 
      background-color: black; 
      color: white;
      text-align: center;
      padding: 20px;
    ">
      <h1 style="margin-bottom: 20px;">M1SSION</h1>
      <p>${message}</p>
      <button 
        onclick="window.location.reload()" 
        style="
          margin-top: 20px;
          padding: 10px 20px;
          background-color: #0284c7;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        "
      >
        Ricarica
      </button>
    </div>
  `;
};

// Initial setup
setupRefreshDetection();
ensureVisibility();

// Error handling
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  showErrorFallback('Errore durante il caricamento dell\'applicazione.');
});

try {
  const rootElement = document.getElementById("root");
  
  if (!rootElement) {
    showErrorFallback('Elemento root non trovato.');
  } else {
    // Ensure visibility
    rootElement.style.visibility = 'visible';
    rootElement.style.opacity = '1';
    
    // Render app
    const root = createRoot(rootElement);
    root.render(<App />);
    console.log("App mounted successfully");
  }
} catch (error) {
  console.error("Rendering error:", error);
  showErrorFallback('Errore durante l\'avvio dell\'applicazione.');
}

// Final visibility check
window.addEventListener('load', () => {
  ensureVisibility();
});
