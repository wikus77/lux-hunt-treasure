// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Performance Optimization Utilities

import { onCLS, onFCP, onLCP, onTTFB } from 'web-vitals';

// Web Vitals monitoring
export const initializePerformanceMonitoring = () => {
  if (typeof window === 'undefined') return;

  const sendToAnalytics = (metric: any) => {
    // Send to analytics service (Plausible, Google Analytics, etc.)
    console.log('Performance metric:', metric);
    
    // Send to Plausible if available
    if (window.plausible) {
      window.plausible('Web Vital', {
        props: {
          metric_name: metric.name,
          metric_value: metric.value,
          metric_rating: metric.rating
        }
      });
    }
  };

  // Core Web Vitals
  onCLS(sendToAnalytics);
  onFCP(sendToAnalytics);
  onLCP(sendToAnalytics);
  onTTFB(sendToAnalytics);
};

// Image optimization helper
export const optimizeImage = (url: string, width?: number, height?: number, quality: number = 80): string => {
  // If it's already a data URL or blob, return as-is
  if (url.startsWith('data:') || url.startsWith('blob:')) {
    return url;
  }

  // For external images, you could use a service like Cloudinary or ImageKit
  // For now, return the original URL
  return url;
};

// Lazy loading intersection observer
export const createLazyLoadObserver = (callback: (entries: IntersectionObserverEntry[]) => void) => {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    return null;
  }

  return new IntersectionObserver(callback, {
    rootMargin: '50px',
    threshold: 0.1
  });
};

// Memory optimization
export const clearUnusedResources = () => {
  // Clear unused images from memory
  const images = document.querySelectorAll('img[data-lazy-loaded="true"]');
  images.forEach((img) => {
    const rect = img.getBoundingClientRect();
    const isVisible = rect.top < window.innerHeight + 1000 && rect.bottom > -1000;
    
    if (!isVisible) {
      // Unload image if far from viewport
      (img as HTMLImageElement).src = '';
    }
  });

  // Force garbage collection if available (development only)
  if (process.env.NODE_ENV === 'development' && (window as any).gc) {
    (window as any).gc();
  }
};

// Bundle size analyzer helper
export const logBundleInfo = () => {
  if (process.env.NODE_ENV === 'development') {
    console.log('Bundle analysis:', {
      'Total Scripts': document.scripts.length,
      'Total Stylesheets': document.styleSheets.length,
      'Performance Entries': performance.getEntriesByType('navigation'),
      'Memory': (performance as any).memory ? {
        'Used JS Heap Size': ((performance as any).memory.usedJSHeapSize / 1024 / 1024).toFixed(2) + ' MB',
        'Total JS Heap Size': ((performance as any).memory.totalJSHeapSize / 1024 / 1024).toFixed(2) + ' MB'
      } : 'Not available'
    });
  }
};

// Service Worker update notifier
export const checkForSWUpdate = async () => {
  if (!('serviceWorker' in navigator)) return;

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New content available
              console.log('New app version available');
              
              // Show update notification
              if (window.confirm('Nuova versione disponibile. Ricaricare?')) {
                window.location.reload();
              }
            }
          });
        }
      });
    }
  } catch (error) {
    console.error('Service Worker check failed:', error);
  }
};

// Declare global for TypeScript
declare global {
  interface Window {
    plausible?: (event: string, options?: { props?: Record<string, any> }) => void;
  }
}