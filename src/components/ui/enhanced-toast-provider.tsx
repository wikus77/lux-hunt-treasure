// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
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
        position="top-center"
        richColors={false}
        closeButton={false}
        duration={4000}
        expand={false}
        visibleToasts={3}
        toastOptions={{
          style: {
            background: 'rgba(0, 0, 0, 0.92)',
            color: 'white',
            border: '1px solid rgba(0, 209, 255, 0.4)',
            borderRadius: '16px',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 8px 32px rgba(0, 209, 255, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
            fontFamily: 'Inter, sans-serif',
            fontSize: '15px',
            padding: '12px 20px',
            minHeight: '48px',
            width: 'auto',
            maxWidth: '340px',
            margin: '0 auto',
            marginTop: '60px',
            textAlign: 'center',
            fontWeight: '500',
            letterSpacing: '0.025em'
          },
          className: 'enhanced-toast-apple',
        }}
      />
    </EnhancedToastContext.Provider>
  );
};

export default EnhancedToastProvider;