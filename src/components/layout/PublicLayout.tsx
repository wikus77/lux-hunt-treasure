
import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { ErrorBoundary } from '../error/ErrorBoundary';

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
      <div className="min-h-screen bg-black">
        {children || <Outlet />}
      </div>
    </ErrorBoundary>
  );
};

export default PublicLayout;
