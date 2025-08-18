// © 2025 Joseph MULÉ – M1SSION™ - Enhanced Toast Provider
import React, { createContext, useContext, ReactNode } from 'react';
import { Toaster } from 'sonner';

interface EnhancedToastProviderProps {
  children: ReactNode;
}

const EnhancedToastContext = createContext({});

export const useEnhancedToastContext = () => {
  return useContext(EnhancedToastContext);
};

export const EnhancedToastProvider: React.FC<EnhancedToastProviderProps> = ({ children }) => {
  return (
    <EnhancedToastContext.Provider value={{}}>
      {children}
      <Toaster 
        position="top-right"
        richColors
        closeButton={false}
        duration={4000}
        expand={true}
        visibleToasts={5}
        toastOptions={{
          style: {
            background: 'rgba(0, 12, 24, 0.95)',
            color: 'white',
            border: '1px solid rgba(0, 209, 255, 0.3)',
            borderRadius: '12px',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px rgba(0, 209, 255, 0.2)',
            fontFamily: 'Inter, sans-serif',
            fontSize: '14px',
            padding: '16px',
            minHeight: '60px'
          },
          className: 'enhanced-toast',
        }}
      />
    </EnhancedToastContext.Provider>
  );
};

export default EnhancedToastProvider;