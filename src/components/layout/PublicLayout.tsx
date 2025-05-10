
import React, { useEffect, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { ErrorBoundary } from '../error/ErrorBoundary';
import LoadingScreen from '../index/LoadingScreen';

type PublicLayoutProps = {
  children?: React.ReactNode;
};

/**
 * Layout component for public routes
 * Wraps public pages with common layout elements
 */
const PublicLayout: React.FC<PublicLayoutProps> = ({ children }: PublicLayoutProps) => {
  // Add logging to debug component mounting issues
  useEffect(() => {
    console.log("PublicLayout mounted");
    return () => {
      console.log("PublicLayout unmounted");
    };
  }, []);
  
  console.log("PublicLayout rendering");
  
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingScreen />}>
        <div className="min-h-screen bg-black">
          {children || <Outlet />}
        </div>
      </Suspense>
    </ErrorBoundary>
  );
};

export default PublicLayout;
