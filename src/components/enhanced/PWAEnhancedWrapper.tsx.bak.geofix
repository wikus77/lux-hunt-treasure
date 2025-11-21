// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// PWA Enhanced Wrapper for Production Optimization

import React, { useEffect } from 'react';
import { initPerformanceOptimizations } from '@/utils/performanceOptimizer';
import ProductionSecurityWrapper from '@/components/security/ProductionSecurityWrapper';

interface PWAEnhancedWrapperProps {
  children: React.ReactNode;
}

export const PWAEnhancedWrapper: React.FC<PWAEnhancedWrapperProps> = ({ children }) => {
  useEffect(() => {
    // Initialize all performance optimizations on app start
    initPerformanceOptimizations();

    // iOS PWA specific optimizations
    if ((window.navigator as any).standalone) {
      document.body.classList.add('pwa-mode');
      
      // Prevent zoom on iOS PWA
      const viewport = document.querySelector('meta[name="viewport"]');
      if (viewport) {
        viewport.setAttribute('content', 
          'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
        );
      }
    }

    // Enhanced error boundary for production
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      // Send to error tracking service in production
    });

    // Memory pressure handling for mobile devices
    if ('memory' in performance) {
      const memoryInfo = (performance as any).memory;
      if (memoryInfo.usedJSHeapSize / memoryInfo.jsHeapSizeLimit > 0.9) {
        // Trigger garbage collection hint
        if ('gc' in window) {
          (window as any).gc();
        }
      }
    }
  }, []);

  return (
    <ProductionSecurityWrapper>
      {children}
    </ProductionSecurityWrapper>
  );
};

export default PWAEnhancedWrapper;