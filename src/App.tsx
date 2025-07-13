
// 🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™

import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Toaster } from "sonner";
import { AuthProvider } from "./contexts/auth/AuthProvider";
import { SoundProvider } from "./contexts/SoundContext";
import { ErrorBoundary } from "./components/error/ErrorBoundary";
import GlobalLayout from "./components/layout/GlobalLayout";
import AppRoutes from "./routes/AppRoutes";
import { SafeAreaToggle } from "./components/debug/SafeAreaToggle";
import { usePushNotifications } from "@/hooks/usePushNotifications";

import { useAuthSessionDebug } from "./hooks/debug/useAuthSessionDebug";
useAuthSessionDebug();

function App() {
  // Initialize push notifications
  usePushNotifications();

  console.log("🚀 App component rendering...");
  
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
            className="px-4 py-2 bg-gradient-to-r from-projectx-blue to-projectx-pink rounded-md"
          >
            🔄 RIAVVIA EMERGENZA
          </button>
        </div>
      </div>
    }>
      <Router>
        <SoundProvider>
          <AuthProvider>
            <SafeAreaToggle>
              <AppRoutes />
              <Toaster position="top-center" richColors closeButton style={{ zIndex: 9999 }} />
            </SafeAreaToggle>
          </AuthProvider>
        </SoundProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
