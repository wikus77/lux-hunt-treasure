// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// M1SSION™ - Wouter-compatible ProtectedRoute Component with Access Control

import React from 'react';
import { useLocation } from 'wouter';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { useAccessControl } from '@/hooks/useAccessControl';
import Login from '@/pages/Login';
import AccessBlockedView from '@/components/auth/AccessBlockedView';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading: authLoading, getCurrentUser } = useUnifiedAuth();
  const { canAccess, isLoading: accessLoading, subscriptionPlan, accessStartDate, timeUntilAccess } = useAccessControl();
  const [location, setLocation] = useLocation();

  // Always call all hooks first - no conditional hook calls
  const user = getCurrentUser();

  // Use effect for navigation to avoid conditional hook usage
  React.useEffect(() => {
    if (!authLoading && !accessLoading) {
      if (!isAuthenticated && location !== '/login') {
        setLocation('/login');
      } else if (isAuthenticated && (!subscriptionPlan || subscriptionPlan === '') && location !== '/choose-plan') {
        setLocation('/choose-plan');
      }
    }
  }, [isAuthenticated, authLoading, accessLoading, subscriptionPlan, location, setLocation]);

  // 🔐 ECCEZIONE SVILUPPATORE - BYPASS COMPLETO
  if (user?.email === 'wikus77@hotmail.it') {
    console.log('🔓 DEVELOPER ACCESS - Bypassing all restrictions');
    return <>{children}</>;
  }

  // Show loading while checking auth or access
  if (authLoading || accessLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-white">Verifica accesso...</div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Login />;
  }

  // Force plan selection if no subscription plan chosen
  if (!subscriptionPlan || subscriptionPlan === '') {
    console.log('🛑 NO PLAN SELECTED - Forcing plan selection:', {
      subscriptionPlan,
      currentLocation: location
    });
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-white">Reindirizzamento alla selezione piano...</div>
      </div>
    );
  }

  // Block access if user doesn't have permission (post-registration control)
  if (!canAccess) {
    console.log('🚫 ACCESS BLOCKED - User authenticated but access not enabled:', {
      subscriptionPlan,
      accessStartDate,
      timeUntilAccess
    });
    
    return (
      <AccessBlockedView 
        subscriptionPlan={subscriptionPlan}
        accessStartDate={accessStartDate}
        timeUntilAccess={timeUntilAccess}
      />
    );
  }

  console.log('✅ ACCESS GRANTED - User can access protected content');
  return <>{children}</>;
};

export default ProtectedRoute;