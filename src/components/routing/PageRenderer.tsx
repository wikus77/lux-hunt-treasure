// 🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™
// M1SSION™ - Capacitor iOS Compatible Page Renderer
import React, { lazy, Suspense, useMemo } from 'react';
import { useNavigationStore } from '@/stores/navigationStore';
import GlobalLayout from '@/components/layout/GlobalLayout';
import LoadingScreen from '@/components/ui/LoadingScreen';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';

// Static imports for critical pages (no lazy loading for main app)
import Index from '@/pages/Index';
import AppHome from '@/pages/AppHome';
import Map from '@/pages/Map';
import { BuzzPage } from '@/pages/BuzzPage';
import Games from '@/pages/Games';
import Leaderboard from '@/pages/Leaderboard';
import Notifications from '@/pages/Notifications';
import Profile from '@/pages/Profile';
import SettingsPage from '@/pages/settings/SettingsPage';
import Subscriptions from '@/pages/Subscriptions';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import MissionSelection from '@/pages/MissionSelection';
import NotFound from '@/pages/NotFound';

// Lazy loaded pages for better performance
const PersonalInfoPage = lazy(() => import('@/pages/profile/PersonalInfoPage'));
const SecurityPage = lazy(() => import('@/pages/profile/SecurityPage'));
const PaymentsPage = lazy(() => import('@/pages/profile/PaymentsPage'));
const SilverPlanPage = lazy(() => import('@/pages/subscriptions/SilverPlanPage'));
const GoldPlanPage = lazy(() => import('@/pages/subscriptions/GoldPlanPage'));
const BlackPlanPage = lazy(() => import('@/pages/subscriptions/BlackPlanPage'));
const LegalTerms = lazy(() => import('@/pages/legal/Terms'));
const Privacy = lazy(() => import('@/pages/legal/Privacy'));
const SafeCreative = lazy(() => import('@/pages/legal/SafeCreative'));
const HowItWorks = lazy(() => import('@/pages/HowItWorks'));
const Contacts = lazy(() => import('@/pages/Contacts'));
const PrivacyPolicy = lazy(() => import('@/pages/PrivacyPolicy'));
const Terms = lazy(() => import('@/pages/Terms'));

interface PageRendererProps {
  currentPage: string;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const PageRenderer: React.FC<PageRendererProps> = ({ 
  currentPage, 
  isAuthenticated, 
  isLoading 
}) => {
  console.log('🎬 PageRenderer:', { currentPage, isAuthenticated, isLoading });

  const isCapacitorApp = useMemo(() => 
    typeof window !== 'undefined' && 
    (window.location.protocol === 'capacitor:' || 
     (window.location.hostname === 'localhost' && process.env.NODE_ENV === 'development'))
  , []);

  // Routes that don't need authentication
  const publicRoutes = [
    '/', '/login', '/register', '/how-it-works', '/contacts', 
    '/privacy-policy', '/terms', '/legal/terms', '/legal/privacy', '/legal/safecreative'
  ];

  // Routes that need authentication
  const protectedRoutes = [
    '/home', '/map', '/buzz', '/games', '/leaderboard', 
    '/notifications', '/profile', '/settings', '/subscriptions',
    '/profile/personal-info', '/profile/security', '/profile/payments',
    '/subscriptions/silver', '/subscriptions/gold', '/subscriptions/black',
    '/select-mission'
  ];

  // Routes that should hide navigation
  const hideNavigationRoutes = [
    '/', '/login', '/register', '/auth', '/kyc', '/verification', '/select-mission'
  ];

  const shouldHideNavigation = hideNavigationRoutes.includes(currentPage);
  const needsAuth = protectedRoutes.includes(currentPage);
  const isPublic = publicRoutes.includes(currentPage);

  // Handle authentication redirects
  if (isLoading) {
    return <LoadingScreen />;
  }

  // Redirect to login if not authenticated and trying to access protected route
  if (needsAuth && !isAuthenticated) {
    const { setCurrentPage } = useNavigationStore.getState();
    setCurrentPage('/login');
    return <LoadingScreen />;
  }

  // Redirect to home if authenticated and on landing page (Capacitor only)
  if (isCapacitorApp && isAuthenticated && currentPage === '/') {
    const { setCurrentPage } = useNavigationStore.getState();
    setCurrentPage('/home');
    return <LoadingScreen />;
  }

  // Render the appropriate page component
  const renderPageComponent = () => {
    switch (currentPage) {
      case '/':
        return <Index />;
      case '/home':
        return <AppHome />;
      case '/map':
        return <Map />;
      case '/buzz':
        console.log('🔍 BUZZ ROUTE: Rendering BuzzPage component via PageRenderer');
        return <BuzzPage />;
      case '/games':
        return <Games />;
      case '/leaderboard':
        return <Leaderboard />;
      case '/notifications':
        return <Notifications />;
      case '/profile':
        return <Profile />;
      case '/settings':
        return <SettingsPage />;
      case '/subscriptions':
        return <Subscriptions />;
      case '/login':
        return <Login />;
      case '/register':
        return <Register />;
      case '/select-mission':
        return <MissionSelection />;
      case '/how-it-works':
        return (
          <Suspense fallback={<LoadingScreen />}>
            <HowItWorks />
          </Suspense>
        );
      case '/contacts':
        return (
          <Suspense fallback={<LoadingScreen />}>
            <Contacts />
          </Suspense>
        );
      case '/privacy-policy':
        return (
          <Suspense fallback={<LoadingScreen />}>
            <PrivacyPolicy />
          </Suspense>
        );
      case '/terms':
        return (
          <Suspense fallback={<LoadingScreen />}>
            <Terms />
          </Suspense>
        );
      case '/profile/personal-info':
        return (
          <Suspense fallback={<LoadingScreen />}>
            <PersonalInfoPage />
          </Suspense>
        );
      case '/profile/security':
        return (
          <Suspense fallback={<LoadingScreen />}>
            <SecurityPage />
          </Suspense>
        );
      case '/profile/payments':
        return (
          <Suspense fallback={<LoadingScreen />}>
            <PaymentsPage />
          </Suspense>
        );
      case '/subscriptions/silver':
        return (
          <Suspense fallback={<LoadingScreen />}>
            <SilverPlanPage />
          </Suspense>
        );
      case '/subscriptions/gold':
        return (
          <Suspense fallback={<LoadingScreen />}>
            <GoldPlanPage />
          </Suspense>
        );
      case '/subscriptions/black':
        return (
          <Suspense fallback={<LoadingScreen />}>
            <BlackPlanPage />
          </Suspense>
        );
      case '/legal/terms':
        return (
          <Suspense fallback={<LoadingScreen />}>
            <LegalTerms />
          </Suspense>
        );
      case '/legal/privacy':
        return (
          <Suspense fallback={<LoadingScreen />}>
            <Privacy />
          </Suspense>
        );
      case '/legal/safecreative':
        return (
          <Suspense fallback={<LoadingScreen />}>
            <SafeCreative />
          </Suspense>
        );
      default:
        return <NotFound />;
    }
  };

  const pageComponent = renderPageComponent();

  // Wrap with GlobalLayout if needed
  if (shouldHideNavigation) {
    return (
      <ErrorBoundary>
        {pageComponent}
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <GlobalLayout>
        {pageComponent}
      </GlobalLayout>
    </ErrorBoundary>
  );
};

export default PageRenderer;