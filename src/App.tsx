
import React, { useEffect } from 'react';
import { BrowserRouter as Router, useNavigate, useLocation } from 'react-router-dom';
import { Toaster } from "sonner";
import { AuthProvider } from "./contexts/auth/AuthProvider";
import { SoundProvider } from "./contexts/SoundContext";
import { ErrorBoundary } from "./components/error/ErrorBoundary";
import GlobalLayout from "./components/layout/GlobalLayout";
import AppRoutes from "./routes/AppRoutes";
import SafeAreaToggle from "./components/debug/SafeAreaToggle";
import { supabase } from "./integrations/supabase/client";

// Component for automatic redirect logic
const AuthRedirectHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkSessionAndRedirect = async () => {
      // Only check on root path
      if (location.pathname === '/') {
        try {
          const { data } = await supabase.auth.getSession();
          if (data.session) {
            console.log('✅ User authenticated, redirecting to /home');
            navigate('/home', { replace: true });
          } else {
            console.log('❌ User NOT authenticated - showing public page');
            // Stay on landing page for non-authenticated users
          }
        } catch (error) {
          console.error('❌ Error checking session:', error);
          // Stay on landing page in case of error
        }
      }
    };

    checkSessionAndRedirect();
  }, [navigate, location.pathname]);

  return null;
};

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
                <AuthRedirectHandler />
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
