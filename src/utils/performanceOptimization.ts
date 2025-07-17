// © 2025 Joseph MULÉ – CEO di NIYVORA KFT™
import { useEffect, useState, useCallback } from 'react';

// Performance monitoring utilities
export const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = useState({
    navigationTime: 0,
    loadTime: 0,
    memoryUsage: 0
  });

  useEffect(() => {
    // Monitor navigation performance
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.entryType === 'navigation') {
          const navEntry = entry as PerformanceNavigationTiming;
          setMetrics(prev => ({
            ...prev,
            navigationTime: navEntry.loadEventEnd - navEntry.fetchStart,
            loadTime: navEntry.domContentLoadedEventEnd - navEntry.fetchStart
          }));
        }
      });
    });

    observer.observe({ entryTypes: ['navigation'] });

    // Monitor memory usage if available
    if ('memory' in performance) {
      const updateMemory = () => {
        const memory = (performance as any).memory;
        setMetrics(prev => ({
          ...prev,
          memoryUsage: memory.usedJSHeapSize / memory.totalJSHeapSize * 100
        }));
      };
      
      const interval = setInterval(updateMemory, 5000);
      return () => {
        clearInterval(interval);
        observer.disconnect();
      };
    }

    return () => observer.disconnect();
  }, []);

  return metrics;
};

// Preload critical resources
export const preloadCriticalResources = () => {
  useEffect(() => {
    // Preload M1 logo
    const logoImg = new Image();
    logoImg.src = '/src/assets/m1-logo.png';
    
    // Preload critical fonts
    const fontLink = document.createElement('link');
    fontLink.rel = 'preload';
    fontLink.as = 'font';
    fontLink.type = 'font/woff2';
    fontLink.crossOrigin = 'anonymous';
    fontLink.href = '/fonts/orbitron.woff2';
    document.head.appendChild(fontLink);

    return () => {
      document.head.removeChild(fontLink);
    };
  }, []);
};

// Optimized debounce for performance-critical operations
export const useOptimizedDebounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): T => {
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  return useCallback(
    ((...args: Parameters<T>) => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      
      const newTimer = setTimeout(() => {
        func(...args);
      }, delay);
      
      setDebounceTimer(newTimer);
    }) as T,
    [func, delay, debounceTimer]
  );
};

// Performance report generator
export const generatePerformanceReport = () => {
  const report = {
    timestamp: new Date().toISOString(),
    performance: {
      navigation: performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming,
      memory: 'memory' in performance ? (performance as any).memory : null,
      resources: performance.getEntriesByType('resource').length
    },
    userAgent: navigator.userAgent,
    connection: 'connection' in navigator ? (navigator as any).connection : null
  };

  return report;
};