// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
import React from 'react';
import { DETAILED_ERRORS, VERBOSE_LOGGING } from '@/config/featureFlags';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
  errorStack?: string;
  errorId: string;
}

// Generate unique error ID for tracking
const generateErrorId = () => `ERR-${Date.now().toString(36).toUpperCase()}`;

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { 
      hasError: false,
      errorMessage: '',
      errorStack: undefined,
      errorId: ''
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { 
      hasError: true,
      errorMessage: error.message || 'Si è verificato un errore inaspettato',
      errorStack: error.stack,
      errorId: generateErrorId()
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const errorReport = {
      id: this.state.errorId,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    // Log in development or if verbose logging enabled
    if (VERBOSE_LOGGING) {
      console.error("🔴 [ErrorBoundary] Error caught:", errorReport);
    } else {
      console.error(`🔴 [ErrorBoundary] Error ${this.state.errorId}:`, error.message);
    }

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    // Store error for potential reporting
    try {
      const errors = JSON.parse(localStorage.getItem('m1_error_log') || '[]');
      errors.push(errorReport);
      // Keep only last 10 errors
      localStorage.setItem('m1_error_log', JSON.stringify(errors.slice(-10)));
    } catch {
      // Ignore storage errors
    }
  }

  handleRefresh = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ 
      hasError: false, 
      errorMessage: '', 
      errorStack: undefined,
      errorId: '' 
    });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      // Default error UI
      return (
        <div style={{ 
          padding: '20px', 
          color: 'white', 
          backgroundColor: '#070818', 
          minHeight: '100vh', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          <div style={{
            maxWidth: '500px',
            textAlign: 'center',
            padding: '40px',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>⚠️</div>
            <h1 style={{ 
              fontSize: '24px', 
              fontWeight: 'bold',
              marginBottom: '12px',
              color: '#fff'
            }}>
              Oops! Qualcosa è andato storto
            </h1>
            <p style={{ 
              color: 'rgba(255,255,255,0.7)',
              marginBottom: '24px',
              lineHeight: '1.5'
            }}>
              L'applicazione ha riscontrato un problema. Puoi provare a ricaricare la pagina o tornare alla home.
            </p>
            
            {DETAILED_ERRORS && this.state.errorMessage && (
              <div style={{ 
                backgroundColor: 'rgba(255,0,0,0.1)', 
                padding: '12px', 
                borderRadius: '8px',
                marginBottom: '24px',
                textAlign: 'left',
                fontSize: '12px',
                fontFamily: 'monospace',
                wordBreak: 'break-word'
              }}>
                <div style={{ color: '#ff6b6b', marginBottom: '4px' }}>
                  ID: {this.state.errorId}
                </div>
                <div style={{ color: 'rgba(255,255,255,0.6)' }}>
                  {this.state.errorMessage}
                </div>
              </div>
            )}

            {!DETAILED_ERRORS && (
              <p style={{ 
                fontSize: '11px', 
                color: 'rgba(255,255,255,0.4)',
                marginBottom: '20px'
              }}>
                Codice errore: {this.state.errorId}
              </p>
            )}
            
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button 
                onClick={this.handleRefresh}
                style={{ 
                  padding: '12px 24px', 
                  background: 'linear-gradient(135deg, #00E5FF, #7C3AED)', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '8px', 
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  transition: 'transform 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                🔄 Ricarica Pagina
              </button>
              <button 
                onClick={this.handleGoHome}
                style={{ 
                  padding: '12px 24px', 
                  background: 'rgba(255,255,255,0.1)', 
                  color: 'white', 
                  border: '1px solid rgba(255,255,255,0.2)', 
                  borderRadius: '8px', 
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  transition: 'transform 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                🏠 Vai alla Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children; 
  }
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
