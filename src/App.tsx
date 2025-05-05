
import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from "@/components/ui/toaster";

import { ThemeProvider } from '@/components/theme-provider';
import { SoundProvider } from '@/contexts/SoundContext';
import Index from './pages/Index';
import MainLayout from './components/layout/MainLayout';

// Lazy-load components
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Home = lazy(() => import('./pages/Home'));
const Events = lazy(() => import('./pages/Events'));
const Buzz = lazy(() => import('./pages/Buzz'));
const Map = lazy(() => import('./pages/Map'));
const Profile = lazy(() => import('./pages/Profile'));
const Settings = lazy(() => import('./pages/Settings'));
const Notifications = lazy(() => import('./pages/Notifications'));
const NotFound = lazy(() => import('./pages/NotFound'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const Terms = lazy(() => import('./pages/Terms'));
const Subscriptions = lazy(() => import('./pages/Subscriptions'));
const PaymentSilver = lazy(() => import('./pages/PaymentSilver'));
const PaymentGold = lazy(() => import('./pages/PaymentGold'));
const PaymentBlack = lazy(() => import('./pages/PaymentBlack'));
const PaymentMethods = lazy(() => import('./pages/PaymentMethods'));
const PersonalInfo = lazy(() => import('./pages/PersonalInfo'));
const PrivacySecurity = lazy(() => import('./pages/PrivacySecurity'));
const Leaderboard = lazy(() => import('./pages/Leaderboard'));
const HowItWorks = lazy(() => import('./pages/HowItWorks'));
const Contacts = lazy(() => import('./pages/Contacts'));

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
      <QueryClientProvider client={queryClient}>
        <Toaster />
        <ThemeProvider>
          <SoundProvider>
            <Suspense fallback={<FallbackComponent />}>
              <div className="bg-black min-h-screen" style={{ opacity: 1, visibility: "visible" }}>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/how-it-works" element={<HowItWorks />} />
                  <Route path="/contacts" element={<Contacts />} />
                  
                  <Route path="/" element={<MainLayout />}>
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
                  <Route path="/personal-info" element={<PersonalInfo />} />
                  <Route path="/privacy-security" element={<PrivacySecurity />} />
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
    </ErrorBoundaryWrapper>
  );
}

export default App;
