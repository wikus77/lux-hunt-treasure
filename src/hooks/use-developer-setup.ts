
import { useState, useEffect } from 'react';

interface DeveloperSetupResult {
  isSetupComplete: boolean;
  isLoading: boolean;
}

export const useDeveloperSetup = (): DeveloperSetupResult => {
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkDeveloperSetup = () => {
      try {
        // Check if we're in development environment
        const isDevelopment = window.location.hostname === 'localhost' || 
                             window.location.hostname.includes('lovable') ||
                             window.location.hostname.includes('lovableproject');
        
        // Check for stored developer credentials
        const storedEmail = localStorage.getItem('developer_user_email');
        const hasAccess = localStorage.getItem('developer_access') === 'granted';
        
        console.log('🔍 Developer setup check:', {
          isDevelopment,
          storedEmail,
          hasAccess,
          expectedEmail: 'wikus77@hotmail.it'
        });
        
        // Developer setup is complete if we have the right credentials
        const setupComplete = isDevelopment && 
                             storedEmail === 'wikus77@hotmail.it' && 
                             hasAccess;
        
        setIsSetupComplete(setupComplete);
        setIsLoading(false);
        
        if (setupComplete) {
          console.log('✅ Developer setup verified successfully');
        }
        
      } catch (error) {
        console.error('❌ Error checking developer setup:', error);
        setIsSetupComplete(false);
        setIsLoading(false);
      }
    };

    // Check immediately
    checkDeveloperSetup();
    
    // Also check when localStorage changes (in case user logs out/in)
    const handleStorageChange = () => {
      checkDeveloperSetup();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return {
    isSetupComplete,
    isLoading
  };
};
