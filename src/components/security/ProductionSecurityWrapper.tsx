// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Production Security Wrapper with Enhanced Protection

import React, { useEffect } from 'react';

interface ProductionSecurityWrapperProps {
  children: React.ReactNode;
}

export const ProductionSecurityWrapper: React.FC<ProductionSecurityWrapperProps> = ({ children }) => {
  useEffect(() => {
    // Disable right-click context menu in production
    if (process.env.NODE_ENV === 'production') {
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
    // Content Security Policy enforcement
    const meta = document.createElement('meta');
    meta.httpEquiv = 'Content-Security-Policy';
    meta.content = "default-src 'self'; script-src 'self' 'unsafe-inline' https://js.stripe.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://api.stripe.com https://*.supabase.co;";
    document.head.appendChild(meta);

    return () => {
      document.head.removeChild(meta);
    };
  }, []);

  return <>{children}</>;
};

export default ProductionSecurityWrapper;