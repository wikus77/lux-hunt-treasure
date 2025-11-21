// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// PWA Loading Guard - Anti-black screen for iOS PWA with safe boot

import { useEffect, useState } from 'react';
import { initIOSPWASafeBoot, shouldShowUIImmediate } from '@/utils/iosPwaSafeBoot';

interface PWALoadingGuardProps {
  children: React.ReactNode;
  timeout?: number;
}

export const PWALoadingGuard: React.FC<PWALoadingGuardProps> = ({ 
  children, 
  timeout = 2500 
}) => {
  const [isReady, setIsReady] = useState(() => shouldShowUIImmediate());
  const [bootDiagnostics, setBootDiagnostics] = useState<any>(null);

  useEffect(() => {
    // Initialize iOS PWA safe boot
    const safeBoot = initIOSPWASafeBoot({
      debug: import.meta.env.VITE_SW_UPDATE_DEBUG === '1' || import.meta.env.DEV,
      maxWaitTime: 1500,
      fallbackTimeout: timeout
    });

    // Wait for safe boot to be ready
    const initSafeBoot = async () => {
      try {
        const ready = await safeBoot.waitForReady();
        setBootDiagnostics(safeBoot.getDiagnostics());
        
        if (!isReady) {
          setIsReady(true);
        }
        
        if (import.meta.env.DEV) {
          console.info('[PWA-GUARD] Safe boot completed:', {
            ready,
            diagnostics: safeBoot.getDiagnostics()
          });
        }
      } catch (error) {
        console.warn('[PWA-GUARD] Safe boot error, showing UI anyway:', error);
        setIsReady(true);
      }
    };

    initSafeBoot();

    // Additional safety timeout for extreme cases
    const emergencyTimeout = window.setTimeout(() => {
      if (!isReady) {
        console.info('[PWA-GUARD] Emergency timeout, showing UI');
        setIsReady(true);
      }
    }, timeout + 500);

    return () => {
      clearTimeout(emergencyTimeout);
    };
  }, [timeout, isReady]);

  // Show loading only if not ready and not iOS PWA (to prevent black screen)
  if (!isReady) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground font-orbitron">
            Inizializzazione M1SSION™...
          </p>
          {import.meta.env.DEV && bootDiagnostics && (
            <div className="text-xs text-muted-foreground mt-4">
              Boot: {bootDiagnostics.bootTime}ms | iOS PWA: {bootDiagnostics.isIOSPWA ? 'Yes' : 'No'}
            </div>
          )}
        </div>
      </div>
    );
  }

  return <>{children}</>;
};