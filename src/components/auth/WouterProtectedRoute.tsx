// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// M1SSION™ - Wouter-compatible ProtectedRoute Component with Access Control

import React from 'react';
import { useLocation } from 'wouter';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { useAccessControl } from '@/hooks/useAccessControl';
import { supabase } from '@/integrations/supabase/client';
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
        console.log('🔄 [WouterProtectedRoute] Redirecting to login - user not authenticated');
        setLocation('/login');
      } else if (isAuthenticated && (!subscriptionPlan || subscriptionPlan === '') && location !== '/choose-plan') {
        console.log('🔄 [WouterProtectedRoute] Redirecting to plan selection - no plan selected');
        setLocation('/choose-plan');
      }
    }
  }, [isAuthenticated, authLoading, accessLoading, subscriptionPlan, location, setLocation]);

  // CRITICAL: Add logout state handling to prevent hooks error
  React.useEffect(() => {
    // Clear session storage on logout to prevent stale states
    if (!isAuthenticated && !authLoading) {
      console.log('🧹 [WouterProtectedRoute] Clearing session storage on logout');
      sessionStorage.removeItem('hasSeenPostLoginIntro');
    }
  }, [isAuthenticated, authLoading]);

  // 🔐 SECURE ADMIN CHECK - Use role-based authentication
  React.useEffect(() => {
    const checkAdminAccess = async () => {
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        
        if (profile?.role === 'admin') {
          console.log('🔓 ADMIN ACCESS - User has admin role');
        }
      }
    };
    
    checkAdminAccess();
  }, [user]);

  // CRITICAL FIX: Ensure user is always defined before conditional returns
  if (!isAuthenticated || authLoading || accessLoading) {
    if (!authLoading && !accessLoading && !isAuthenticated) {
      return <Login />;
    }
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-white">Verifica accesso...</div>
      </div>
    );
  }

  // Force plan selection if no subscription plan chosen
  if (!subscriptionPlan || subscriptionPlan === '') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-white">Reindirizzamento alla selezione piano...</div>
      </div>
    );
  }

  // Block access if user doesn't have permission (post-registration control)
  if (!canAccess) {
    return (
      <AccessBlockedView 
        subscriptionPlan={subscriptionPlan}
        accessStartDate={accessStartDate}
        timeUntilAccess={timeUntilAccess}
      />
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;