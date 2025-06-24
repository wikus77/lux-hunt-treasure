
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
  const { isAuthenticated, isLoading, isEmailVerified, getCurrentUser } = useAuthContext();
  const location = useLocation();
  
  useEffect(() => {
    console.log("🛡️ CRITICAL PROTECTED ROUTE CHECK:", {
      path: location.pathname,
      isAuthenticated,
      isLoading,
      isEmailVerified,
      user: getCurrentUser()?.id,
      userEmail: getCurrentUser()?.email
    });
  }, [location.pathname, isAuthenticated, isLoading, isEmailVerified, getCurrentUser]);
  
  // CRITICAL: Extended loading state
  if (isLoading) {
    console.log("⏳ CRITICAL AUTHENTICATION LOADING...");
    return (
      <div className="flex justify-center items-center min-h-screen bg-black">
        <Spinner className="h-8 w-8 text-white" />
      </div>
    );
  }
  
  // CRITICAL: Authentication check
  if (!isAuthenticated) {
    console.log("❌ CRITICAL AUTH CHECK FAILED - User not authenticated, redirecting to:", redirectTo);
    return <Navigate to={redirectTo} replace state={{ from: location }} />;
  }
  
  console.log("✅ CRITICAL AUTH CHECK PASSED - User authenticated");
  
  // CRITICAL: Developer email always has access
  const currentUser = getCurrentUser();
  const isDeveloperEmail = currentUser?.email === 'wikus77@hotmail.it';
  
  if (requireEmailVerification && !isEmailVerified && !isDeveloperEmail) {
    console.log("📧 CRITICAL EMAIL VERIFICATION CHECK - Not verified, redirecting");
    return <Navigate to="/login?verification=pending" replace />;
  }
  
  console.log("🎯 CRITICAL PROTECTED ROUTE SUCCESS - Rendering protected content for:", currentUser?.email);
  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
