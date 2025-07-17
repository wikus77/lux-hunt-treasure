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