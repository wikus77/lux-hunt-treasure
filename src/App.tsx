
// 🔐 FIRMATO: BY JOSEPH MULÈ – CEO M1SSION KFT™
// M1SSION™ App Root - Custom Routing System (NO react-router-dom)
// Compatibilità Capacitor iOS al 100%

import React from 'react';
import { Toaster } from "sonner";
import { AuthProvider } from "./contexts/auth/AuthProvider";
import { SoundProvider } from "./contexts/SoundContext";
import { ErrorBoundary } from "./components/error/ErrorBoundary";
import { PageRenderer } from "./components/routing/PageRenderer";
import { SafeAreaToggle } from "./components/debug/SafeAreaToggle";
import ProductionSafety from "./components/debug/ProductionSafety";
import { IOSSafeAreaOverlay } from "./components/debug/IOSSafeAreaOverlay";

function App() {
  console.log("🚀 M1SSION App component rendering with custom routing...");
  
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
            <IOSSafeAreaOverlay>
              <PageRenderer />
              <Toaster position="top-center" richColors closeButton style={{ zIndex: 9999 }} />
            </IOSSafeAreaOverlay>
          </SafeAreaToggle>
        </AuthProvider>
      </SoundProvider>
    </ProductionSafety>
    </ErrorBoundary>
  );
}

export default App;
