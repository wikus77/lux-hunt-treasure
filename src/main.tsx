
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Funzione di gestione errori globale
window.addEventListener('error', (event) => {
  console.error('Errore catturato:', event.error);
});

try {
  const rootElement = document.getElementById("root");
  
  if (!rootElement) {
    console.error("Elemento root non trovato!");
    document.body.innerHTML = '<div style="color: white; padding: 20px;">Errore: Elemento root non trovato.</div>';
  } else {
    createRoot(rootElement).render(<App />);
    console.log("App montata correttamente");
  }
} catch (error) {
  console.error("Errore durante il rendering dell'app:", error);
  document.body.innerHTML = '<div style="color: white; padding: 20px;">Si è verificato un errore. Ricarica la pagina.</div>';
}
