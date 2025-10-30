// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import { Component, ReactNode } from 'react';

interface DNAErrorBoundaryProps {
  children: ReactNode;
}

interface DNAErrorBoundaryState {
  err?: any;
}

export class DNAErrorBoundary extends Component<DNAErrorBoundaryProps, DNAErrorBoundaryState> {
  state: DNAErrorBoundaryState = { err: undefined };

  static getDerivedStateFromError(err: any): DNAErrorBoundaryState {
    return { err };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[DNA ErrorBoundary] Caught error:', error, errorInfo);
  }

  render() {
    if (this.state.err) {
      return (
        <div className="w-full h-screen flex items-center justify-center bg-background">
          <div className="text-center max-w-md p-6">
            <div className="text-destructive text-lg font-semibold mb-2">
              DNA Module Error
            </div>
            <p className="text-muted-foreground text-sm">
              An error occurred while loading the DNA experience. Please refresh the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
