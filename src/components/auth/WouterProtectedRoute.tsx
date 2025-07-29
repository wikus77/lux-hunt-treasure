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
  
  // 🚀 EMERGENCY INSTANT ADMIN CHECK - BEFORE ANY OTHER LOGIC
  if (user?.email === 'wikus77@hotmail.it') {
    console.log('🚀 INSTANT ADMIN BYPASS - Immediate /home redirect');
    return <>{children}</>;
  }

  // Use effect for navigation to avoid conditional hook usage
  React.useEffect(() => {
    if (!authLoading && !accessLoading) {
      // 🚀 CRITICAL ADMIN BYPASS - Check email first before any navigation
      if (user?.email === 'wikus77@hotmail.it') {
        console.log('🚀 CRITICAL ADMIN DETECTED - Force redirect to /home');
        if (location !== '/home') {
          setLocation('/home');
        }
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
  }, [isAuthenticated, authLoading, accessLoading, subscriptionPlan, location, setLocation, user?.email]);

  // CRITICAL: Add logout state handling to prevent hooks error
  React.useEffect(() => {
    // Clear session storage on logout to prevent stale states
    if (!isAuthenticated && !authLoading) {
      console.log('🧹 [WouterProtectedRoute] Clearing session storage on logout');
      sessionStorage.removeItem('hasSeenPostLoginIntro');
    }
  }, [isAuthenticated, authLoading]);

  // 🔐 SECURE ADMIN CHECK - Use role-based authentication + BYPASS ADMIN
  const [isAdmin, setIsAdmin] = React.useState<boolean>(false);
  
  React.useEffect(() => {
    const checkAdminAccess = async () => {
      if (user) {
        // 🚀 HARDCODED ADMIN FALLBACK - Immediate redirect for developer
        if (user.email === 'wikus77@hotmail.it') {
          console.log('🚀 HARDCODED ADMIN FALLBACK - Immediate redirect to /home');
          window.location.replace('/home');
          return;
        }
        
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        
        if (profile?.role === 'admin') {
          console.log('🔓 ADMIN ACCESS - User has admin role - BYPASSING ALL CHECKS');
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      }
    };
    
    checkAdminAccess();
  }, [user]);

  // 🚨 CRITICAL ADMIN BYPASS - Skip loading screens for admin
  if (isAdmin && isAuthenticated) {
    console.log('🚀 ADMIN HARD BYPASS - Skipping all verification screens');
    return <>{children}</>;
  }

  // 🚀 FINAL EMERGENCY CHECK - Before any verification screen
  if (user?.email === 'wikus77@hotmail.it') {
    console.log('🚀 FINAL EMERGENCY ADMIN - Direct children render');
    return <>{children}</>;
  }

  // CRITICAL FIX: Ensure user is always defined before conditional returns
  if (!isAuthenticated || authLoading || accessLoading) {
    if (!authLoading && !accessLoading && !isAuthenticated) {
      return <Login />;
    }
    
    // 🚀 LAST CHANCE ADMIN BYPASS
    if (user?.email === 'wikus77@hotmail.it') {
      console.log('🚀 LAST CHANCE ADMIN BYPASS - Skip verification screen');
      return <>{children}</>;
    }
    
    // 🚨 ADMIN EMERGENCY BYPASS - If admin detected, skip verification
    if (isAdmin) {
      console.log('🚨 ADMIN EMERGENCY BYPASS - Loading but admin detected');
      return <>{children}</>;
    }
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-white">Verifica accesso...</div>
      </div>
    );
  }

  // 🚨 ADMIN FINAL BYPASS - Skip access control for admin  
  if (isAdmin) {
    console.log('🔓 ADMIN FINAL BYPASS - All access controls skipped');
    return <>{children}</>;
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