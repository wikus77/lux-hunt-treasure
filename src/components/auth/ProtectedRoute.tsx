
import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthContext } from '@/contexts/auth';
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
  const { isAuthenticated, isLoading, isEmailVerified, getCurrentUser, userRole, hasRole } = useAuthContext();
  const location = useLocation();
  
  useEffect(() => {
    console.log("🛡️ PROTECTED ROUTE CHECK:", {
      path: location.pathname,
      isAuthenticated,
      isLoading,
      isEmailVerified,
      user: getCurrentUser()?.id,
      userEmail: getCurrentUser()?.email,
      userRole,
      isDeveloper: hasRole('developer')
    });
  }, [location.pathname, isAuthenticated, isLoading, isEmailVerified, getCurrentUser, userRole, hasRole]);
  
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
    console.log("❌ AUTH CHECK FAILED - User not authenticated, redirecting to:", redirectTo);
    return <Navigate to={redirectTo} replace state={{ from: location }} />;
  }
  
  console.log("✅ AUTH CHECK PASSED - User authenticated");
  
  // Developer users bypass email verification
  const currentUser = getCurrentUser();
  const isDeveloper = hasRole('developer');
  
  if (requireEmailVerification && !isEmailVerified && !isDeveloper) {
    console.log("📧 EMAIL VERIFICATION CHECK - Not verified, redirecting");
    return <Navigate to="/login?verification=pending" replace />;
  }
  
  console.log("🎯 PROTECTED ROUTE SUCCESS - Rendering protected content for:", currentUser?.email);
  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
