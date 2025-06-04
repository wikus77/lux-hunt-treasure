
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Navigate } from 'react-router-dom';
import { Toaster } from "sonner";
import { AuthProvider } from "./contexts/auth/AuthProvider";
import { SoundProvider } from "./contexts/SoundContext";
import { ErrorBoundary } from "./components/error/ErrorBoundary";
import GlobalLayout from "./components/layout/GlobalLayout";
import AppRoutes from "./routes/AppRoutes";
import SafeAreaToggle from "./components/debug/SafeAreaToggle";
import { useAuthContext } from "./contexts/auth";

// Componente interno per gestire i redirect basati su auth
const AppContent = () => {
  const { isAuthenticated, isLoading, session } = useAuthContext();

  console.log('🔍 App.tsx - Auth State:', { isAuthenticated, isLoading, hasSession: !!session });

  // Se stiamo ancora caricando, mostra un loading minimale
  if (isLoading) {
    console.log('⏳ App.tsx - Still loading auth state');
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="w-8 h-8 border-4 border-t-transparent border-[#00D1FF] rounded-full animate-spin"></div>
      </div>
    );
  }

  // Se autenticato, redirect immediato a /home
  if (isAuthenticated && session) {
    console.log('✅ App.tsx - User authenticated, redirecting to /home');
    return <Navigate to="/home" replace />;
  }

  // Se non autenticato, mostra le routes normali (compresa landing page)
  console.log('👤 App.tsx - User not authenticated, showing routes');
  return <AppRoutes />;
};

function App() {
  console.log('🚀 App.tsx - App component mounting');

  // Capacitor magic link listener setup
  useEffect(() => {
    const setupCapacitorListener = async () => {
      try {
        // Check if we're in a Capacitor environment
        if (typeof window !== 'undefined' && (window as any).Capacitor) {
          console.log('📱 Capacitor environment detected');
          
          // Dynamic import to avoid build issues on web
          const { App: CapacitorApp } = await import('@capacitor/app');
          
          CapacitorApp.addListener('appUrlOpen', (event) => {
            console.log('📱 Capacitor - App URL opened:', event.url);
            
            if (event.url.includes('access_token=') || event.url.includes('refresh_token=')) {
              console.log('🔗 Capacitor - Magic link detected, processing...');
              const url = new URL(event.url);
              const fragment = url.hash.substring(1);
              const params = new URLSearchParams(fragment);
              
              if (params.get('access_token')) {
                window.location.hash = fragment;
                window.location.pathname = '/';
              }
            }
          });
        } else {
          console.log('🌐 Web environment - Capacitor listeners not needed');
        }
      } catch (error) {
        console.error('❌ Capacitor listener setup failed:', error);
      }
    };

    setupCapacitorListener();
  }, []);

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
                <AppContent />
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
