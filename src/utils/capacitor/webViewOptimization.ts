// M1SSION™ - WebView Optimization for Capacitor iOS
// 🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™

import { detectCapacitorEnvironment } from './core';

// WebView performance optimization
export const optimizeWebViewPerformance = () => {
  if (!detectCapacitorEnvironment()) {
    console.log('📱 Web environment - WebView optimization skipped');
    return;
  }

  console.log('🚀 Optimizing WebView performance for iOS...');

  try {
    // Optimize CSS rendering for mobile WebView
    const style = document.createElement('style');
    style.textContent = `
      /* iOS WebView performance optimizations */
      * {
        -webkit-transform: translateZ(0);
        -webkit-backface-visibility: hidden;
        -webkit-perspective: 1000;
      }
      
      /* Smooth scrolling for iOS */
      html, body {
        -webkit-overflow-scrolling: touch;
        scroll-behavior: smooth;
      }
      
      /* Reduce paint complexity */
      .glass-card, .animate-pulse, .animate-spin {
        transform: translateZ(0);
        will-change: transform;
      }
      
      /* Optimize transitions */
      .transition-all {
        -webkit-transition: all 0.3s ease;
        transition: all 0.3s ease;
      }
    `;
    document.head.appendChild(style);

    // Prevent zoom on iOS
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      viewport.setAttribute('content', 
        'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover'
      );
    }

    // Preload critical resources
    const linkPrefetch = document.createElement('link');
    linkPrefetch.rel = 'prefetch';
    linkPrefetch.href = 'https://vkjrqirvdvjbemsfzxof.supabase.co';
    document.head.appendChild(linkPrefetch);

    // Memory management for large lists
    (window as any).addEventListener('memorywarning', () => {
      console.log('⚠️ Memory warning received - cleaning up...');
      // Force garbage collection if available
      if ((window as any).gc) {
        (window as any).gc();
      }
    });

    console.log('✅ WebView performance optimization completed');

  } catch (error) {
    console.error('❌ WebView optimization error:', error);
  }
};

// Prevent WebView hangs
export const preventWebViewHangs = () => {
  if (!detectCapacitorEnvironment()) return;

  console.log('🔧 Implementing WebView hang prevention...');

  // Detect and recover from unresponsive states
  let lastInteraction = Date.now();
  let hangTimer: NodeJS.Timeout;

  const resetHangTimer = () => {
    lastInteraction = Date.now();
    clearTimeout(hangTimer);
    
    hangTimer = setTimeout(() => {
      const timeSinceLastInteraction = Date.now() - lastInteraction;
      if (timeSinceLastInteraction > 30000) { // 30 seconds
        console.warn('⚠️ Potential WebView hang detected - attempting recovery...');
        
        // Force a small DOM update to refresh the WebView
        document.body.style.transform = 'translateZ(0)';
        setTimeout(() => {
          document.body.style.transform = '';
        }, 100);
      }
    }, 30000);
  };

  // Track user interactions
  ['touchstart', 'touchmove', 'scroll', 'click'].forEach(event => {
    document.addEventListener(event, resetHangTimer, { passive: true });
  });

  resetHangTimer();

  console.log('✅ WebView hang prevention activated');
};

console.log('✅ M1SSION WebView Optimization utilities loaded');