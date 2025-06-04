
import React, { useEffect } from 'react';
import { BrowserRouter as Router, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Toaster } from "sonner";
import { AuthProvider } from "./contexts/auth/AuthProvider";
import { SoundProvider } from "./contexts/SoundContext";
import { ErrorBoundary } from "./components/error/ErrorBoundary";
import GlobalLayout from "./components/layout/GlobalLayout";
import AppRoutes from "./routes/AppRoutes";
import SafeAreaToggle from "./components/debug/SafeAreaToggle";
import { useCapacitorMagicLinkListener } from "./hooks/useCapacitorMagicLinkListener";
import { useAuthContext } from "./contexts/auth";
import { useAuth } from "@/hooks/useAuth";

function RootRedirect() {
  const { authState } = useAuth();
  const location = useLocation();

  if (location.pathname === "/" && !authState.session) {
    return <Navigate to="/login" replace />;
  }

  return null;
}

// Component to handle initial redirects
const AuthRedirectHandler: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading } = useAuthContext();

  useEffect(() => {
    // Wait for auth to finish loading
    if (isLoading) return;

    // If user is authenticated and on root path, redirect to /home
    if (isAuthenticated && location.pathname === '/') {
      console.log('🏠 Authenticated user on root path, redirecting to /home');
      navigate('/home', { replace: true });
      return;
    }

    // Handle Capacitor deep links that might land on root
    const isCapacitor = !!(window as any).Capacitor;
    if (isCapacitor && isAuthenticated && location.pathname === '/') {
      console.log('📱 Capacitor app with authenticated user, redirecting to /home');
      navigate('/home', { replace: true });
    }
  }, [isAuthenticated, isLoading, location.pathname, navigate]);

  return null;
};

function AppContent() {
  useCapacitorMagicLinkListener(); // Keep magic link functionality

  return (
    <SoundProvider>
      <AuthProvider>
        <RootRedirect />
        <AuthRedirectHandler />
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
              <AppRoutes />
              <Toaster position="top-right" />
            </GlobalLayout>
          </SafeAreaToggle>
        </ErrorBoundary>
      </AuthProvider>
    </SoundProvider>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
