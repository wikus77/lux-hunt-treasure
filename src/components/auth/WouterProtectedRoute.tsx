// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// M1SSION™ - Wouter-compatible ProtectedRoute Component with Access Control - V3.0 STABLE
// 🚨 CRITICAL FIX: Prevent THREE.js hook errors during unauthenticated access

import React, { Suspense } from 'react';
import { useLocation, Redirect } from 'wouter';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { useAccessControl } from '@/hooks/useAccessControl';
// IPHONE-REGRESSION-FORENSIC: Sanitized logging for regression diagnosis
import { logAuthForensic } from '@/utils/authForensicLog';
import AccessBlockedView from '@/components/auth/AccessBlockedView';
import { JUST_SIGNED_IN_GRACE_MS } from '@/contexts/auth/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

// Loading component to show while checking auth
const AuthLoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-black">
    <div className="text-center">
      <div className="w-10 h-10 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4" />
      <div className="text-white/60 text-sm">Verifica accesso...</div>
    </div>
  </div>
);

// Redirect screen
const RedirectScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-black">
    <div className="text-center">
      <div className="w-10 h-10 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4" />
      <div className="text-white/60 text-sm">Reindirizzamento...</div>
    </div>
  </div>
);

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  // 🚨 CRITICAL: ALL HOOKS MUST BE CALLED BEFORE ANY RETURN
  const { isAuthenticated, isLoading: authLoading, getCurrentUser, authHydrated, justSignedInAt } = useUnifiedAuth();
  const { canAccess, isLoading: accessLoading, subscriptionPlan, accessStartDate, timeUntilAccess } = useAccessControl();
  const [location, setLocation] = useLocation();

  // Always call all hooks first - no conditional hook calls
  const user = getCurrentUser();
  
  // 🚀 CRITICAL ADMIN BYPASS - Single state management
  const isAdminUser = user?.email === 'wikus77@hotmail.it';

  // 🚨 CRITICAL: Use Redirect component instead of useEffect for cleaner navigation
  // This prevents the children from being evaluated when unauthenticated

  // STEP 1: Show loading while auth is being checked
  if (authLoading) {
    logAuthForensic('T4_redirect_or_loading', { isLoading: authLoading, authHydrated, isAuthenticated, justSignedInAt, reason: 'authLoading', currentRoute: location });
    return <AuthLoadingScreen />;
  }

  // APPLE-LOGIN-LOOP-PATCH: wait for hydration before redirect (prevents 1-frame false redirect)
  if (!authHydrated) {
    logAuthForensic('T4_redirect_or_loading', { isLoading: authLoading, authHydrated, isAuthenticated, justSignedInAt, reason: 'not_hydrated', currentRoute: location });
    return <AuthLoadingScreen />;
  }

  // STEP 2: Admin bypass - immediate render
  if (isAdminUser) {
    console.log('🚀 INSTANT ADMIN BYPASS - Direct children render');
    return <>{children}</>;
  }

  // APPLE-LOGIN-LOOP-PATCH: grace period after SIGNED_IN - show loading instead of redirect
  const now = Date.now();
  const withinGracePeriod = justSignedInAt != null && (now - justSignedInAt) < JUST_SIGNED_IN_GRACE_MS;
  if (!isAuthenticated && withinGracePeriod) {
    const deltaMs = justSignedInAt != null ? now - justSignedInAt : 0;
    logAuthForensic('T4_redirect_or_loading', { isLoading: authLoading, authHydrated, isAuthenticated, justSignedInAt, reason: 'grace_period', currentRoute: location, deltaMs });
    console.log('[ROUTER] blocked redirect (reason=justSignedIn_grace_period)');
    return <AuthLoadingScreen />;
  }

  // STEP 3: Not authenticated - redirect to login
  // 🚨 CRITICAL: Use Redirect component, NOT render Login component
  // This prevents THREE.js and other lazy components from being evaluated
  if (!isAuthenticated) {
    logAuthForensic('T4_redirect_or_loading', { isLoading: authLoading, authHydrated, isAuthenticated, justSignedInAt, reason: 'redirect_to_login', currentRoute: location });
    console.log('🔐 [WouterProtectedRoute] User not authenticated, redirecting to login');
    return <Redirect to="/login" replace />;
  }

  // STEP 4: Authenticated but access control still loading
  if (accessLoading) {
    return <AuthLoadingScreen />;
  }

  // STEP 5: Check if needs to choose plan
  if (isAuthenticated && (!subscriptionPlan || subscriptionPlan === '') && subscriptionPlan !== 'ADMIN') {
    console.log('🔄 [WouterProtectedRoute] Redirecting to plan selection');
    return <Redirect to="/choose-plan" replace />;
  }

  // STEP 6: Block access if user doesn't have permission
  if (!canAccess) {
    return (
      <AccessBlockedView 
        subscriptionPlan={subscriptionPlan}
        accessStartDate={accessStartDate}
        timeUntilAccess={timeUntilAccess}
      />
    );
  }

  // STEP 7: All checks passed - render children
  return <>{children}</>;
};

export default ProtectedRoute;
