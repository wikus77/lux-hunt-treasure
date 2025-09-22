// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Enhanced Global Error Boundary with User-Friendly UX

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '../ui/button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  eventId?: string;
  retryCount: number;
  errorCode?: string;
}

export class GlobalErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, retryCount: 0 };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, retryCount: 0 };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Generate error code for tracking
    const errorCode = `ERR-${Date.now().toString(36).toUpperCase()}`;
    
    this.setState(prevState => ({ 
      error, 
      errorInfo, 
      errorCode,
      retryCount: prevState.retryCount + 1 
    }));

    // Enhanced logging with error context
    const errorContext = {
      code: errorCode,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString(),
      retryCount: this.state.retryCount
    };

    // Log to console for debugging (only in dev)
    if (import.meta.env.DEV) {
      console.error('🚨 GlobalErrorBoundary caught error:', errorContext);
    }

    // Report to Sentry if available
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      const eventId = (window as any).Sentry.captureException(error, {
        contexts: { 
          react: { componentStack: errorInfo.componentStack },
          runtime: errorContext
        },
        tags: {
          section: 'error_boundary',
          error_code: errorCode,
          retry_count: this.state.retryCount
        }
      });
      this.setState({ eventId });
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    // Clear storage and reload
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {
      console.warn('Failed to clear storage:', e);
    }
    window.location.reload();
  };

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  handleReportIssue = () => {
    const subject = encodeURIComponent('M1SSION™ App - Errore Critico');
    const body = encodeURIComponent(`
Descrizione dell'errore:
${this.state.error?.message || 'Errore sconosciuto'}

Informazioni tecniche:
- Error Code: ${this.state.errorCode || 'N/A'}
- Event ID: ${this.state.eventId || 'N/A'}
- Retry Count: ${this.state.retryCount}
- User Agent: ${navigator.userAgent}
- URL: ${window.location.href}
- Timestamp: ${new Date().toISOString()}

Stack trace:
${this.state.error?.stack || 'N/A'}
    `);
    
    window.open(`mailto:support@m1ssion.eu?subject=${subject}&body=${body}`, '_blank');
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black text-white p-4">
          <div className="max-w-md w-full space-y-6 text-center">
            {/* Error Icon */}
            <div className="mx-auto w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center">
              <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>

            {/* Error Message */}
            <div className="space-y-3">
              <h1 className="text-2xl font-bold text-red-400">Errore Critico</h1>
              <p className="text-gray-300">
                Si è verificato un errore inaspettato nell'applicazione M1SSION™. 
                Ci scusiamo per l'inconveniente.
              </p>
              
              {import.meta.env.DEV && this.state.error && (
                <details className="text-left bg-gray-800/50 p-3 rounded text-sm text-gray-400">
                  <summary className="cursor-pointer mb-2 text-red-400">Dettagli Tecnici</summary>
                  <pre className="whitespace-pre-wrap text-xs">
                    {this.state.error.message}
                    {'\n\n'}
                    {this.state.error.stack}
                  </pre>
                </details>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {this.state.retryCount < 3 && (
                <Button 
                  onClick={this.handleRetry}
                  className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                  size="lg"
                >
                  🔄 Riprova ({3 - this.state.retryCount} tentativi rimasti)
                </Button>
              )}
              
              <Button 
                onClick={this.handleReload}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                size="lg"
              >
                🔄 Ricarica App
              </Button>
              
              <Button 
                onClick={this.handleReset}
                variant="outline"
                className="w-full border-gray-600 text-gray-300 hover:bg-gray-800"
                size="lg"
              >
                🧹 Reset Completo
              </Button>
              
              <Button 
                onClick={this.handleReportIssue}
                variant="ghost"
                className="w-full text-gray-400 hover:text-white"
                size="sm"
              >
                📧 Segnala Bug {this.state.errorCode && `(${this.state.errorCode})`}
              </Button>
            </div>

            {/* Footer */}
            <p className="text-xs text-gray-500 mt-6">
              M1SSION™ v{import.meta.env.VITE_PWA_VERSION || '1.0.0'}
              {this.state.eventId && ` • ID: ${this.state.eventId.slice(0, 8)}`}
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default GlobalErrorBoundary;