// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Enhanced Security Wrapper Component

import React, { useEffect } from 'react';

interface SecurityWrapperProps {
  children: React.ReactNode;
}

export const SecurityWrapper: React.FC<SecurityWrapperProps> = ({ children }) => {
  useEffect(() => {
    // Content Security Policy enforcement
    const meta = document.createElement('meta');
    meta.httpEquiv = 'Content-Security-Policy';
    meta.content = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://js.stripe.com https://maps.googleapis.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: blob: https: *.googleapis.com *.gstatic.com",
      "font-src 'self' https://fonts.gstatic.com",
      "connect-src 'self' https://*.supabase.co https://api.stripe.com https://maps.googleapis.com",
      "frame-src 'self' https://js.stripe.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'"
    ].join('; ');
    
    document.head.appendChild(meta);

    // Additional security headers
    const addSecurityHeaders = () => {
      // X-Content-Type-Options
      const noSniff = document.createElement('meta');
      noSniff.httpEquiv = 'X-Content-Type-Options';
      noSniff.content = 'nosniff';
      document.head.appendChild(noSniff);

      // X-Frame-Options
      const frameOptions = document.createElement('meta');
      frameOptions.httpEquiv = 'X-Frame-Options';
      frameOptions.content = 'DENY';
      document.head.appendChild(frameOptions);

      // X-XSS-Protection
      const xssProtection = document.createElement('meta');
      xssProtection.httpEquiv = 'X-XSS-Protection';
      xssProtection.content = '1; mode=block';
      document.head.appendChild(xssProtection);

      // Referrer Policy
      const referrerPolicy = document.createElement('meta');
      referrerPolicy.name = 'referrer';
      referrerPolicy.content = 'strict-origin-when-cross-origin';
      document.head.appendChild(referrerPolicy);
    };

    addSecurityHeaders();

    // Cleanup function
    return () => {
      // Remove added meta tags on unmount
      const metaTags = document.querySelectorAll('meta[http-equiv]');
      metaTags.forEach(tag => {
        if (tag.getAttribute('http-equiv')?.startsWith('Content-Security-Policy') ||
            tag.getAttribute('http-equiv')?.startsWith('X-')) {
          tag.remove();
        }
      });
    };
  }, []);

  // Disable right-click and keyboard shortcuts in production
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      const disableRightClick = (e: MouseEvent) => {
        e.preventDefault();
        return false;
      };
      
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
      
      document.addEventListener('contextmenu', disableRightClick);
      document.addEventListener('keydown', disableDevTools);
      
      return () => {
        document.removeEventListener('contextmenu', disableRightClick);
        document.removeEventListener('keydown', disableDevTools);
      };
    }
  }, []);

  return <>{children}</>;
};

export default SecurityWrapper;