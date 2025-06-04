
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
  const { isAuthenticated, isLoading, session, user } = useAuth();
  
  // Attiva il listener per i magic link in ambiente Capacitor (ora dentro Router)
  useCapacitorMagicLinkListener();
  
  useEffect(() => {
    // Debug avvio app con dettagli completi
    console.log("🚀 App initialization - Path:", location.pathname);
    console.log("🔍 Auth state details:", {
      isLoading,
      isAuthenticated,
      hasSession: !!session,
      hasUser: !!user,
      userEmail: user?.email,
      sessionExists: session ? "Yes" : "No"
    });
    
    const isIOS = Capacitor.getPlatform() === 'ios';
    if (isIOS) {
      console.log("📱 Running on iOS WebView - Special session handling enabled");
    }
    
    // ✅ FIX: Redirect automatico a /home se session presente - IMMEDIATO
    if (!isLoading) {
      console.log("✅ Auth loading completed, checking redirect logic...");
      
      if (location.pathname === "/" || location.pathname === "") {
        if (session && isAuthenticated) {
          console.log("✅ Session + Auth detected at root route - redirecting to /home IMMEDIATELY");
          console.log("📧 User email:", session.user?.email);
          navigate("/home", { replace: true });
        } else {
          console.log("🔒 No session at root route - redirecting to /login");
          navigate("/login", { replace: true });
        }
      } else {
        console.log(`📍 Current path: ${location.pathname}, no redirect needed`);
      }
    } else {
      console.log("⏳ Auth still loading, waiting...");
    }
  }, [location.pathname, isAuthenticated, isLoading, session, user, navigate]);
  
  // ✅ FIX: Immediate redirect if we have session - NO PLACEHOLDER SCREEN
  if (!isLoading && session && location.pathname === "/") {
    console.log("🔥 IMMEDIATE REDIRECT: Session exists, redirecting to /home NOW");
    return <Navigate to="/home" replace />;
  }
  
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
