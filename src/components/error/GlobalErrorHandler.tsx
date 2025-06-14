
import React, { useEffect } from 'react';
import { useErrorReporting } from '@/hooks/useErrorReporting';

interface GlobalErrorHandlerProps {
  children: React.ReactNode;
}

export const GlobalErrorHandler: React.FC<GlobalErrorHandlerProps> = ({ children }) => {
  const { reportError } = useErrorReporting();

  useEffect(() => {
    // Set up global error boundary for React errors
    const errorHandler = (event: ErrorEvent) => {
      console.error('React error caught by GlobalErrorHandler:', event.error);
      
      reportError(
        `Unhandled error: ${event.error?.message || event.message || 'Unknown error'}`,
        { 
          severity: 'high',
          includeUserInfo: true,
          includeDeviceInfo: true
        },
        event.error?.stack
      ).catch(err => {
        console.error('Failed to report error:', err);
      });
      
      // Don't prevent default behavior
      return false;
    };
    
    // Add event listener
    window.addEventListener('error', errorHandler);
    
    return () => {
      // Remove event listener on cleanup
      window.removeEventListener('error', errorHandler);
    };
  }, [reportError]);
  
  return <>{children}</>;
};

export default GlobalErrorHandler;
