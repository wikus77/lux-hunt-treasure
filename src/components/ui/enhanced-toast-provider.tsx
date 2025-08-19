// © 2025 M1SSION™ – NIYVORA KFT – Joseph MULÉ
import React from 'react';
import { Toaster } from '@/components/ui/sonner';

// UNIFIED TOAST PROVIDER - SINGLE SOURCE OF TRUTH
// This is the ONLY place where toast notifications are configured

export const EnhancedToastProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  return (
    <>
      {children}
      <Toaster
        position="top-center"
        expand={false}
        richColors
        closeButton
        toastOptions={{
          style: {
            background: 'hsl(var(--background))',
            border: '1px solid hsl(var(--border))',
            color: 'hsl(var(--foreground))',
            zIndex: 99999
          },
          className: 'm1ssion-toast',
          duration: 4000,
        }}
        visibleToasts={3}
      />
    </>
  );
};

// Default export for compatibility
export default EnhancedToastProvider;