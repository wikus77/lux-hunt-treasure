
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './components/theme-provider';
import { Toaster } from 'sonner';
import AppRoutes from './routes/AppRoutes';
import { ErrorBoundary } from 'react-error-boundary';
import CookiebotInit from './components/CookiebotInit';
import './i18n';
import { UnifiedAuthProvider } from '@/contexts/auth/UnifiedAuthProvider';

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider defaultTheme="dark" storageKey="m1ssion-theme">
        <UnifiedAuthProvider>
          <Toaster
            position="bottom-right"
            richColors
            closeButton
            duration={4000}
            toastOptions={{
              style: {
                background: 'rgba(0, 0, 0, 0.85)',
                color: '#fff',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              },
            }}
          />
          <CookiebotInit />
          <ErrorBoundary fallback={<div style={{ color: 'white', padding: 20 }}>🚨 Qualcosa è andato storto.</div>}>
            <AppRoutes />
          </ErrorBoundary>
        </UnifiedAuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
