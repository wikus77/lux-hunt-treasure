// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// M1SSION™ - Wouter-compatible ProtectedRoute Component with Access Control - V2.0 STABLE
// 🚨 CRITICAL FIX: Infinite recursion RLS policies fixed, admin loop eliminated

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
  // 🚨 CRITICAL FIX: ALL HOOKS MUST BE CALLED BEFORE ANY RETURN
  const { isAuthenticated, isLoading: authLoading, getCurrentUser } = useUnifiedAuth();
  const { canAccess, isLoading: accessLoading, subscriptionPlan, accessStartDate, timeUntilAccess } = useAccessControl();
  const [location, setLocation] = useLocation();

  // Always call all hooks first - no conditional hook calls
  const user = getCurrentUser();
  
  // 🚀 CRITICAL ADMIN BYPASS - Single state management
  const isAdminUser = user?.email === 'wikus77@hotmail.it';

  // 🚨 CRITICAL FIX: Remove redirect useEffect for admin to prevent loop
  React.useEffect(() => {
    if (!authLoading && !accessLoading) {
      // Skip all redirects for admin - let component render directly
      if (isAdminUser) {
        console.log('🚀 ADMIN DETECTED - Skipping all redirects, direct render');
        return;
      }
      
      if (!isAuthenticated && location !== '/login') {
        console.log('🔄 [WouterProtectedRoute] Redirecting to login - user not authenticated');
        setLocation('/login');
      } else if (isAuthenticated && (!subscriptionPlan || subscriptionPlan === '') && location !== '/choose-plan' && subscriptionPlan !== 'ADMIN') {
        console.log('🔄 [WouterProtectedRoute] Redirecting to plan selection - no plan selected');
        setLocation('/choose-plan');
      }
    }
  }, [isAuthenticated, authLoading, accessLoading, subscriptionPlan, location, setLocation, isAdminUser]);

  // CRITICAL: Add logout state handling to prevent hooks error
  React.useEffect(() => {
    // Clear session storage on logout to prevent stale states
    if (!isAuthenticated && !authLoading) {
      console.log('🧹 [WouterProtectedRoute] Clearing session storage on logout');
      sessionStorage.removeItem('hasSeenPostLoginIntro');
    }
  }, [isAuthenticated, authLoading]);

  // 🚀 RENDERING LOGIC - All hooks called, now handle render
  
  // 🚨 INSTANT ADMIN BYPASS - Top priority
  if (isAdminUser) {
    console.log('🚀 INSTANT ADMIN BYPASS - Direct children render');
    return <>{children}</>;
  }

  // Handle authentication states
  // 🔥 FIX CRITICO: Se auth loading è finito e utente NON autenticato, mostra Login IMMEDIATAMENTE
  // Non aspettare accessLoading per utenti non autenticati!
  if (!authLoading && !isAuthenticated) {
    console.log('🔐 [WouterProtectedRoute] User not authenticated, showing Login');
    return <Login />;
  }
  
  // Se auth è ancora in loading, mostra spinner
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-white">Verifica accesso...</div>
      </div>
    );
  }
  
  // Se utente è autenticato ma access control è in loading, mostra spinner
  if (isAuthenticated && accessLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-white">Verifica permessi...</div>
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