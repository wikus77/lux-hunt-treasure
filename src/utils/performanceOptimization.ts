// © 2025 Joseph MULÉ – CEO di NIYVORA KFT™
// Performance optimization utilities for M1SSION™ PWA

import { useCallback, useRef, useEffect } from 'react';

// Debounce utility for performance optimization
export const useDebounce = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T => {
  const timeoutRef = useRef<NodeJS.Timeout>();

  return useCallback(
    ((...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    }) as T,
    [callback, delay]
  );
};

// Throttle utility for scroll and resize events
export const useThrottle = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T => {
  const lastCall = useRef<number>(0);

  return useCallback(
    ((...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastCall.current >= delay) {
        lastCall.current = now;
        callback(...args);
      }
    }) as T,
    [callback, delay]
  );
};

// Intersection Observer hook for lazy loading
export const useIntersectionObserver = (
  callback: (isIntersecting: boolean) => void,
  options?: IntersectionObserverInit
) => {
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        callback(entry.isIntersecting);
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [callback, options]);

  return elementRef;
};

// Image preloader utility
export const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
};

// Component performance monitoring
export const usePerformanceMonitor = (componentName: string) => {
  const renderStart = useRef<number>(Date.now());
  const renderCount = useRef<number>(0);

  useEffect(() => {
    renderCount.current++;
    const renderTime = Date.now() - renderStart.current;
    
    if (renderTime > 100) {
      console.warn(`⚠️ Slow render detected in ${componentName}: ${renderTime}ms (render #${renderCount.current})`);
    }
    
    renderStart.current = Date.now();
  });

  return {
    renderCount: renderCount.current,
    markRenderStart: () => {
      renderStart.current = Date.now();
    }
  };
};

// Memory cleanup utility
export const useMemoryCleanup = (dependencies: any[] = []) => {
  useEffect(() => {
    return () => {
      // Force garbage collection if available (development only)
      if (process.env.NODE_ENV === 'development' && (window as any).gc) {
        (window as any).gc();
      }
    };
  }, dependencies);
};