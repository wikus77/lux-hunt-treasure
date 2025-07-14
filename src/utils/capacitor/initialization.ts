// M1SSION™ - Initialization Capacitor Utilities
import { preserveFunctionName, detectCapacitorEnvironment } from './core';
import { applySafeAreaStyles } from './styles';

// Unified splash screen timeout
const SPLASH_TIMEOUT = 3000;

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
      
      // Hide splash screen with unified timing
      if (SplashScreen) {
        console.log('🔄 Hiding Capacitor splash screen...');
        try {
          // Wait for the unified timeout before hiding
          setTimeout(async () => {
            await SplashScreen.hide();
            console.log('✅ Capacitor splash screen hidden successfully');
          }, SPLASH_TIMEOUT);
        } catch (splashError) {
          console.warn('⚠️ Splash screen hide warning:', splashError);
          // Continue even if splash screen hiding fails
        }
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

console.log('✅ M1SSION Initialization Capacitor utilities loaded');