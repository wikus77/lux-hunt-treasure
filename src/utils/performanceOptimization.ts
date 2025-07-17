// © 2025 Joseph MULÉ – CEO di NIYVORA KFT™
// M1SSION™ Performance Optimization Utilities

export interface PerformanceMetrics {
  navigationTime: number;
  renderTime: number;
  memoryUsage: number;
  loadTime: number;
}

export const measureNavigationTime = (): number => {
  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  return navigation.loadEventEnd - navigation.fetchStart;
};

export const measureRenderTime = (componentName: string, startTime: number): number => {
  const endTime = performance.now();
  const renderTime = endTime - startTime;
  console.log(`🎯 ${componentName} render time: ${renderTime.toFixed(2)}ms`);
  return renderTime;
};

export const getMemoryUsage = (): number => {
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    return Math.round(memory.usedJSHeapSize / 1024 / 1024 * 100) / 100; // MB
  }
  return 0;
};

export const optimizeImageLoading = (img: HTMLImageElement): void => {
  img.loading = 'lazy';
  img.decoding = 'async';
};

export const preloadCriticalAssets = (urls: string[]): void => {
  urls.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = url;
    if (url.includes('.js')) link.as = 'script';
    if (url.includes('.css')) link.as = 'style';
    if (url.includes('.png') || url.includes('.jpg') || url.includes('.webp')) link.as = 'image';
    document.head.appendChild(link);
  });
};

// © 2025 Joseph MULÉ – CEO di NIYVORA KFT™
// Ottimizzazione Mobile Avanzata
export const enableMobileOptimizations = (): void => {
  // Disabilita zoom su double tap
  const metaViewport = document.querySelector('meta[name="viewport"]');
  if (metaViewport) {
    metaViewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover');
  }
  
  // Ottimizza scrolling su iOS
  (document.body.style as any).webkitOverflowScrolling = 'touch';
  (document.body.style as any).overflowScrolling = 'touch';
  
  // Disabilita selezione testo non necessaria
  document.body.style.webkitUserSelect = 'none';
  document.body.style.userSelect = 'none';
  
  // Ottimizza rendering
  document.body.style.webkitTransform = 'translateZ(0)';
  document.body.style.transform = 'translateZ(0)';
  
  console.log('📱 Ottimizzazioni mobile abilitate al 100%');
};

// Gestione caricamento istantaneo pagine
export const enableInstantPageLoading = (): void => {
  // Preload dei componenti critici
  const criticalRoutes = ['/dashboard', '/map', '/profile', '/leaderboard', '/notifications'];
  
  criticalRoutes.forEach(route => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = route;
    document.head.appendChild(link);
  });
  
  // Cache aggressive per assets
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      console.log('📦 Service Worker non disponibile');
    });
  }
  
  console.log('⚡ Caricamento istantaneo pagine attivato');
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let lastFunc: NodeJS.Timeout;
  let lastRan: number;
  return (...args: Parameters<T>) => {
    if (!lastRan) {
      func(...args);
      lastRan = Date.now();
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(() => {
        if ((Date.now() - lastRan) >= limit) {
          func(...args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  };
};

export const usePerformanceMonitor = (componentName: string) => {
  const startTime = performance.now();
  
  const logPerformance = () => {
    const renderTime = measureRenderTime(componentName, startTime);
    const memoryUsage = getMemoryUsage();
    
    console.log(`📊 ${componentName} Performance:`, {
      renderTime: `${renderTime.toFixed(2)}ms`,
      memoryUsage: `${memoryUsage}MB`,
      timestamp: new Date().toISOString()
    });
  };
  
  React.useEffect(() => {
    logPerformance();
  }, []);
  
  return { logPerformance };
};

// React import for useEffect
import React from 'react';