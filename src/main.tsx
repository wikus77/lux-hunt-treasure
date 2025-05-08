
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Custom error handler for React rendering errors
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("React error boundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', color: 'white', backgroundColor: 'black', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <h1>Oops! Qualcosa è andato storto</h1>
          <p>L'applicazione ha riscontrato un problema. Prova a ricaricare la pagina.</p>
          <button 
            onClick={() => window.location.reload()}
            style={{ marginTop: '20px', padding: '10px 20px', background: '#00E5FF', color: 'black', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Ricarica Pagina
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Add error boundary
const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error("Root element not found!");
} else {
  try {
    console.log("Mounting React app");
    
    // Ensuring the root element is not null before creating root
    const root = ReactDOM.createRoot(rootElement);
    
    root.render(
      <React.StrictMode>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
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
