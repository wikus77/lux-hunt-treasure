
import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { 
      hasError: false,
      errorMessage: ''
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Aggiorna lo stato in modo che il prossimo render mostri l'UI di fallback
    return { 
      hasError: true,
      errorMessage: error.message || 'Si è verificato un errore inaspettato'
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Puoi anche salvare l'errore in un servizio di reporting
    console.error("React error boundary caught an error:", error, errorInfo);
  }

  handleRefresh = () => {
    // Ricarica la pagina
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Se è stato fornito un fallback personalizzato, usalo
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      // Altrimenti usa l'UI di fallback predefinita
      return (
        <div style={{ 
          padding: '20px', 
          color: 'white', 
          backgroundColor: 'black', 
          height: '100vh', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}>
          <h1>Oops! Qualcosa è andato storto</h1>
          <p>L'applicazione ha riscontrato un problema. Prova a ricaricare la pagina.</p>
          <p style={{ 
            maxWidth: '600px', 
            backgroundColor: 'rgba(255,255,255,0.1)', 
            padding: '10px', 
            borderRadius: '4px',
            marginTop: '10px'
          }}>
            Dettaglio: {this.state.errorMessage}
          </p>
          <button 
            onClick={this.handleRefresh}
            style={{ 
              marginTop: '20px', 
              padding: '10px 20px', 
              background: '#00E5FF', 
              color: 'black', 
              border: 'none', 
              borderRadius: '4px', 
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Ricarica Pagina
          </button>
        </div>
      );
    }

    return this.props.children; 
  }
}
