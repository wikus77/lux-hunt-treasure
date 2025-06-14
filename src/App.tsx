import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ThemeProvider } from './components/theme-provider';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from 'sonner';
import AppRoutes from './AppRoutes';
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
          <AuthProvider>
            <UnifiedAuthProvider>
              <Toaster position="bottom-right" />
              <CookiebotInit />
              <ErrorBoundary>
                <AppRoutes />
              </ErrorBoundary>
            </UnifiedAuthProvider>
          </AuthProvider>
        </ThemeProvider>
      </GlobalErrorHandler>
    </QueryClientProvider>
  );
}

export default App;
