
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

// Rilevamento più affidabile del tipo di navigazione (refresh o nuovo caricamento)
const detectPageRefresh = () => {
  try {
    // Impostazione iniziale di un flag per il futuro controllo del refresh
    if (sessionStorage.getItem('wasLoaded') === null) {
      sessionStorage.setItem('wasLoaded', 'true');
      console.log("Prima visita in questa sessione");
      return false;
    }
    
    // Metodo legacy con type assertion per TypeScript
    if (window.performance.navigation && window.performance.navigation.type === 1) {
      console.log("Refresh rilevato via performance.navigation");
      return true;
    }
    
    // Metodo moderno con type assertion per TypeScript
    const entries = window.performance.getEntriesByType('navigation');
    if (entries.length > 0) {
      const navType = (entries[0] as PerformanceNavigationTiming).type;
      if (navType === 'reload') {
        console.log("Refresh rilevato via PerformanceNavigationTiming");
        return true;
      }
    }
    
    // Fallback: controlla sessionStorage per determinare se è un ricaricamento
    return sessionStorage.getItem('pageLoaded') === 'true';
  } catch (error) {
    console.error("Errore nel rilevamento del refresh:", error);
    return false;
  }
};

// Imposta un flag per garantire che il documento sia visibile in ogni caso
const ensureVisibility = () => {
  setTimeout(() => {
    if (document.body.style.visibility === 'hidden' || 
        document.body.style.opacity === '0' || 
        document.body.style.display === 'none') {
      console.log("Forzatura visibilità del body dopo timeout");
      document.body.style.visibility = 'visible';
      document.body.style.opacity = '1';
      document.body.style.display = 'block';
    }
  }, 2000); // 2 secondi di timeout di sicurezza
};

const isPageRefresh = detectPageRefresh();

if (isPageRefresh) {
  console.log("Refresh rilevato in main.tsx - garantiremo un rendering sicuro");
  
  // Impostiamo più variabili nello storage che saranno lette dagli altri componenti
  sessionStorage.setItem('wasRefreshed', 'true');
  
  // Se rilevato refresh, impostiamo tutti i flag di intro come già mostrati
  localStorage.setItem('introShown', 'true');
  localStorage.setItem('appIntroShown', 'true');
  
  // Garantiamo la visibilità
  ensureVisibility();
} else {
  // Prima visita in questa sessione
  console.log("Primo caricamento della pagina rilevato");
  sessionStorage.setItem('pageLoaded', 'true');
  sessionStorage.removeItem('wasRefreshed');
}

// Evento DOMContentLoaded per garantire visibilità
document.addEventListener('DOMContentLoaded', () => {
  ensureVisibility();
});

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

// Timer di sicurezza più breve: se dopo 2 secondi non viene renderizzato nulla, mostriamo il fallback
const safetyTimer = setTimeout(() => {
  if (!appRendered) {
    console.error("Timeout di sicurezza attivato: nessun rendering avvenuto");
    showErrorFallback('Timeout di caricamento. Ricarica la pagina.');
  }
}, 2000);

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
    
    // Assicuriamo che il body sia visibile subito
    document.body.style.visibility = 'visible';
    document.body.style.opacity = '1';
    
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
