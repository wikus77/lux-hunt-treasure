
import { useCallback } from 'react';

interface ErrorReportOptions {
  severity?: 'low' | 'medium' | 'high';
  includeUserInfo?: boolean;
  includeDeviceInfo?: boolean;
}

export const useErrorReporting = () => {
  const reportError = useCallback(async (
    message: string,
    options: ErrorReportOptions = {},
    stackTrace?: string
  ) => {
    try {
      // Simple console logging for now to avoid auth dependencies
      console.error('Error Report:', {
        message,
        options,
        stackTrace,
        timestamp: new Date().toISOString()
      });
      
      // Future implementation could include Supabase logging
      // when authentication context is guaranteed to be available
      
    } catch (error) {
      console.error('Failed to report error:', error);
    }
  }, []);

  return { reportError };
};
