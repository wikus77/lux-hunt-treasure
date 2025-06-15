
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './components/theme-provider';
import { Toaster } from 'sonner';
import AppRoutes from './routes/AppRoutes'; // ✅ Percorso corretto!
import { ErrorBoundary } from 'react-error-boundary';
import CookiebotInit from './components/CookiebotInit';
import './i18n';
import GlobalErrorHandler from '@/components/error/GlobalErrorHandler';
import { UnifiedAuthProvider } from '@/contexts/auth/UnifiedAuthProvider';

function App() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <GlobalErrorHandler>
        <ThemeProvider defaultTheme="dark" storageKey="m1ssion-theme">
          <UnifiedAuthProvider>
            <Toaster position="bottom-right" />
            <CookiebotInit />
            <ErrorBoundary fallback={<div>Something went wrong</div>}>
              <AppRoutes />
            </ErrorBoundary>
          </UnifiedAuthProvider>
        </ThemeProvider>
      </GlobalErrorHandler>
    </QueryClientProvider>
  );
}

export default App;
