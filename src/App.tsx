
import './App.css';
import { BrowserRouter } from "react-router-dom";
import AppContent from './components/app/AppContent';
import CookiebotInit from './components/cookiebot/CookiebotInit';
import { AuthProvider } from './contexts/auth';
import { ErrorBoundary } from './components/error/ErrorBoundary';
import { Suspense } from 'react';

/**
 * Root component of the application.
 * This is the entry point for the entire React tree.
 * Now enhanced with better error handling and loading states.
 */
function App() {
  console.log("App component rendering");
  
  // Fallback component for Suspense to prevent white screens during loading
  const LoadingFallback = () => (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-t-cyan-400 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto"></div>
        <p className="mt-4 text-lg">Caricamento M1SSION...</p>
      </div>
    </div>
  );

  return (
    // Top-level error boundary catches any rendering errors
    <ErrorBoundary>
      <BrowserRouter>
        {/* Initialize Cookie Script helper only once at root level */}
        <CookiebotInit />
        <AuthProvider>
          {/* Suspense provides fallback during code-splitting or data loading */}
          <Suspense fallback={<LoadingFallback />}>
            <AppContent />
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
