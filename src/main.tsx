import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Sistema di tracking dello stato dell'applicazione
let appRendered = false;
let appInitialized = false;

// Funzione migliorata per mostrare un contenuto di fallback in caso di errore
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

// Sistema multilivello di rilevamento refresh più affidabile
const detectPageRefresh = () => {
  try {
    // 1. Verifica diretta tramite sessionStorage (più affidabile tra sessioni)
    if (sessionStorage.getItem('initialPageLoad') === null) {
      sessionStorage.setItem('initialPageLoad', 'completed');
      console.log("Prima visita in questa sessione rilevata con sessionStorage");
      return false; // Non è un refresh
    }
    
    // 2. Verifica tramite Performance API (deprecated ma ancora supportato)
    if (window.performance && window.performance.navigation && window.performance.navigation.type === 1) {
      console.log("Refresh rilevato via performance.navigation (metodo legacy)");
      return true;
    }
    
    // 3. Verifica tramite PerformanceNavigationTiming API (moderno)
    const entries = window.performance.getEntriesByType('navigation');
    if (entries.length > 0) {
      const navType = (entries[0] as PerformanceNavigationTiming).type;
      if (navType === 'reload') {
        console.log("Refresh rilevato via PerformanceNavigationTiming");
        return true;
      }
    }
    
    // 4. Fallback: controlla un flag di sessione specifico per il refresh
    return sessionStorage.getItem('pageAlreadyLoaded') === 'true';
  } catch (error) {
    console.error("Errore nel rilevamento del refresh:", error);
    return false; // In caso di errore, assumiamo che non sia un refresh
  }
};

// Funzione di sicurezza per garantire la visibilità della pagina
const ensureVisibility = () => {
  // Controlla e correggi immediatamente
  if (document.body) {
    document.body.style.visibility = 'visible';
    document.body.style.opacity = '1';
    document.body.style.display = 'block';
  }
  
  // Imposta un timer di sicurezza più frequente
  const visibilityInterval = setInterval(() => {
    if (document.body) {
      if (document.body.style.visibility === 'hidden' || 
          document.body.style.opacity === '0' || 
          document.body.style.display === 'none') {
        console.log("Forzatura visibilità del body dopo interval check");
        document.body.style.visibility = 'visible';
        document.body.style.opacity = '1';
        document.body.style.display = 'block';
      }
      
      // Verifica anche se il contenuto è invisibile a causa di un container
      const root = document.getElementById('root');
      if (root && (
          window.getComputedStyle(root).visibility === 'hidden' || 
          window.getComputedStyle(root).opacity === '0' || 
          window.getComputedStyle(root).display === 'none')) {
        console.log("Forzatura visibilità dell'elemento root");
        root.style.visibility = 'visible';
        root.style.opacity = '1';
        root.style.display = 'block';
      }
    }
    
    // Se l'app è già stata renderizzata, possiamo fermare l'intervallo
    if (appRendered && appInitialized) {
      clearInterval(visibilityInterval);
    }
  }, 500); // Controllo ogni 500ms
  
  // Pulizia automatica dopo 10 secondi per evitare memory leak
  setTimeout(() => clearInterval(visibilityInterval), 10000);
};

// Imposta i flag di controllo del ciclo di vita prima del rendering
const isPageRefresh = detectPageRefresh();

if (isPageRefresh) {
  console.log("Refresh rilevato in main.tsx - attivazione protocollo di sicurezza");
  
  // Imposta tutti i flag necessari per saltare le animazioni di intro
  sessionStorage.setItem('wasRefreshed', 'true');
  localStorage.setItem('introShown', 'true');
  localStorage.setItem('appIntroShown', 'true');
  
  // Garantisci la visibilità immediata
  ensureVisibility();
} else {
  console.log("Primo caricamento della pagina rilevato");
  sessionStorage.setItem('pageAlreadyLoaded', 'true');
  sessionStorage.removeItem('wasRefreshed');
}

// Evento DOMContentLoaded per garantire visibilità
document.addEventListener('DOMContentLoaded', () => {
  console.log("DOMContentLoaded attivato, assicuro visibilità");
  ensureVisibility();
  
  // Impostazione di un flag che conferma che il DOM è stato caricato
  window.__domLoaded = true; // Ora TypeScript riconosce questa proprietà grazie alla dichiarazione nel file .d.ts
});

// Gestione errori globale migliorata
window.addEventListener('error', (event) => {
  console.error('Errore globale catturato:', event.error);
  
  if (!appRendered) {
    showErrorFallback('Errore durante il caricamento dell\'applicazione. Ricarica la pagina.');
  }
});

// Gestione errori di rete più dettagliata
window.addEventListener('unhandledrejection', (event) => {
  console.error('Promessa non gestita:', event.reason);
  
  const errorMessage = String(event.reason);
  
  if (!appRendered) {
    if (errorMessage.includes('network') || errorMessage.includes('fetch') || errorMessage.includes('connection')) {
      showErrorFallback('Errore di rete. Controlla la connessione e ricarica.');
    } else {
      showErrorFallback('Si è verificato un errore. Ricarica la pagina.');
    }
  }
});

// Timer di sicurezza più breve per il rendering
const safetyTimer = setTimeout(() => {
  if (!appRendered) {
    console.error("Timeout di sicurezza attivato: nessun rendering avvenuto dopo 2 secondi");
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
    
    // Assicuriamo che il body sia visibile subito
    document.body.style.visibility = 'visible';
    document.body.style.opacity = '1';
    document.body.style.display = 'block';
    
    // Anche l'elemento root deve essere visibile
    rootElement.style.visibility = 'visible';
    rootElement.style.opacity = '1';
    rootElement.style.display = 'block';
    
    const root = createRoot(rootElement);
    root.render(<App />);
    
    // Impostiamo i flag di render completato
    appRendered = true;
    
    // Dopo un breve ritardo, confermiamo che l'app è stata inizializzata completamente
    setTimeout(() => {
      appInitialized = true;
      console.log("App completamente inizializzata");
    }, 500);
    
    // Pulizia del timer di sicurezza
    clearTimeout(safetyTimer);
    
    console.log("App montata correttamente");
  }
} catch (error) {
  console.error("Errore durante il rendering dell'app:", error);
  showErrorFallback('Errore durante l\'avvio dell\'applicazione. Ricarica la pagina.');
}

// Aggiungiamo finalmente un controllo extra per la visibilità della pagina
window.addEventListener('load', () => {
  console.log("Window load event attivato");
  ensureVisibility();
});

// Risoluzione del problema di flash bianco durante il caricamento
document.documentElement.style.backgroundColor = 'black';
document.body.style.backgroundColor = 'black';
