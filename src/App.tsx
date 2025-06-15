
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './components/theme-provider';
import { Toaster } from 'sonner';
import AppRoutes from './routes/AppRoutes';
import { ErrorBoundary } from 'react-error-boundary';
import CookiebotInit from './components/CookiebotInit';
import './i18n';
import { UnifiedAuthProvider } from '@/contexts/auth/UnifiedAuthProvider';

function App() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: false,
        staleTime: 1000 * 60 * 5, // 5 minuti per evitare refetch inutili
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
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
    </QueryClientProvider>
  );
}

export default App;

