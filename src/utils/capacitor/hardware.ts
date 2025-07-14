// M1SSION™ - Hardware Capacitor Utilities
import { preserveFunctionName, detectCapacitorEnvironment } from './core';

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

console.log('✅ M1SSION Hardware Capacitor utilities loaded');