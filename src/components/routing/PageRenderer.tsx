// 🔐 FIRMATO: BY JOSEPH MULÈ – CEO M1SSION KFT™
// M1SSION™ Page Renderer - Custom Component Loading System
// Compatibilità Capacitor iOS al 100% - NO react-router-dom

import React, { Suspense, lazy, useMemo } from 'react';
import { useRoutingStore, RouteConfig } from '@/stores/routingStore';
import { useAuth } from '@/hooks/use-auth';
import GlobalLayout from '@/components/layout/GlobalLayout';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';

// Loading component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-black">
    <div className="glass-card p-6 max-w-md mx-auto text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-cyan-400 mx-auto mb-4"></div>
      <p className="text-white">Caricamento modulo...</p>
    </div>
  </div>
);

// Authentication guard component
const AuthGuard: React.FC<{ children: React.ReactNode; requiresAuth: boolean }> = ({ 
  children, 
  requiresAuth 
}) => {
  const { isAuthenticated, isLoading } = useAuth();
  const { navigate } = useRoutingStore();

  if (isLoading) {
    return <PageLoader />;
  }

  if (requiresAuth && !isAuthenticated) {
    // Redirect to login
    React.useEffect(() => {
      navigate('/login', true);
    }, [navigate]);
    return <PageLoader />;
  }

  return <>{children}</>;
};

// Layout wrapper component
const LayoutWrapper: React.FC<{ 
  children: React.ReactNode; 
  layout: 'global' | 'minimal' | 'none' 
}> = ({ children, layout }) => {
  switch (layout) {
    case 'global':
      return <GlobalLayout>{children}</GlobalLayout>;
    case 'minimal':
      // Minimal layout for auth pages
      return (
        <div className="min-h-screen bg-black">
          {children}
        </div>
      );
    case 'none':
    default:
      return <>{children}</>;
  }
};

// Dynamic component loader with lazy loading
const useDynamicComponent = (componentName: string) => {
  return useMemo(() => {
    const componentMap: Record<string, React.LazyExoticComponent<React.ComponentType<any>>> = {
      // Public routes
      'Index': lazy(() => import('@/pages/Index')),
      
      // Main app routes
      'AppHome': lazy(() => import('@/pages/AppHome')),
      'Map': lazy(() => import('@/pages/Map')),
      'BuzzPage': lazy(() => import('@/pages/BuzzPage').then(module => ({ default: module.BuzzPage }))),
      'Games': lazy(() => import('@/pages/Games')),
      'Leaderboard': lazy(() => import('@/pages/Leaderboard')),
      'Notifications': lazy(() => import('@/pages/Notifications')),
      'Profile': lazy(() => import('@/pages/Profile')),
      'SettingsPage': lazy(() => import('@/pages/settings/SettingsPage')),
      'Subscriptions': lazy(() => import('@/pages/Subscriptions')),
      
      // Auth routes
      'Login': lazy(() => import('@/pages/Login')),
      'Register': lazy(() => import('@/pages/Register')),
      'MissionSelection': lazy(() => import('@/pages/MissionSelection')),
      
      // Other routes
      'HowItWorks': lazy(() => import('@/pages/HowItWorks')),
      'Contacts': lazy(() => import('@/pages/Contacts')),
      'PrivacyPolicy': lazy(() => import('@/pages/PrivacyPolicy')),
      'Terms': lazy(() => import('@/pages/Terms')),
      
      // Profile subpages - BY JOSEPH MULE
      'PersonalInfoPage': lazy(() => import('@/pages/profile/PersonalInfoPage')),
      'SecurityPage': lazy(() => import('@/pages/profile/SecurityPage')),
      'PaymentsPage': lazy(() => import('@/pages/profile/PaymentsPage')),
      
      // Subscription plan pages - BY JOSEPH MULE
      'SilverPlanPage': lazy(() => import('@/pages/subscriptions/SilverPlanPage')),
      'GoldPlanPage': lazy(() => import('@/pages/subscriptions/GoldPlanPage')),
      'BlackPlanPage': lazy(() => import('@/pages/subscriptions/BlackPlanPage')),
      
      // Legal Routes - BY JOSEPH MULE
      'LegalTerms': lazy(() => import('@/pages/legal/Terms')),
      'Privacy': lazy(() => import('@/pages/legal/Privacy')),
      'SafeCreative': lazy(() => import('@/pages/legal/SafeCreative')),
      
      // 404 fallback
      'NotFound': lazy(() => import('@/pages/NotFound')),
    };

    return componentMap[componentName] || componentMap['NotFound'];
  }, [componentName]);
};

// Main PageRenderer component
export const PageRenderer: React.FC = () => {
  const { currentPath, getRouteConfig } = useRoutingStore();
  const route = getRouteConfig(currentPath);
  
  console.log('🎭 PAGE RENDERER:', {
    currentPath,
    route,
    component: route?.component || 'NotFound'
  });

  // Get the component to render
  const componentName = route?.component || 'NotFound';
  const DynamicComponent = useDynamicComponent(componentName);
  
  // Handle special case for Capacitor iOS home redirect (memoized)
  const { isAuthenticated, isLoading } = useAuth();
  const { navigate } = useRoutingStore();
  
  React.useEffect(() => {
    if (currentPath === '/' && isAuthenticated && !isLoading) {
      const isCapacitorApp = typeof window !== 'undefined' && 
        (window.location.protocol === 'capacitor:' || 
         (window.location.hostname === 'localhost' && process.env.NODE_ENV === 'development'));
      
      if (isCapacitorApp) {
        navigate('/home', true);
      }
    }
  }, [currentPath, isAuthenticated, isLoading, navigate]); // Stable dependencies

  if (!route) {
    console.warn('⚠️ Route not found:', currentPath);
    return (
      <ErrorBoundary>
        <Suspense fallback={<PageLoader />}>
          <DynamicComponent />
        </Suspense>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <AuthGuard requiresAuth={route.requiresAuth || false}>
        <LayoutWrapper layout={route.layout || 'none'}>
          <Suspense fallback={<PageLoader />}>
            <DynamicComponent />
          </Suspense>
        </LayoutWrapper>
      </AuthGuard>
    </ErrorBoundary>
  );
};

export default PageRenderer;
