// © 2025 Joseph MULÉ – M1SSION™ - Enhanced Toast System
import { toast as sonnerToast } from 'sonner';
import { useCallback } from 'react';

interface ToastOptions {
  title?: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  variant?: 'default' | 'success' | 'error' | 'warning' | 'info' | 'premium';
}

export const useEnhancedToast = () => {
  const showToast = useCallback((message: string, options: ToastOptions = {}) => {
    const {
      title,
      description,
      duration = 4000,
      action,
      variant = 'default'
    } = options;

    const baseOptions = {
      duration,
      description: description || message,
      action: action ? {
        label: action.label,
        onClick: action.onClick
      } : undefined,
      style: {
        background: 'rgba(0, 12, 24, 0.95)',
        color: 'white',
        border: '1px solid rgba(0, 209, 255, 0.3)',
        borderRadius: '12px',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 8px 32px rgba(0, 209, 255, 0.2)',
        fontFamily: 'Inter, sans-serif'
      } as React.CSSProperties
    };

    switch (variant) {
      case 'success':
        return sonnerToast.success(title || message, {
          ...baseOptions,
          style: {
            ...baseOptions.style,
            border: '1px solid rgba(34, 197, 94, 0.5)',
            boxShadow: '0 8px 32px rgba(34, 197, 94, 0.2)'
          }
        });
        
      case 'error':
        return sonnerToast.error(title || message, {
          ...baseOptions,
          style: {
            ...baseOptions.style,
            border: '1px solid rgba(239, 68, 68, 0.5)',
            boxShadow: '0 8px 32px rgba(239, 68, 68, 0.2)'
          }
        });
        
      case 'warning':
        return sonnerToast.warning(title || message, {
          ...baseOptions,
          style: {
            ...baseOptions.style,
            border: '1px solid rgba(245, 158, 11, 0.5)',
            boxShadow: '0 8px 32px rgba(245, 158, 11, 0.2)'
          }
        });
        
      case 'info':
        return sonnerToast.info(title || message, {
          ...baseOptions,
          style: {
            ...baseOptions.style,
            border: '1px solid rgba(59, 130, 246, 0.5)',
            boxShadow: '0 8px 32px rgba(59, 130, 246, 0.2)'
          }
        });
        
      case 'premium':
        return sonnerToast(title || message, {
          ...baseOptions,
          style: {
            ...baseOptions.style,
            background: 'linear-gradient(135deg, rgba(0, 12, 24, 0.95), rgba(16, 16, 32, 0.95))',
            border: '1px solid rgba(168, 85, 247, 0.5)',
            boxShadow: '0 8px 32px rgba(168, 85, 247, 0.3)',
            color: '#e879f9'
          }
        });
        
      default:
        return sonnerToast(title || message, baseOptions);
    }
  }, []);

  // Convenience methods
  const success = useCallback((message: string, options?: Omit<ToastOptions, 'variant'>) => {
    return showToast(message, { ...options, variant: 'success' });
  }, [showToast]);

  const error = useCallback((message: string, options?: Omit<ToastOptions, 'variant'>) => {
    return showToast(message, { ...options, variant: 'error' });
  }, [showToast]);

  const warning = useCallback((message: string, options?: Omit<ToastOptions, 'variant'>) => {
    return showToast(message, { ...options, variant: 'warning' });
  }, [showToast]);

  const info = useCallback((message: string, options?: Omit<ToastOptions, 'variant'>) => {
    return showToast(message, { ...options, variant: 'info' });
  }, [showToast]);

  const premium = useCallback((message: string, options?: Omit<ToastOptions, 'variant'>) => {
    return showToast(message, { ...options, variant: 'premium' });
  }, [showToast]);

  // Push notification style toast
  const pushNotification = useCallback((title: string, body: string, onClick?: () => void) => {
    return sonnerToast(title, {
      description: body,
      duration: 6000,
      action: onClick ? {
        label: 'Apri',
        onClick
      } : undefined,
      style: {
        background: 'rgba(0, 12, 24, 0.98)',
        color: 'white',
        border: '1px solid rgba(0, 209, 255, 0.4)',
        borderRadius: '16px',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 12px 40px rgba(0, 209, 255, 0.3)',
        fontFamily: 'Inter, sans-serif',
        minHeight: '70px',
        padding: '16px 20px'
      } as React.CSSProperties
    });
  }, []);

  return {
    toast: showToast,
    success,
    error,
    warning,
    info,
    premium,
    pushNotification
  };
};

export default useEnhancedToast;