
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Flag globale per tracciare lo stato di rendering
let appRendered = false;

// Funzione per mostrare un contenuto minimo di fallback in caso di errore
const showErrorFallback = (message = 'Si è verificato un errore. Ricarica la pagina.') => {
  console.error("Mostrando fallback:", message);
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

// Rilevamento iniziale del tipo di navigazione (refresh o nuovo caricamento)
const isPageRefresh = window.performance && 
  (window.performance.navigation && window.performance.navigation.type === 1) ||
  (window.performance.getEntriesByType('navigation')[0]?.type === 'reload');

if (isPageRefresh) {
  console.log("Refresh rilevato in main.tsx - garantiremo un rendering sicuro");
  
  // Pulizia sessionStorage in caso di refresh per evitare stati incoerenti
  sessionStorage.removeItem('pageLoaded');
  
  // Se rilevato refresh, impostiamo l'intro come già mostrato
  const introShown = localStorage.getItem('introShown');
  if (!introShown) {
    localStorage.setItem('introShown', 'true');
  }
}

// Gestione errori globale
window.addEventListener('error', (event) => {
  console.error('Errore globale catturato:', event.error);
  
  // Se l'app non è ancora stata renderizzata, mostriamo il fallback
  if (!appRendered) {
    showErrorFallback('Errore durante il caricamento. Ricarica la pagina.');
  }
  // Altrimenti lasciamo che React ErrorBoundary gestisca l'errore
});

// Gestione errori di rete
window.addEventListener('unhandledrejection', (event) => {
  console.error('Promessa non gestita:', event.reason);
  
  // In caso di errori di rete critici prima del rendering, mostriamo il fallback
  if (!appRendered && event.reason.toString().includes('network')) {
    showErrorFallback('Errore di rete. Controlla la connessione e ricarica.');
  }
});

// Timer di sicurezza: se dopo 5 secondi non viene renderizzato nulla, mostriamo il fallback
const safetyTimer = setTimeout(() => {
  if (!appRendered) {
    console.error("Timeout di sicurezza attivato: nessun rendering avvenuto");
    showErrorFallback('Timeout di caricamento. Ricarica la pagina.');
  }
}, 5000);

try {
  const rootElement = document.getElementById("root");
  
  if (!rootElement) {
    console.error("Elemento root non trovato!");
    showErrorFallback('Elemento root non trovato. Ricarica la pagina.');
  } else {
    // Rendering sicuro
    console.log("Avvio renderizzazione dell'app");
    
    // Segnaliamo che la pagina è stata caricata in questa sessione
    sessionStorage.setItem('pageLoaded', 'true');
    
    const root = createRoot(rootElement);
    root.render(<App />);
    
    // Impostiamo il flag di render completato
    appRendered = true;
    
    // Pulizia del timer di sicurezza
    clearTimeout(safetyTimer);
    
    console.log("App montata correttamente");
  }
} catch (error) {
  console.error("Errore durante il rendering dell'app:", error);
  showErrorFallback();
}
