
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Funzione per mostrare almeno un contenuto minimo in caso di errore catastrofico
const showErrorFallback = (message = 'Si è verificato un errore. Ricarica la pagina.') => {
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

// Funzione di gestione errori globale
window.addEventListener('error', (event) => {
  console.error('Errore catturato:', event.error);
  // Non mostriamo subito il fallback, permettiamo al sistema di gestione errori di React di funzionare
});

// Funzione di gestione errori di rete
window.addEventListener('unhandledrejection', (event) => {
  console.error('Promessa non gestita:', event.reason);
});

try {
  const rootElement = document.getElementById("root");
  
  if (!rootElement) {
    console.error("Elemento root non trovato!");
    showErrorFallback('Elemento root non trovato. Ricarica la pagina.');
  } else {
    // Prima di renderizzare, puliamo eventuali residui di sessione in caso di refresh
    if (window.performance && window.performance.navigation.type === 1) {
      console.log("Pagina ricaricata, pulisco indicatori di refresh");
      // In caso di refresh, rimuoviamo l'indicatore di pagina caricata
      // ma manteniamo l'indicatore che l'intro è già stato mostrato
      sessionStorage.removeItem('pageLoaded');
    }
    
    createRoot(rootElement).render(<App />);
    console.log("App montata correttamente");
  }
} catch (error) {
  console.error("Errore durante il rendering dell'app:", error);
  showErrorFallback();
}
