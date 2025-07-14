// M1SSION™ - Navigation Capacitor Utilities
import { NavigateFunction } from 'react-router-dom';
import { preserveFunctionName } from './core';

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

console.log('✅ M1SSION Navigation Capacitor utilities loaded');