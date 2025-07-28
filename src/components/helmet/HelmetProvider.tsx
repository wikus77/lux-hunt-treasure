// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
import React from 'react';
import { HelmetProvider as AsyncHelmetProvider } from 'react-helmet-async';

interface HelmetProviderProps {
  children: React.ReactNode;
}

export const HelmetProvider: React.FC<HelmetProviderProps> = ({ children }) => {
  return (
    <AsyncHelmetProvider>
      {children}
    </AsyncHelmetProvider>
  );
};

export default HelmetProvider;