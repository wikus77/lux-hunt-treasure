// © 2025 Joseph MULÉ – CEO di NIYVORA KFT™ – M1SSION™
import React from 'react';
import { Router } from 'wouter';
import { Toaster } from "./components/ui/sonner";
import { AuthProvider } from "./contexts/auth/AuthProvider";
import { SoundProvider } from "./contexts/SoundContext";
import { ErrorBoundary } from "./components/error/ErrorBoundary";
import { XpSystemManager } from "./components/xp/XpSystemManager";
import { HelmetProvider } from "./components/helmet/HelmetProvider";
import SkipToContent from "./components/accessibility/SkipToContent";
import OfflineIndicator from "./components/offline/OfflineIndicator";
import WouterRoutes from "./routes/WouterRoutes";
import ProductionSafety from "./components/debug/ProductionSafety";
import { InstallPrompt } from "./components/pwa/InstallPrompt";
// OneSignal rimosso - usando solo FCM
import { IOSPermissionManager } from "./components/IOSPermissionManager";
import { AndroidPushSetup } from "./components/android/AndroidPushSetup";
import { PushNotificationSetup } from "./components/PushNotificationSetup";
import { useUnifiedAuth } from "./hooks/useUnifiedAuth";
import BuzzPaymentMonitor from "./components/payment/BuzzPaymentMonitor";
import { usePWAStabilizer } from "./hooks/usePWAStabilizer";
import { useState, useEffect } from "react";

import LegalOnboarding from "./components/legal/LegalOnboarding";

function App() {
  // Register service worker on app start
  useEffect(() => {
    const registerServiceWorker = async () => {
      if ('serviceWorker' in navigator) {
        try {
          // SW registration is now handled by dedicated utils, skip duplicate registration
          console.log('✅ Service worker registration delegated to SW utils');
          
          // Wait for service worker to be ready
          await navigator.serviceWorker.ready;
          console.log('✅ Service worker is ready');
        } catch (error) {
          console.error('❌ Service worker registration failed:', error);
        }
      } else {
        console.warn('⚠️ Service worker not supported in this browser');
      }
    };

    registerServiceWorker();
  }, []);

  // Debug iOS rendering issue - essential for troubleshooting black screen
  useEffect(() => {
    console.log('🍎 [iOS DEBUG] App rendering started');
    console.log('🍎 [iOS DEBUG] Environment:', {
      userAgent: navigator.userAgent,
      isStandalone: window.matchMedia('(display-mode: standalone)').matches,
      protocol: window.location.protocol,
      viewport: { width: window.innerWidth, height: window.innerHeight },
      pathname: window.location.pathname,
      timestamp: new Date().toISOString()
    });
    
    // Check if required CSS variables are available
    const testDiv = document.createElement('div');
    document.body.appendChild(testDiv);
    testDiv.style.cssText = 'background: hsl(var(--background)); color: hsl(var(--foreground));';
    const computedStyle = window.getComputedStyle(testDiv);
    console.log('🍎 [iOS DEBUG] CSS Variables:', {
      background: computedStyle.backgroundColor,
      color: computedStyle.color,
      hasBackground: computedStyle.backgroundColor !== 'rgba(0, 0, 0, 0)',
      hasColor: computedStyle.color !== 'rgba(0, 0, 0, 0)'
    });
    document.body.removeChild(testDiv);
    
    // Apply iOS emergency fallback if CSS variables are broken
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    
    if (isIOS && isStandalone && (
      computedStyle.backgroundColor === 'rgba(0, 0, 0, 0)' || 
      computedStyle.color === 'rgba(0, 0, 0, 0)'
    )) {
      console.log('🍎 [iOS DEBUG] Applying emergency fallback for broken CSS variables');
      document.documentElement.classList.add('ios-pwa-fallback');
    }
  }, []);
  
  // Initialize PWA stabilizer (prevents reload loops and manages push)
  usePWAStabilizer();

  
  return (
    <div className="app-shell">
      <div className="ios-safe-top"></div>
      <ErrorBoundary fallback={
        <div className="min-h-screen flex items-center justify-center bg-black text-white p-4">
          <div className="glass-card p-6 max-w-md mx-auto text-center">
            <h2 className="text-xl font-bold mb-4">ERRORE CRITICO DI SISTEMA</h2>
            <p className="mb-6">L'applicazione ha riscontrato un errore fatale. Ricarica la pagina.</p>
            <button 
              onClick={() => {
                // Clear all storage and reload
                localStorage.clear();
                sessionStorage.clear();
                window.location.reload();
              }}
              className="px-4 py-2 bg-gradient-to-r from-m1ssion-blue to-m1ssion-pink rounded-md"
            >
              🔄 RIAVVIA EMERGENZA
            </button>
          </div>
        </div>
      }>
        <ProductionSafety>
          <HelmetProvider>
            <SkipToContent />
            <OfflineIndicator />
            <Router>
              <SoundProvider>
                <AuthProvider>
                {/* OneSignal rimosso - usando solo FCM */}
                <BuzzPaymentMonitor />
                <LegalOnboarding />
                <WouterRoutes />
                <InstallPrompt />
                <IOSPermissionManager />
                <AndroidPushSetup className="hidden" />
                <PushNotificationSetup className="hidden" />
                <XpSystemManager />
                <Toaster />
                </AuthProvider>
              </SoundProvider>
            </Router>
          </HelmetProvider>
        </ProductionSafety>
      </ErrorBoundary>
    </div>
  );
}

export default App;