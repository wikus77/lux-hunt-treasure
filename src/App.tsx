import React, { Suspense, ErrorBoundary } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from "@/components/ui/toaster";

import { ThemeProvider } from '@/components/theme-provider';
import { SoundProvider } from '@/contexts/SoundContext';
import Index from './pages/Index';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Events from './pages/Events';
import Buzz from './pages/Buzz';
import Map from './pages/Map';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Notifications from './pages/Notifications';
import NotFound from './pages/NotFound';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Terms from './pages/Terms';
import Subscriptions from './pages/Subscriptions';
import PaymentSilver from './pages/PaymentSilver';
import PaymentGold from './pages/PaymentGold';
import PaymentBlack from './pages/PaymentBlack';
import PaymentMethods from './pages/PaymentMethods';
import MainLayout from './components/layout/MainLayout';
import Leaderboard from './pages/Leaderboard';

const queryClient = new QueryClient();

// Simple fallback component to ensure something always renders
const FallbackComponent = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-black z-[9999]">
    <div className="text-white text-xl">Loading...</div>
  </div>
);

// Error boundary component
class ErrorBoundaryWrapper extends React.Component<{children: React.ReactNode}, {hasError: boolean}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 flex items-center justify-center bg-black z-[9999]">
          <div className="text-white text-xl">Something went wrong. Please reload.</div>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  return (
    <ErrorBoundaryWrapper>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <Toaster />
          <ThemeProvider>
            <SoundProvider>
              <Suspense fallback={<FallbackComponent />}>
                <div className="bg-black min-h-screen" style={{ opacity: 1, visibility: "visible" }}>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/login" element={<React.lazy(() => import('./pages/Login'))} />
                    <Route path="/register" element={<React.lazy(() => import('./pages/Register'))} />
                    
                    <Route path="/" element={<React.lazy(() => import('./components/layout/MainLayout'))}>
                      <Route path="/home" element={<Home />} />
                      <Route path="/events" element={<Events />} />
                      <Route path="/buzz" element={<Buzz />} />
                      <Route path="/map" element={<Map />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="/notifications" element={<Notifications />} />
                      <Route path="/leaderboard" element={<Leaderboard />} />
                      <Route path="*" element={<NotFound />} />
                    </Route>
                    
                    <Route path="/privacy" element={<PrivacyPolicy />} />
                    <Route path="/terms" element={<Terms />} />
                    <Route path="/subscriptions" element={<Subscriptions />} />
                    <Route path="/payment-silver" element={<PaymentSilver />} />
                    <Route path="/payment-gold" element={<PaymentGold />} />
                    <Route path="/payment-black" element={<PaymentBlack />} />
                    <Route path="/payment-methods" element={<PaymentMethods />} />
                  </Routes>
                </div>
              </Suspense>
            </SoundProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </BrowserRouter>
    </ErrorBoundaryWrapper>
  );
}

export default App;
