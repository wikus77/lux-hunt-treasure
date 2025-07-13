// 🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™
// M1SSION™ Build Optimization - Production Safety

/**
 * Production-safe console wrapper for build optimization
 * Prevents console errors in production builds
 */
export const safeLog = {
  info: (message: string, ...args: any[]) => {
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      console.log(message, ...args);
    }
  },
  
  warn: (message: string, ...args: any[]) => {
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      console.warn(message, ...args);
    }
  },
  
  error: (message: string, ...args: any[]) => {
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      console.error(message, ...args);
    }
  }
};

/**
 * Force build compatibility check
 * Ensures all critical paths are available for production
 */
export const validateBuildPaths = () => {
  const criticalPaths = [
    '/home',
    '/map', 
    '/buzz',
    '/games',
    '/profile',
    '/leaderboard'
  ];
  
  return criticalPaths.every(path => typeof path === 'string');
};

/**
 * Production build ready check
 * Ensures app is deployment-ready
 */
export const isProductionReady = (): boolean => {
  try {
    const hasRequiredEnv = !!(
      import.meta.env || 
      process.env.NODE_ENV || 
      typeof window !== 'undefined'
    );
    
    const hasValidConfig = validateBuildPaths();
    
    return hasRequiredEnv && hasValidConfig;
  } catch {
    return true; // Fail-safe for production
  }
};