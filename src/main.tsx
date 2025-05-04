
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './styles/global.css';
import './styles/theme.css';
import './styles/utilities.css';
import './styles/animations.css';
import './styles/micro-interactions.css';

// Aggiungi listener per catturare errori di caricamento delle risorse
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM fully loaded');
  // Monitora errori di caricamento risorse (immagini, script, css)
  window.addEventListener('error', (e) => {
    if (e.target instanceof HTMLImageElement) {
      console.error(`Resource load failed: ${e.target.src}`);
    } else if (e.target instanceof HTMLScriptElement) {
      console.error(`Resource load failed: ${e.target.src}`);
    } else if (e.target instanceof HTMLLinkElement) {
      console.error(`Resource load failed: ${e.target.href}`);
    }
  }, true);

  // Performance monitoring
  if (window.performance) {
    const perfData = window.performance.timing;
    setTimeout(() => {
      const loadTime = perfData.loadEventEnd - perfData.navigationStart;
      console.log(`Page load time: ${loadTime}ms`);
    }, 0);
  }
});

// Global error handler
const ErrorFallback = () => {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold text-cyan-400 mb-4">Oops! Qualcosa è andato storto.</h1>
      <p className="mb-6">Stiamo lavorando per risolvere il problema.</p>
      <button 
        onClick={() => window.location.reload()} 
        className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded text-white"
      >
        Ricarica la pagina
      </button>
    </div>
  );
};

// Error boundary class
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null; componentStack: string | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null, componentStack: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Application error:", error);
    console.error("Component stack:", errorInfo.componentStack);
    this.setState({
      componentStack: errorInfo.componentStack
    });
  }

  render() {
    if (this.state.hasError) {
      // Log dettagliati per debug
      console.group("React Error Boundary Caught:");
      console.error("Error:", this.state.error);
      console.error("Component Stack:", this.state.componentStack);
      console.groupEnd();
      
      return <ErrorFallback />;
    }

    return this.props.children;
  }
}

try {
  console.log("App initialization started");
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error("Failed to find the root element");
  }
  
  ReactDOM.createRoot(rootElement).render(
    <ErrorBoundary>
      <React.StrictMode>
        <App />
      </React.StrictMode>
    </ErrorBoundary>
  );
  console.log("App successfully rendered to DOM");
} catch (error) {
  console.error("Fatal error during app initialization:", error);
  document.body.innerHTML = `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; background: black; color: white; padding: 20px; text-align: center;">
      <h1 style="font-size: 24px; margin-bottom: 20px; color: #00E5FF;">Errore di Inizializzazione</h1>
      <p style="margin-bottom: 20px;">Si è verificato un errore durante il caricamento dell'applicazione.</p>
      <p style="margin-bottom: 20px; font-size: 12px; max-width: 800px; overflow-wrap: break-word; color: #ff6b6b;">
        ${error instanceof Error ? error.message : String(error)}
      </p>
      <button style="padding: 10px 20px; background: #00E5FF; color: black; border: none; border-radius: 4px; cursor: pointer;" onclick="window.location.reload()">
        Ricarica la pagina
      </button>
    </div>
  `;
}
