
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './styles/global.css';
import './styles/theme.css';
import './styles/utilities.css';
import './styles/animations.css';
import './styles/micro-interactions.css';

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
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_error: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Application error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }

    return this.props.children;
  }
}

try {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <ErrorBoundary>
      <React.StrictMode>
        <App />
      </React.StrictMode>
    </ErrorBoundary>
  );
} catch (error) {
  console.error("Fatal error during app initialization:", error);
  document.body.innerHTML = `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; background: black; color: white; padding: 20px; text-align: center;">
      <h1 style="font-size: 24px; margin-bottom: 20px; color: #00E5FF;">Errore di Inizializzazione</h1>
      <p style="margin-bottom: 20px;">Si è verificato un errore durante il caricamento dell'applicazione.</p>
      <button style="padding: 10px 20px; background: #00E5FF; color: black; border: none; border-radius: 4px; cursor: pointer;" onclick="window.location.reload()">
        Ricarica la pagina
      </button>
    </div>
  `;
}
