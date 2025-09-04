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
      {/* Toaster rimosso per evitare duplicati - gestito in App.tsx */}
    </EnhancedToastContext.Provider>
  );
};

export default EnhancedToastProvider;