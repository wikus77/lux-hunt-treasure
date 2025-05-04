
import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from '@/components/theme-provider';
import { SoundProvider } from '@/contexts/SoundContext';

// Importazione diretta senza lazy loading per la pagina Index
import Index from './pages/Index';
import ErrorFallback from './components/errors/ErrorFallback';

// Lazy load delle altre pagine per performance
const Login = React.lazy(() => import('./pages/Login'));
const Register = React.lazy(() => import('./pages/Register'));
const Home = React.lazy(() => import('./pages/Home'));
const Events = React.lazy(() => import('./pages/Events'));
const Buzz = React.lazy(() => import('./pages/Buzz'));
const Map = React.lazy(() => import('./pages/Map'));
const Profile = React.lazy(() => import('./pages/Profile'));
const Settings = React.lazy(() => import('./pages/Settings'));
const Notifications = React.lazy(() => import('./pages/Notifications'));
const NotFound = React.lazy(() => import('./pages/NotFound'));
const PrivacyPolicy = React.lazy(() => import('./pages/PrivacyPolicy'));
const Terms = React.lazy(() => import('./pages/Terms'));
const Subscriptions = React.lazy(() => import('./pages/Subscriptions'));
const PaymentSilver = React.lazy(() => import('./pages/PaymentSilver'));
const PaymentGold = React.lazy(() => import('./pages/PaymentGold'));
const PaymentBlack = React.lazy(() => import('./pages/PaymentBlack'));
const PaymentMethods = React.lazy(() => import('./pages/PaymentMethods'));
const MainLayout = React.lazy(() => import('./components/layout/MainLayout'));
const Leaderboard = React.lazy(() => import('./pages/Leaderboard'));

// Componente di fallback durante il caricamento
const LoadingFallback = () => (
  <div className="min-h-screen bg-black flex items-center justify-center text-white">
    <div className="text-xl">Caricamento...</div>
  </div>
);

// Inizializzazione del client per React Query
const queryClient = new QueryClient();

function App() {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <Toaster />
        <ThemeProvider>
          <SoundProvider>
            <Routes>
              {/* Pagina index caricata direttamente senza Suspense per massima affidabilità */}
              <Route path="/" element={<Index />} />
              
              {/* Tutte le altre rotte con Suspense */}
              <Route path="/login" element={
                <Suspense fallback={<LoadingFallback />}>
                  <Login />
                </Suspense>
              } />
              <Route path="/register" element={
                <Suspense fallback={<LoadingFallback />}>
                  <Register />
                </Suspense>
              } />
              
              {/* Layout principale con Suspense */}
              <Route path="/" element={
                <Suspense fallback={<LoadingFallback />}>
                  <MainLayout />
                </Suspense>
              }>
                <Route path="/home" element={
                  <Suspense fallback={<LoadingFallback />}>
                    <Home />
                  </Suspense>
                } />
                <Route path="/events" element={
                  <Suspense fallback={<LoadingFallback />}>
                    <Events />
                  </Suspense>
                } />
                <Route path="/buzz" element={
                  <Suspense fallback={<LoadingFallback />}>
                    <Buzz />
                  </Suspense>
                } />
                <Route path="/map" element={
                  <Suspense fallback={<LoadingFallback />}>
                    <Map />
                  </Suspense>
                } />
                <Route path="/profile" element={
                  <Suspense fallback={<LoadingFallback />}>
                    <Profile />
                  </Suspense>
                } />
                <Route path="/settings" element={
                  <Suspense fallback={<LoadingFallback />}>
                    <Settings />
                  </Suspense>
                } />
                <Route path="/notifications" element={
                  <Suspense fallback={<LoadingFallback />}>
                    <Notifications />
                  </Suspense>
                } />
                <Route path="/leaderboard" element={
                  <Suspense fallback={<LoadingFallback />}>
                    <Leaderboard />
                  </Suspense>
                } />
                <Route path="*" element={
                  <Suspense fallback={<LoadingFallback />}>
                    <NotFound />
                  </Suspense>
                } />
              </Route>
              
              {/* Altre rotte */}
              <Route path="/privacy" element={
                <Suspense fallback={<LoadingFallback />}>
                  <PrivacyPolicy />
                </Suspense>
              } />
              <Route path="/terms" element={
                <Suspense fallback={<LoadingFallback />}>
                  <Terms />
                </Suspense>
              } />
              <Route path="/subscriptions" element={
                <Suspense fallback={<LoadingFallback />}>
                  <Subscriptions />
                </Suspense>
              } />
              <Route path="/payment-silver" element={
                <Suspense fallback={<LoadingFallback />}>
                  <PaymentSilver />
                </Suspense>
              } />
              <Route path="/payment-gold" element={
                <Suspense fallback={<LoadingFallback />}>
                  <PaymentGold />
                </Suspense>
              } />
              <Route path="/payment-black" element={
                <Suspense fallback={<LoadingFallback />}>
                  <PaymentBlack />
                </Suspense>
              } />
              <Route path="/payment-methods" element={
                <Suspense fallback={<LoadingFallback />}>
                  <PaymentMethods />
                </Suspense>
              } />
            </Routes>
          </SoundProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App;
