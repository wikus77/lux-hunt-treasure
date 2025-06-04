
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Toaster } from "sonner";
import { AuthProvider } from "./contexts/auth/AuthProvider";
import { SoundProvider } from "./contexts/SoundContext";
import { ErrorBoundary } from "./components/error/ErrorBoundary";
import GlobalLayout from "./components/layout/GlobalLayout";
import AppRoutes from "./routes/AppRoutes";
import SafeAreaToggle from "./components/debug/SafeAreaToggle";
import { useCapacitorMagicLinkListener } from "./hooks/useCapacitorMagicLinkListener";
import { useAuth } from "./hooks/useAuth";
import { Capacitor } from '@capacitor/core';

// Componente per gestire i redirect dalla root con fix automatico redirect /home
function RootRedirect() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, session } = useAuth();
  
  // Attiva il listener per i magic link in ambiente Capacitor (ora dentro Router)
  useCapacitorMagicLinkListener();
  
  useEffect(() => {
    // Debug avvio app
    console.log("🚀 App initialization - Path:", location.pathname, "Auth state:", 
      isLoading ? "loading..." : (isAuthenticated ? "authenticated" : "not authenticated"));
    
    const isIOS = Capacitor.getPlatform() === 'ios';
    if (isIOS) {
      console.log("📱 Running on iOS WebView - Special session handling enabled");
    }
    
    // ✅ FIX: Redirect automatico a /home se session presente
    if (!isLoading) {
      if (location.pathname === "/" || location.pathname === "") {
        if (session) {
          console.log("✅ Session detected at root route - redirecting to /home");
          navigate("/home", { replace: true });
        } else {
          console.log("🔒 No session at root route - redirecting to /login");
          navigate("/login", { replace: true });
        }
      }
    }
  }, [location.pathname, isAuthenticated, isLoading, session, navigate]);
  
  return null;
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
            <SafeAreaToggle>
              <GlobalLayout>
                <RootRedirect />
                <AppRoutes />
                <Toaster position="top-right" />
              </GlobalLayout>
            </SafeAreaToggle>
          </ErrorBoundary>
        </AuthProvider>
      </SoundProvider>
    </Router>
  );
}

export default App;
