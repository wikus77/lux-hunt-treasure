// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Production Security Wrapper with Enhanced Protection

import React, { useEffect } from 'react';
import { applySecurityHeaders } from '@/security/csp';

interface ProductionSecurityWrapperProps {
  children: React.ReactNode;
}

export const ProductionSecurityWrapper: React.FC<ProductionSecurityWrapperProps> = ({ children }) => {
  useEffect(() => {
    // Disable right-click context menu in production
    if (import.meta.env.PROD) {
      const disableRightClick = (e: MouseEvent) => {
        e.preventDefault();
        return false;
      };
      
      document.addEventListener('contextmenu', disableRightClick);
      
      // Disable common dev tools shortcuts
      const disableDevTools = (e: KeyboardEvent) => {
        if (
          (e.ctrlKey && e.shiftKey && e.keyCode === 73) || // Ctrl+Shift+I
          (e.ctrlKey && e.shiftKey && e.keyCode === 67) || // Ctrl+Shift+C
          (e.keyCode === 123) // F12
        ) {
          e.preventDefault();
          return false;
        }
      };
      
      document.addEventListener('keydown', disableDevTools);
      
      return () => {
        document.removeEventListener('contextmenu', disableRightClick);
        document.removeEventListener('keydown', disableDevTools);
      };
    }
  }, []);

  useEffect(() => {
    // Apply centralized security headers
    applySecurityHeaders();

    // Development logging
    if (import.meta.env.DEV) {
      console.log('🔒 Security headers applied via centralized CSP configuration');
    }
  }, []);

  return <>{children}</>;
};

export default ProductionSecurityWrapper;