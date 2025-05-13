
import './App.css';
import { BrowserRouter } from "react-router-dom";
import AppContent from './components/app/AppContent';
import CookiebotInit from './components/cookiebot/CookiebotInit';
import { AuthProvider } from './contexts/auth';
import { ErrorBoundary } from './components/error/ErrorBoundary';
import { Suspense, useEffect } from 'react';

/**
 * Root component of the application.
 * This is the entry point for the entire React tree.
 * Now enhanced with better error handling and loading states.
 */
function App() {
  console.log("App component rendering");
  
  // Cookie Script initialization - added directly in App for persistence
  useEffect(() => {
    // Check if script already exists to prevent duplicates
    const existingScript = document.querySelector('script[src*="cookie-script.com"]');
    
    if (!existingScript) {
      const script = document.createElement("script");
      script.src = "https://cdn.cookie-script.com/s/2db074620da1ba3a3cc6c19025d1d99d.js";
      script.setAttribute("data-cookiescript", "accepted");
      script.setAttribute("data-cs-mode", "dialog");
      script.setAttribute("data-cs-fixed", "true");
      script.async = true;
      document.body.appendChild(script);
      
      console.log("Cookie Script dynamically added to DOM");
    } else {
      console.log("Cookie Script already exists in DOM");
    }

    return () => {
      // Only remove if we added it (check for our specific attributes)
      const ourScript = document.querySelector('script[src*="cookie-script.com"][data-cookiescript="accepted"]');
      if (ourScript) {
        document.body.removeChild(ourScript);
        console.log("Cookie Script removed from DOM");
      }
    };
  }, []);

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
      {/* Ensure CookiebotInit is included at the top level, outside BrowserRouter */}
      <CookiebotInit />
      <BrowserRouter>
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
