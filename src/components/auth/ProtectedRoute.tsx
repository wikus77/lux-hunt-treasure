// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// ProtectedRoute - OPTIMIZED for instant page transitions

import React, { useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { useWouterNavigation } from '@/hooks/useWouterNavigation';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';

interface ProtectedRouteProps {
  redirectTo?: string;
  requireEmailVerification?: boolean;
  children?: React.ReactNode;
}

// Cache auth state to prevent re-checks on every route change
const AUTH_CACHE_KEY = 'm1ssion_auth_verified';

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  redirectTo = '/login',
  requireEmailVerification = true,
  children
}) => {
  const { isAuthenticated, isLoading, isEmailVerified, getCurrentUser, hasRole } = useUnifiedAuth();
  const [location] = useLocation();
  const { navigate } = useWouterNavigation();
  const hasChecked = useRef(false);
  
  // Check if we have a cached auth state (instant check)
  const hasCachedAuth = (): boolean => {
    try {
      const cached = sessionStorage.getItem(AUTH_CACHE_KEY);
      if (cached) {
        const { verified, timestamp } = JSON.parse(cached);
        // Cache valid for 5 minutes
        if (verified && (Date.now() - timestamp) < 5 * 60 * 1000) {
          return true;
        }
      }
    } catch {}
    return false;
  };

  // Update cache when auth is verified
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      try {
        sessionStorage.setItem(AUTH_CACHE_KEY, JSON.stringify({
          verified: true,
          timestamp: Date.now()
        }));
      } catch {}
    }
  }, [isAuthenticated, isLoading]);

  // Clear cache on logout
  useEffect(() => {
    if (!isAuthenticated && !isLoading && hasChecked.current) {
      sessionStorage.removeItem(AUTH_CACHE_KEY);
    }
  }, [isAuthenticated, isLoading]);
  
  // Debug only in development
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log("🛡️ PROTECTED ROUTE:", { path: location, isAuthenticated, isLoading });
    }
  }, [location, isAuthenticated, isLoading]);
  
  // 🚀 INSTANT RENDER: If we have cached auth, render immediately
  if (hasCachedAuth() && !hasChecked.current) {
    hasChecked.current = true;
    return <>{children}</>;
  }
  
  // First load: Wait for auth check (but don't show spinner if cached)
  if (isLoading) {
    // If we have cached auth, render children while loading completes
    if (hasCachedAuth()) {
      return <>{children}</>;
    }
    // Only show minimal loading indicator on first load
    return (
      <div className="min-h-screen bg-transparent" />
    );
  }
  
  hasChecked.current = true;
  
  // Check authentication
  if (!isAuthenticated) {
    navigate(redirectTo);
    return null;
  }
  
  // Developer users bypass email verification
  const isDeveloper = hasRole('developer');
  
  if (requireEmailVerification && !isEmailVerified && !isDeveloper) {
    navigate("/login?verification=pending");
    return null;
  }
  
  return <>{children}</>;
};

export default ProtectedRoute;
