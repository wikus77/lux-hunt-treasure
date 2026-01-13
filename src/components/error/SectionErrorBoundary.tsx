/**
 * M1SSION™ Section Error Boundary
 * © 2026 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 * 
 * Error boundary leggero per sezioni specifiche dell'app.
 * Se una sezione crasha, mostra un placeholder invece di crashare tutta l'app.
 * 
 * UTILIZZO:
 * <SectionErrorBoundary section="FortuneWheel">
 *   <FortuneWheel />
 * </SectionErrorBoundary>
 */

import React from 'react';
import { RefreshCw, AlertCircle } from 'lucide-react';

interface SectionErrorBoundaryProps {
  children: React.ReactNode;
  section: string;
  fallbackHeight?: string;
  showRetry?: boolean;
  onRetry?: () => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class SectionErrorBoundary extends React.Component<SectionErrorBoundaryProps, State> {
  constructor(props: SectionErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log minimo - solo sezione e messaggio
    console.error(`[SectionError:${this.props.section}]`, error.message);
    
    // Traccia locale per debug
    try {
      const key = `m1_section_errors_${this.props.section}`;
      const count = parseInt(localStorage.getItem(key) || '0', 10);
      localStorage.setItem(key, String(count + 1));
    } catch {
      // Ignore
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
    this.props.onRetry?.();
  };

  render() {
    if (this.state.hasError) {
      const { section, fallbackHeight = '200px', showRetry = true } = this.props;
      
      return (
        <div
          style={{
            height: fallbackHeight,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(255, 100, 100, 0.05)',
            borderRadius: '12px',
            border: '1px dashed rgba(255, 100, 100, 0.2)',
            padding: '20px',
            textAlign: 'center',
          }}
        >
          <AlertCircle 
            style={{ 
              width: '32px', 
              height: '32px', 
              color: 'rgba(255, 150, 150, 0.7)',
              marginBottom: '12px' 
            }} 
          />
          <p style={{ 
            color: 'rgba(255, 255, 255, 0.6)', 
            fontSize: '14px',
            marginBottom: '8px' 
          }}>
            {section} non disponibile
          </p>
          {showRetry && (
            <button
              onClick={this.handleRetry}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              <RefreshCw style={{ width: '14px', height: '14px' }} />
              Riprova
            </button>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * HOC per wrappare componenti con error boundary
 */
export function withSectionErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  section: string,
  options?: { fallbackHeight?: string; showRetry?: boolean }
) {
  return function WrappedComponent(props: P) {
    return (
      <SectionErrorBoundary section={section} {...options}>
        <Component {...props} />
      </SectionErrorBoundary>
    );
  };
}

export default SectionErrorBoundary;

