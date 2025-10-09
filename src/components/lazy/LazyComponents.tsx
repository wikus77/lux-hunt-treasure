// © 2025 Joseph MULÉ – M1SSION™ - Lazy Loading Components for Performance
import React, { Suspense, lazy } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

// Lazy load heavy components for better performance
export const LazyIntelligencePanel = lazy(() => 
  import('@/components/intelligence/IntelligencePanel')
);

export const LazyStripeCheckout = lazy(() => 
  import('@/components/subscription/StripeInAppCheckout')
);

export const LazyNotifications = lazy(() => 
  import('@/pages/Notifications')
);

// HOC for consistent lazy loading with loading state
interface LazyWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const LazyWrapper: React.FC<LazyWrapperProps> = ({ 
  children, 
  fallback = <LoadingSpinner text="Caricamento componente..." variant="premium" />
}) => {
  return (
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  );
};

// Pre-configured lazy components with loading states
export const IntelligencePanelLazy: React.FC<any> = (props) => (
  <LazyWrapper fallback={
    <div className="flex items-center justify-center h-64">
      <LoadingSpinner text="Caricamento Intelligence Panel..." variant="premium" />
    </div>
  }>
    <LazyIntelligencePanel {...props} />
  </LazyWrapper>
);

export const StripeCheckoutLazy: React.FC<any> = (props) => (
  <LazyWrapper fallback={
    <div className="flex items-center justify-center h-32">
      <LoadingSpinner text="Caricamento pagamento..." variant="premium" />
    </div>
  }>
    <LazyStripeCheckout {...props} />
  </LazyWrapper>
);

export const NotificationsLazy: React.FC<any> = (props) => (
  <LazyWrapper>
    <LazyNotifications {...props} />
  </LazyWrapper>
);

export default LazyWrapper;
