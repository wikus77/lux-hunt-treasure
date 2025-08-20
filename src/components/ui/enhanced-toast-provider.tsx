// © 2025 M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
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
            background: 'rgba(0, 12, 24, 0.95)',
            color: 'white',
            border: '1px solid rgba(0, 209, 255, 0.5)',
            borderRadius: '20px',
            backdropFilter: 'blur(24px)',
            boxShadow: '0 12px 40px rgba(0, 209, 255, 0.4), inset 0 2px 0 rgba(255, 255, 255, 0.15), 0 0 0 1px rgba(0, 209, 255, 0.2)',
            fontFamily: 'Orbitron, -apple-system, BlinkMacSystemFont, sans-serif',
            fontSize: '15px',
            padding: '16px 24px',
            minHeight: '56px',
            width: 'auto',
            maxWidth: '380px',
            margin: '0 auto',
            marginTop: 'calc(env(safe-area-inset-top, 47px) + 40px)',
            marginLeft: 'auto',
            marginRight: 'auto',
            left: '50%',
            transform: 'translateX(-50%)',
            position: 'relative',
            textAlign: 'center',
            fontWeight: '500',
            letterSpacing: '0.025em',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            WebkitUserSelect: 'none',
            userSelect: 'none'
          },
          className: 'enhanced-toast-apple-ios',
          unstyled: false
        }}
      />
    </EnhancedToastContext.Provider>
  );
};

export default EnhancedToastProvider;