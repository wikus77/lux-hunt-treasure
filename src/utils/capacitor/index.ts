// M1SSION™ - Main Capacitor Utilities Export
// This file re-exports all Capacitor utilities maintaining the same API

// Core utilities
export { preserveFunctionName, detectCapacitorEnvironment } from './core';

// Navigation utilities
export { explicitNavigationHandler, explicitAuthHandler } from './navigation';

// Device utilities
export { getSafeAreaInsets, getDeviceOrientation } from './device';

// Style utilities
export { applySafeAreaStyles } from './styles';

// Hardware utilities
export { handleHardwareBackButton } from './hardware';

// Initialization utilities
export { initializeCapacitorWithExplicitName } from './initialization';

// WebView optimization utilities
export { optimizeWebViewPerformance, preventWebViewHangs } from './webViewOptimization';

console.log('✅ M1SSION Capacitor utilities suite loaded');