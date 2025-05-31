import React from 'react';
import { BrowserRouter as Router, useLocation, useNavigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './contexts/auth/AuthProvider';
import { useAuthContext } from './contexts/auth/useAuthContext';
import { SoundProvider } from './contexts/SoundContext';
import { ErrorBoundary } from './components/error/ErrorBoundary';
import GlobalLayout from './components/layout/GlobalLayout';
import AppRoutes from './routes/AppRoutes';
import SafeAreaToggle from './components/debug/SafeAreaToggle';

function InternalApp() {
  const { user, isLoading } = useAuthContext();
  const location = useLocation();
  const navigate = useNavigate();

  React.useEffect(() => {
    const isCapacitorApp = !!(window as any).Capacitor;
    const email = user?.email;

    if (
      !isLoading &&
      email === "wikus77@hotmail.it" &&
      location.pathname === "/" &&
      isCapacitorApp
    ) {
      console.log("🔁 Redirect sviluppatore (Capacitor) verso /home");
      navigate("/home", { replace: true });
    }
  }, [isLoading, user, location, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <p>MISSION sta caricando...</p>
      </div>
    );
  }

  return (
    <SafeAreaToggle>
      <div
        style={{
          paddingTop: 'env(safe-area-inset-top)',
          paddingBottom: 'env(safe-area-inset-bottom)',
          paddingLeft: 'env(safe-area-inset-left)',
          paddingRight: 'env(safe-area-inset-right)',
          minHeight: '100vh',
          backgroundColor: 'black',
        }}
      >
        <GlobalLayout>
          <AppRoutes />
          <Toaster position="top-right" />
        </GlobalLayout>
      </div>
    </SafeAreaToggle>
  );
}

function App() {
  return (
    <Router>
      <SoundProvider>
        <AuthProvider>
          <ErrorBoundary
            fallback={
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
            }
          >
            <InternalApp />
          </ErrorBoundary>
        </AuthProvider>
      </SoundProvider>
    </Router>
  );
}

export default App;

