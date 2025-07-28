
// © 2025 Joseph MULÉ – CEO di NIYVORA KFT™ – M1SSION™
import React from 'react';
import { Router } from 'wouter';
import { Toaster } from "sonner";
import { AuthProvider } from "./contexts/auth/AuthProvider";
import { SoundProvider } from "./contexts/SoundContext";
import { ErrorBoundary } from "./components/error/ErrorBoundary";
import WouterRoutes from "./routes/WouterRoutes";
import ProductionSafety from "./components/debug/ProductionSafety";
import { InstallPrompt } from "./components/pwa/InstallPrompt";
import PushSetup from "./components/pwa/PushSetup";
import { AuthenticationManager } from "./components/auth/AuthenticationManager";
import { useUnifiedAuth } from "./hooks/useUnifiedAuth";
import BuzzPaymentMonitor from "./components/payment/BuzzPaymentMonitor";
import { usePushNotificationProcessor } from "./hooks/usePushNotificationProcessor";
import { useState, useEffect } from "react";

import LegalOnboarding from "./components/legal/LegalOnboarding";

function App() {
  console.log("🚀 App component rendering...");
  console.log("🔍 App mount - checking for potential reload loops");
  
  // Initialize push notification processor
  usePushNotificationProcessor();

  const handleAuthenticated = (userId: string) => {
    console.log("✅ APP LEVEL - User authenticated:", userId);
  };
  
  const handleNotAuthenticated = () => {
    console.log("❌ APP LEVEL - User not authenticated");
  };
  
  const handleEmailNotVerified = () => {
    console.log("📧 APP LEVEL - Email not verified");
  };
  
  console.log("🎬 RENDERING NORMAL APP");
  
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
      <Router>
        <SoundProvider>
          <AuthProvider>
            <AuthenticationManager 
              onAuthenticated={handleAuthenticated}
              onNotAuthenticated={handleNotAuthenticated}
              onEmailNotVerified={handleEmailNotVerified}
            />
            <BuzzPaymentMonitor />
            <LegalOnboarding />
            <WouterRoutes />
            <InstallPrompt />
            <PushSetup />
            <Toaster 
              position="top-right" 
              richColors 
              closeButton 
              duration={4000}
              toastOptions={{
                style: {
                  background: 'rgba(0, 0, 0, 0.85)',
                  color: 'white',
                  border: '1px solid rgba(0, 209, 255, 0.3)',
                  borderRadius: '8px',
                },
              }}
              style={{ zIndex: 9999 }} 
            />
          </AuthProvider>
        </SoundProvider>
      </Router>
    </ProductionSafety>
    </ErrorBoundary>
  );
}

export default App;
