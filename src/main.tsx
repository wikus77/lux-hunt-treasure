
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Sistema semplificato di tracking
let appMounted = false;

// Imposta lo sfondo nero per evitare flash di pagina bianca
document.documentElement.style.backgroundColor = 'black';
document.body.style.backgroundColor = 'black';

// Funzione di visibilità essenziale
const ensureVisibility = () => {
  if (document.body) {
    document.body.style.visibility = 'visible';
    document.body.style.opacity = '1';
    document.body.style.display = 'block';
  }
};

// Imposta flag per saltare animazioni se è un refresh
const setupRefreshDetection = () => {
  try {
    // Usa sessionStorage per rilevare refresh
    if (sessionStorage.getItem('initialPageLoad') === null) {
      sessionStorage.setItem('initialPageLoad', 'completed');
      console.log("Prima visita in questa sessione");
    } else {
      console.log("Refresh rilevato");
      sessionStorage.setItem('wasRefreshed', 'true');
      localStorage.setItem('introShown', 'true');
      localStorage.setItem('appIntroShown', 'true');
    }
  } catch (error) {
    console.error("Errore sessione:", error);
  }
};

// Funzione semplificata per fallback in caso di errore
const showErrorFallback = (message = 'Si è verificato un errore. Ricarica la pagina.') => {
  console.error("Errore:", message);
  document.body.innerHTML = `
    <div style="
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      background-color: black;
      color: white;
      padding: 20px;
      text-align: center;
      font-family: Arial, sans-serif;
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

// Preparazione iniziale
setupRefreshDetection();
ensureVisibility();

// Evento DOMContentLoaded per garantire visibilità
document.addEventListener('DOMContentLoaded', () => {
  console.log("DOM caricato");
  ensureVisibility();
  window.__domLoaded = true;
});

// Gestione errori globale
window.addEventListener('error', (event) => {
  console.error('Errore globale:', event.error);
  if (!appMounted) {
    showErrorFallback('Errore durante il caricamento dell\'applicazione.');
  }
});

// Gestione errori di rete
window.addEventListener('unhandledrejection', (event) => {
  console.error('Errore non gestito:', event.reason);
});

// Timer di sicurezza breve
const safetyTimer = setTimeout(() => {
  if (!appMounted) {
    showErrorFallback('Timeout di caricamento.');
  }
}, 2000);

try {
  const rootElement = document.getElementById("root");
  
  if (!rootElement) {
    showErrorFallback('Elemento root non trovato.');
  } else {
    // Assicuriamo visibilità immediata
    rootElement.style.visibility = 'visible';
    rootElement.style.opacity = '1';
    rootElement.style.display = 'block';
    
    // Rendering diretto
    const root = createRoot(rootElement);
    root.render(<App />);
    
    // Impostiamo flag di render completato
    appMounted = true;
    clearTimeout(safetyTimer);
    
    console.log("App montata correttamente");
  }
} catch (error) {
  console.error("Errore di rendering:", error);
  showErrorFallback('Errore durante l\'avvio dell\'applicazione.');
}

// Visibilità finale dopo caricamento completo
window.addEventListener('load', () => {
  ensureVisibility();
});
