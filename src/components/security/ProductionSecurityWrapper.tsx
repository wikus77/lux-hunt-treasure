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
    // Enhanced Content Security Policy with proper Google Maps support
    const meta = document.createElement('meta');
    meta.httpEquiv = 'Content-Security-Policy';
    meta.content = "default-src 'self'; script-src 'self' 'unsafe-inline' https://js.stripe.com https://maps.googleapis.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https://api.stripe.com https://*.supabase.co https://maps.googleapis.com https://sentry.io https://*.ingest.sentry.io; frame-src https://js.stripe.com;";
    document.head.appendChild(meta);

    // Add additional security headers via meta tags (fallback for missing server headers)
    const addSecurityHeader = (httpEquiv: string, content: string) => {
      const existingMeta = document.querySelector(`meta[http-equiv="${httpEquiv}"]`);
      if (!existingMeta) {
        const meta = document.createElement('meta');
        meta.httpEquiv = httpEquiv;
        meta.content = content;
        document.head.appendChild(meta);
        return meta;
      }
      return null;
    };

    const securityMetas = [
      addSecurityHeader('X-Content-Type-Options', 'nosniff'),
      addSecurityHeader('X-Frame-Options', 'DENY'),
      addSecurityHeader('Referrer-Policy', 'no-referrer'),
    ].filter(Boolean);

    // TODO: Move CSP to server-side headers for better security
    if (import.meta.env.DEV) {
      console.log('🔒 Client-side security headers applied (transitional)');
    }

    return () => {
      try {
        document.head.removeChild(meta);
        securityMetas.forEach(meta => meta && document.head.removeChild(meta));
      } catch (e) {
        // Meta tags may have been removed already
      }
    };
  }, []);

  return <>{children}</>;
};

export default ProductionSecurityWrapper;