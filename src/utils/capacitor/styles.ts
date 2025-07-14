// M1SSION™ - Styles Capacitor Utilities
import { preserveFunctionName, detectCapacitorEnvironment } from './core';

// iOS safe area CSS application
export const applySafeAreaStyles = preserveFunctionName(
  () => {
    if (!detectCapacitorEnvironment()) return;
    
    const style = document.createElement('style');
    style.id = 'm1ssion-safe-area-styles';
    
    // Remove existing styles
    const existingStyle = document.getElementById('m1ssion-safe-area-styles');
    if (existingStyle) {
      existingStyle.remove();
    }
    
    style.textContent = `
      :root {
        --safe-area-inset-top: env(safe-area-inset-top, 44px);
        --safe-area-inset-bottom: env(safe-area-inset-bottom, 34px);
        --safe-area-inset-left: env(safe-area-inset-left, 0px);
        --safe-area-inset-right: env(safe-area-inset-right, 0px);
      }
      
      .safe-area-top {
        padding-top: var(--safe-area-inset-top);
      }
      
      .safe-area-bottom {
        padding-bottom: var(--safe-area-inset-bottom);
      }
      
      .safe-area-left {
        padding-left: var(--safe-area-inset-left);
      }
      
      .safe-area-right {
        padding-right: var(--safe-area-inset-right);
      }
      
      .safe-area-all {
        padding-top: var(--safe-area-inset-top);
        padding-bottom: var(--safe-area-inset-bottom);
        padding-left: var(--safe-area-inset-left);
        padding-right: var(--safe-area-inset-right);
      }
      
      /* iOS specific overscroll behavior */
      body {
        overscroll-behavior: none;
        -webkit-overflow-scrolling: touch;
      }
      
      /* Prevent zoom on input focus */
      input, textarea, select {
        font-size: 16px !important;
      }
    `;
    
    document.head.appendChild(style);
    console.log('✅ Safe area styles applied');
  },
  'applySafeAreaStyles'
);

console.log('✅ M1SSION Styles Capacitor utilities loaded');