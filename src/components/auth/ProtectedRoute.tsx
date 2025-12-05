
import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useWouterNavigation } from '@/hooks/useWouterNavigation';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { Spinner } from '@/components/ui/spinner';

interface ProtectedRouteProps {
  redirectTo?: string;
  requireEmailVerification?: boolean;
  children?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  redirectTo = '/login',
  requireEmailVerification = true,
  children
}) => {
  const { isAuthenticated, isLoading, isEmailVerified, getCurrentUser, userRole, hasRole } = useUnifiedAuth();
  const [location] = useLocation();
  const { navigate } = useWouterNavigation();
  
  useEffect(() => {
    console.log("🛡️ PROTECTED ROUTE CHECK:", {
      path: location,
      isAuthenticated,
      isLoading,
      isEmailVerified,
      hasUser: !!getCurrentUser()?.id,
      userRole,
      isDeveloper: hasRole('developer')
    });
  }, [location, isAuthenticated, isLoading, isEmailVerified, getCurrentUser, userRole, hasRole]);
  
  // Show loading during authentication check
  if (isLoading) {
    console.log("⏳ AUTHENTICATION LOADING...");
    return (
      <div className="flex justify-center items-center min-h-screen bg-black">
        <Spinner className="h-8 w-8 text-white" />
      </div>
    );
  }
  
  // Check authentication
  if (!isAuthenticated) {
    console.log("❌ AUTH CHECK FAILED - User not authenticated");
    navigate(redirectTo);
    return null;
  }
  
  console.log("✅ AUTH CHECK PASSED");
  
  // Developer users bypass email verification
  const currentUser = getCurrentUser();
  const isDeveloper = hasRole('developer');
  
  if (requireEmailVerification && !isEmailVerified && !isDeveloper) {
    console.log("📧 EMAIL VERIFICATION REQUIRED - redirecting");
    navigate("/login?verification=pending");
    return null;
  }
  
  console.log("🎯 PROTECTED ROUTE SUCCESS");
  return <>{children}</>;
};

export default ProtectedRoute;
