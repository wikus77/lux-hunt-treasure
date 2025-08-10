// © 2025 All Rights Reserved  – M1SSION™  – NIYVORA KFT Joseph MULÉ
import React from 'react';

interface MapErrorBoundaryState {
  hasError: boolean;
  errorInfo?: { message: string; stack?: string } | null;
}

export class MapErrorBoundary extends React.Component<React.PropsWithChildren<{}>, MapErrorBoundaryState> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false, errorInfo: null };
  }

  static getDerivedStateFromError(error: any): MapErrorBoundaryState {
    return { hasError: true, errorInfo: { message: String(error?.message || error), stack: error?.stack } };
  }

  componentDidCatch(error: any, errorInfo: any) {
    try {
      const isLatLngError = /\.lat|\.lng|latlng|setView|panTo/i.test(String(error?.message || ''));
      if (import.meta.env?.DEV) {
        console.groupCollapsed('[MAP][ErrorBoundary] caught error');
        console.error(error);
        console.log('componentStack:', errorInfo?.componentStack);
        if (isLatLngError) {
          console.warn('[MAP] invalid lat/lng access detected');
        }
        console.groupEnd();
      }
    } catch {}
  }

  render() {
    if (this.state.hasError) {
      // Render a minimal non-blocking notice to avoid blank screen
      return (
        <div className="w-full h-full flex items-center justify-center">
          <div className="px-4 py-3 rounded-md bg-muted/30 text-sm text-muted-foreground">
            Problema nel rendering della mappa. Riprova a ricaricare la pagina.
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default MapErrorBoundary;
