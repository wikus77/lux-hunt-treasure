// M1SSION™ - iOS Capacitor Utility Functions
import { NavigateFunction } from 'react-router-dom';

// Critical: Preserve function names for iOS minification compatibility
export const preserveFunctionName = <T extends (...args: any[]) => any>(
  fn: T, 
  name: string
): T => {
  Object.defineProperty(fn, 'name', { value: name, configurable: true });
  return fn;
};

// Explicit navigation handler for iOS Capacitor
export const explicitNavigationHandler = preserveFunctionName(
  (path: string, navigate: NavigateFunction) => {
    console.log('🧭 Explicit navigation to:', path);
    
    try {
      // Handle special routes with explicit logic
      if (path === '/home') {
        navigate('/home', { replace: false });
      } else if (path === '/map') {
        navigate('/map', { replace: false });
      } else if (path === '/buzz') {
        navigate('/buzz', { replace: false });
      } else if (path === '/games') {
        navigate('/games', { replace: false });
      } else if (path === '/profile') {
        navigate('/profile', { replace: false });
      } else if (path === '/settings') {
        navigate('/settings', { replace: false });
      } else if (path === '/notifications') {
        navigate('/notifications', { replace: false });
      } else if (path === '/leaderboard') {
        navigate('/leaderboard', { replace: false });
      } else {
        // Default navigation
        navigate(path, { replace: false });
      }
      
      console.log('✅ Navigation completed successfully');
    } catch (error) {
      console.error('❌ Navigation error:', error);
      // Fallback navigation
      navigate('/home', { replace: true });
    }
  },
  'explicitNavigationHandler'
);

// Explicit authentication handler for iOS Capacitor
export const explicitAuthHandler = preserveFunctionName(
  (action: 'login' | 'logout' | 'register', navigate: NavigateFunction) => {
    console.log('🔐 Explicit auth action:', action);
    
    try {
      switch (action) {
        case 'login':
          navigate('/login', { replace: false });
          break;
        case 'logout':
          // Clear any stored data
          localStorage.removeItem('m1ssion-intro-completed');
          navigate('/', { replace: true });
          break;
        case 'register':
          navigate('/register', { replace: false });
          break;
        default:
          console.warn('⚠️ Unknown auth action:', action);
          navigate('/', { replace: true });
      }
      
      console.log('✅ Auth navigation completed');
    } catch (error) {
      console.error('❌ Auth navigation error:', error);
      navigate('/', { replace: true });
    }
  },
  'explicitAuthHandler'
);

// Capacitor environment detection with explicit function name
export const detectCapacitorEnvironment = preserveFunctionName(
  (): boolean => {
    if (typeof window === 'undefined') return false;
    
    // Multiple detection methods for reliability
    const hasCapacitor = !!(window as any).Capacitor;
    const isCapacitorProtocol = window.location.protocol === 'capacitor:';
    const hasCapacitorGlobal = typeof (window as any).Capacitor !== 'undefined';
    
    const isCapacitor = hasCapacitor || isCapacitorProtocol || hasCapacitorGlobal;
    
    console.log('📱 Capacitor Environment Detection:', {
      hasCapacitor,
      isCapacitorProtocol,
      hasCapacitorGlobal,
      result: isCapacitor,
      userAgent: navigator.userAgent
    });
    
    return isCapacitor;
  },
  'detectCapacitorEnvironment'
);

// Safe area utilities for iOS
export const getSafeAreaInsets = preserveFunctionName(
  () => {
    if (typeof window === 'undefined') {
      return { top: 0, bottom: 0, left: 0, right: 0 };
    }
    
    // Get CSS environment variables for safe area
    const getInset = (side: string) => {
      const value = getComputedStyle(document.documentElement)
        .getPropertyValue(`--safe-area-inset-${side}`)
        .trim();
      
      if (value && value !== 'env(safe-area-inset-${side})') {
        return parseInt(value.replace('px', '')) || 0;
      }
      
      // Fallback values for different iOS devices
      if (detectCapacitorEnvironment()) {
        switch (side) {
          case 'top': return 44; // Status bar height
          case 'bottom': return 34; // Home indicator height
          case 'left':
          case 'right': return 0;
          default: return 0;
        }
      }
      
      return 0;
    };
    
    return {
      top: getInset('top'),
      bottom: getInset('bottom'),
      left: getInset('left'),
      right: getInset('right')
    };
  },
  'getSafeAreaInsets'
);

// Device orientation utilities
export const getDeviceOrientation = preserveFunctionName(
  () => {
    if (typeof window === 'undefined') return 'portrait';
    
    // Use screen.orientation if available
    if (window.screen?.orientation) {
      return window.screen.orientation.type;
    }
    
    // Fallback to window orientation
    const orientation = (window as any).orientation;
    if (typeof orientation === 'number') {
      return Math.abs(orientation) === 90 ? 'landscape' : 'portrait';
    }
    
    // Final fallback using window dimensions
    return window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
  },
  'getDeviceOrientation'
);

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

// Hardware back button handler for Android
export const handleHardwareBackButton = preserveFunctionName(
  (onBack: () => void) => {
    if (!detectCapacitorEnvironment()) return () => {};
    
    const { App } = (window as any).Capacitor || {};
    if (!App) return () => {};
    
    const listener = App.addListener('backButton', (data: any) => {
      console.log('🔙 Hardware back button pressed');
      onBack();
    });
    
    return () => {
      if (listener && listener.remove) {
        listener.remove();
      }
    };
  },
  'handleHardwareBackButton'
);

// Initialize Capacitor with explicit function name
export const initializeCapacitorWithExplicitName = preserveFunctionName(
  async () => {
    if (!detectCapacitorEnvironment()) {
      console.log('📱 Web environment detected - Capacitor not initialized');
      return false;
    }
    
    console.log('📱 Initializing Capacitor for mobile environment...');
    
    try {
      const { SplashScreen, StatusBar, Keyboard } = (window as any).Capacitor;
      
      // Configure status bar
      if (StatusBar) {
        await StatusBar.setStyle({ style: 'dark' });
        await StatusBar.setBackgroundColor({ color: '#000000' });
        console.log('✅ Status bar configured');
      }
      
      // Configure keyboard
      if (Keyboard) {
        await Keyboard.setAccessoryBarVisible({ isVisible: false });
        console.log('✅ Keyboard configured');
      }
      
      // Apply safe area styles
      applySafeAreaStyles();
      
      // Hide splash screen
      if (SplashScreen) {
        await SplashScreen.hide();
        console.log('✅ Splash screen hidden');
      }
      
      console.log('✅ Capacitor initialization completed');
      return true;
      
    } catch (error) {
      console.error('❌ Capacitor initialization error:', error);
      return false;
    }
  },
  'initializeCapacitorWithExplicitName'
);

console.log('✅ M1SSION iOS Capacitor functions loaded');