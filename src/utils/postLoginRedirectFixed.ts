// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Fixed Post-Login Redirect Logic for M1SSION™

import { useLocation } from 'wouter';

export const usePostLoginRedirect = () => {
  const [, setLocation] = useLocation();

  const redirectAfterLogin = () => {
    console.log('🏠 POST-LOGIN REDIRECT: Navigating to /home');
    
    // Force navigate to home
    try {
      setLocation('/home');
      console.log('✅ Wouter navigation executed');
    } catch (error) {
      console.error('❌ Wouter navigation failed:', error);
      // Fallback to window.location
      window.location.href = '/home';
    }

    // Dispatch custom event for auth success
    const event = new CustomEvent('auth-success', {
      detail: { redirected: true, timestamp: Date.now() }
    });
    window.dispatchEvent(event);
  };

  return { redirectAfterLogin };
};

// Standalone function for use outside hooks
export const forceRedirectToHome = () => {
  console.log('🏠 FORCE REDIRECT TO HOME');
  
  // Method 1: Try programmatic navigation
  try {
    window.history.pushState(null, '', '/home');
    window.location.reload();
  } catch (error) {
    console.error('❌ History API failed:', error);
    // Method 2: Direct navigation
    window.location.href = '/home';
  }
};