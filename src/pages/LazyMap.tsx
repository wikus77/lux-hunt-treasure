// © 2025 M1SSION™ – Joseph MULÉ – NIYVORA KFT
import React, { Suspense, lazy } from 'react';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { MapErrorFallback } from '@/components/error/MapErrorFallback';

// Lazy load the map page for code splitting
const NewMapPage = lazy(() => import('./NewMapPage'));

const MapLoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="text-center space-y-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
      <p className="text-muted-foreground">Caricamento mappa...</p>
    </div>
  </div>
);

const LazyMap = () => {
  return (
    <ErrorBoundary fallback={<MapErrorFallback />}>
      <Suspense fallback={<MapLoadingFallback />}>
        <NewMapPage />
      </Suspense>
    </ErrorBoundary>
  );
};

export default LazyMap;