// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// PWA Loading Guard - Prevents black screen on iOS PWA first launch

import { useEffect, useState } from 'react';

interface PWALoadingGuardProps {
  children: React.ReactNode;
  timeout?: number;
}

export const PWALoadingGuard: React.FC<PWALoadingGuardProps> = ({ 
  children, 
  timeout = 3000 
}) => {
  const [isReady, setIsReady] = useState(false);
  const [isTimedOut, setIsTimedOut] = useState(false);

  useEffect(() => {
    let timeoutId: number;
    let isControllerReady = false;

    const checkReadiness = () => {
      // Check if SW controller is ready or we're not in a SW environment
      const hasController = !!navigator.serviceWorker?.controller;
      const noSWSupport = !('serviceWorker' in navigator);
      
      if (hasController || noSWSupport || isTimedOut) {
        setIsReady(true);
        return true;
      }
      
      return false;
    };

    // Initial check
    if (checkReadiness()) {
      return;
    }

    // Set up timeout safety
    timeoutId = window.setTimeout(() => {
      console.info('[PWA-GUARD] Timeout reached, showing UI');
      setIsTimedOut(true);
      setIsReady(true);
    }, timeout);

    // Listen for SW controller change
    const handleControllerChange = () => {
      console.info('[PWA-GUARD] SW controller ready');
      isControllerReady = true;
      if (checkReadiness()) {
        clearTimeout(timeoutId);
      }
    };

    // Listen for DOMContentLoaded if not already fired
    const handleDOMReady = () => {
      console.info('[PWA-GUARD] DOM ready');
      setTimeout(() => {
        if (checkReadiness()) {
          clearTimeout(timeoutId);
        }
      }, 100);
    };

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', handleDOMReady);
    } else {
      handleDOMReady();
    }

    return () => {
      clearTimeout(timeoutId);
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
      }
      document.removeEventListener('DOMContentLoaded', handleDOMReady);
    };
  }, [timeout, isTimedOut]);

  if (!isReady) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground font-orbitron">
            Inizializzazione M1SSION™...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};