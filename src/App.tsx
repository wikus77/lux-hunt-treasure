import React from 'react';
import { BrowserRouter as Router, Navigate } from 'react-router-dom';
import { Toaster } from "sonner";
import { AuthProvider, useCustomAuth } from "./contexts/auth/AuthProvider";
import { SoundProvider } from "./contexts/SoundContext";
import { ErrorBoundary } from "./components/error/ErrorBoundary";
import GlobalLayout from "./components/layout/GlobalLayout";
import AppRoutes from "./routes/AppRoutes";
import SafeAreaToggle from "./components/debug/SafeAreaToggle";

function InternalApp() {
  const { user, isLoading } = useCustomAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <p>Caricamento...</p>
      </div>
    );
  }

  // 🔐 Accesso diretto alla home solo per lo sviluppatore
  if (user?.email === "wikus77@hotmail.it" && window.location.pathname === "/") {
    return <Navigate to="/home" replace />;
  }

  return (
    <SafeAreaToggle>
      <GlobalLayout>
        <AppRoutes />
        <Toaster position="top-right" />
      </GlobalLayout>
    </SafeAreaToggle>
  );
}

function App() {
  return (
    <Router>
      <SoundProvider>
        <AuthProvider>
          <ErrorBoundary fallback={
            <div className="min-h-screen flex items-center justify-center bg-black text-white p-4">
              <div className="glass-card p-6 max-w-md mx-auto text-center">
                <h2 className="text-xl font-bold mb-4">Si è verificato un errore</h2>
                <p className="mb-6">Qualcosa è andato storto durante il caricamento dell'applicazione.</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-gradient-to-r from-projectx-blue to-projectx-pink rounded-md"
                >
                  Riprova
                </button>
              </div>
            </div>
          }>
            <InternalApp />
          </ErrorBoundary>
        </AuthProvider>
      </SoundProvider>
    </Router>
  );
}

export default App;
