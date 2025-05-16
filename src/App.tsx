
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Toaster } from "sonner";
import { AuthProvider } from "./contexts/auth/AuthProvider";
import { SoundProvider } from "./contexts/SoundContext";
import { ErrorBoundary } from "./components/error/ErrorBoundary";
import GlobalLayout from "./components/layout/GlobalLayout";
import AppContent from "./components/app/AppContent";

function App() {
  return (
    <Router>
      <SoundProvider>
        <AuthProvider>
          <ErrorBoundary>
            <GlobalLayout>
              <AppContent />
              <Toaster position="top-right" />
            </GlobalLayout>
          </ErrorBoundary>
        </AuthProvider>
      </SoundProvider>
    </Router>
  );
}

export default App;
