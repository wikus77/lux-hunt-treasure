// © 2025 M1SSION™ – NIYVORA KFT – Joseph MULÉ
import React from 'react';

interface MapErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class MapErrorBoundary extends React.Component<
  { children: React.ReactNode },
  MapErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): MapErrorBoundaryState {
    console.error('M1MAP-ERROR', 'Map error caught:', {
      name: error.name,
      message: error.message,
      stack: error.stack?.substring(0, 500)
    });
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('M1MAP-ERROR', 'Map component error:', {
      error: error.message,
      componentStack: errorInfo.componentStack?.substring(0, 500)
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-full bg-gray-900 text-white">
          <div className="text-center">
            <h2 className="text-xl mb-4">Errore Mappa</h2>
            <p className="text-sm text-gray-400 mb-4">
              {this.state.error?.message || 'Errore sconosciuto'}
            </p>
            <button
              className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
              onClick={() => {
                this.setState({ hasError: false });
                window.location.reload();
              }}
            >
              Ricarica Pagina
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default MapErrorBoundary;