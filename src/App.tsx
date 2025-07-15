
// 🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™
// M1SSION™ App - iOS Capacitor Compatible WITHOUT react-router-dom

import React, { useEffect, useState } from 'react';
import { Toaster } from "sonner";
import { AuthProvider } from "./contexts/auth/AuthProvider";
import { SoundProvider } from "./contexts/SoundContext";
import { ErrorBoundary } from "./components/error/ErrorBoundary";
import NavigationManager from "./router/NavigationManager";
import PageRenderer from "./router/PageRenderer";
import { SafeAreaToggle } from "./components/debug/SafeAreaToggle";
import ProductionSafety from "./components/debug/ProductionSafety";
import { initializeCapacitorWithExplicitName, detectCapacitorEnvironment } from "./utils/capacitor";

function App() {
  console.log("🚀 App component rendering...");
  const [appReady, setAppReady] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log("🔄 Initializing M1SSION™ app...");
        
        if (detectCapacitorEnvironment()) {
          console.log("📱 Capacitor environment detected - initializing...");
          
          // Wait for Capacitor to be fully ready
          await new Promise(resolve => {
            if ((window as any).Capacitor) {
              resolve(true);
            } else {
              const checkCapacitor = () => {
                if ((window as any).Capacitor) {
                  resolve(true);
                } else {
                  setTimeout(checkCapacitor, 100);
                }
              };
              checkCapacitor();
            }
          });

          // Initialize Capacitor with proper splash screen handling
          const success = await initializeCapacitorWithExplicitName();
          if (!success) {
            throw new Error("Capacitor initialization failed");
          }
          
          // Add unified delay to ensure WebView is fully loaded
          await new Promise(resolve => setTimeout(resolve, 3000));
        } else {
          console.log("🌐 Web environment detected");
        }
        
        setAppReady(true);
        console.log("✅ M1SSION™ app initialization completed");
        
      } catch (error) {
        console.error("❌ App initialization error:", error);
        setInitError(error instanceof Error ? error.message : "Unknown initialization error");
        setAppReady(true); // Still show the app even if init failed
      }
    };

    initializeApp();
  }, []);

  // Show loading screen while app is initializing
  if (!appReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-m1ssion-blue mx-auto mb-4"></div>
          <p className="text-lg">Caricamento M1SSION™...</p>
          {initError && (
            <p className="text-red-400 text-sm mt-2">Errore: {initError}</p>
          )}
        </div>
      </div>
    );
  }
  
  return (
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
      <SoundProvider>
        <AuthProvider>
          <SafeAreaToggle>
            <PageRenderer>
              <NavigationManager />
            </PageRenderer>
            <Toaster position="top-center" richColors closeButton style={{ zIndex: 9999 }} />
          </SafeAreaToggle>
        </AuthProvider>
      </SoundProvider>
    </ProductionSafety>
    </ErrorBoundary>
  );
}

export default App;
