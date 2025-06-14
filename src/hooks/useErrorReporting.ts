
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUnifiedAuth } from '@/hooks/use-unified-auth';

interface ErrorReportOptions {
  severity?: 'info' | 'warn' | 'error' | 'high';
  includeUserInfo?: boolean;
  includeDeviceInfo?: boolean;
}

export function useErrorReporting() {
  const [isReporting, setIsReporting] = useState<boolean>(false);
  const { getCurrentUser } = useUnifiedAuth();
  
  // Set up global error handler
  useEffect(() => {
    const originalConsoleError = console.error;
    const originalWindowOnError = window.onerror;
    
    // Override console.error to capture errors
    console.error = (...args) => {
      // Call the original console.error first
      originalConsoleError.apply(console, args);
      
      // Extract error message
      let errorMessage = args.map(arg => {
        if (arg instanceof Error) {
          return `${arg.name}: ${arg.message}\nStack: ${arg.stack || 'No stack trace'}`;
        }
        return String(arg);
      }).join(' ');
      
      // Auto-report console errors with low severity
      reportError(errorMessage, { severity: 'warn' })
        .catch(err => {
          originalConsoleError('Error reporting console error:', err);
        });
    };
    
    // Set up window.onerror handler
    window.onerror = (message, source, lineno, colno, error) => {
      // Call original handler if it exists
      if (originalWindowOnError) {
        originalWindowOnError.call(window, message, source, lineno, colno, error);
      }
      
      // Format error message
      const formattedMessage = `${message} (${source}:${lineno}:${colno})`;
      const stackTrace = error?.stack || 'No stack trace available';
      
      // Auto-report window errors with high severity
      reportError(formattedMessage, { 
        severity: 'error',
        includeUserInfo: true,
        includeDeviceInfo: true
      }, stackTrace).catch(err => {
        originalConsoleError('Error reporting window.onerror:', err);
      });
      
      // Return true to prevent the default browser error handling
      return true;
    };
    
    // Set up unhandled promise rejection handler
    const unhandledRejectionHandler = (event: PromiseRejectionEvent) => {
      const errorMessage = event.reason?.message || 'Unhandled Promise Rejection';
      const stackTrace = event.reason?.stack || 'No stack trace available';
      
      // Auto-report unhandled rejections with high severity
      reportError(errorMessage, { 
        severity: 'error',
        includeUserInfo: true,
        includeDeviceInfo: true
      }, stackTrace).catch(err => {
        originalConsoleError('Error reporting unhandled rejection:', err);
      });
    };
    
    window.addEventListener('unhandledrejection', unhandledRejectionHandler);
    
    return () => {
      // Restore original functions on cleanup
      console.error = originalConsoleError;
      window.onerror = originalWindowOnError;
      window.removeEventListener('unhandledrejection', unhandledRejectionHandler);
    };
  }, []);
  
  // Function to manually report errors
  const reportError = useCallback(async (
    errorMessage: string,
    options: ErrorReportOptions = {},
    stackTrace?: string
  ) => {
    try {
      setIsReporting(true);
      
      const currentUser = options.includeUserInfo ? getCurrentUser() : null;
      const userId = currentUser?.id;
      
      // Get device info
      let deviceInfo = null;
      let browserInfo = null;
      
      if (options.includeDeviceInfo) {
        deviceInfo = getDeviceInfo();
        browserInfo = getBrowserInfo();
      }
      
      // Report to Edge Function
      const { error } = await supabase.functions.invoke('report-client-error', {
        body: {
          error_message: errorMessage,
          url: window.location.href,
          user_id: userId,
          device: deviceInfo,
          browser_info: browserInfo,
          stack_trace: stackTrace,
          severity: options.severity || 'info'
        }
      });
      
      if (error) throw error;
      
      return { success: true };
    } catch (error) {
      console.error('Failed to report error:', error);
      return { success: false, error };
    } finally {
      setIsReporting(false);
    }
  }, [getCurrentUser]);
  
  return {
    reportError,
    isReporting
  };
}

// Helper functions
function getDeviceInfo(): string {
  const isCapacitor = !!(window as any).Capacitor;
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  
  let deviceType = 'Desktop';
  if (isCapacitor) {
    deviceType = 'Capacitor App';
  } else if (isMobile) {
    deviceType = 'Mobile Web';
  }
  
  return `${deviceType} (${window.innerWidth}x${window.innerHeight})`;
}

function getBrowserInfo(): string {
  const userAgent = navigator.userAgent;
  const browserInfo = {
    userAgent,
    language: navigator.language,
    platform: navigator.platform,
    vendor: navigator.vendor,
    cookieEnabled: navigator.cookieEnabled,
    online: navigator.onLine,
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    memory: (performance as any).memory?.totalJSHeapSize || 'unknown'
  };
  
  return JSON.stringify(browserInfo);
}
