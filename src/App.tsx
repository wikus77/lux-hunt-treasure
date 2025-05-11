
import { BrowserRouter } from "react-router-dom";
import { SoundProvider } from "./contexts/SoundContext";
import { AuthProvider } from "./contexts/auth/AuthProvider";
import { ErrorBoundary } from "./components/error/ErrorBoundary";
import AppContent from "./components/app/AppContent";

/**
 * Main App component - sets up providers and error boundaries
 */
function App() {
  console.log("App component rendering");
  
  return (
    <BrowserRouter>
      <SoundProvider>
        <AuthProvider>
          <ErrorBoundary>
            <AppContent />
          </ErrorBoundary>
        </AuthProvider>
      </SoundProvider>
    </BrowserRouter>
  );
}

export default App;
