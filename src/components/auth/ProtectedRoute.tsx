
import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthContext } from '@/contexts/auth';
import { Spinner } from '@/components/ui/spinner';
import EmailVerificationAlert from './EmailVerificationAlert';

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
    console.log("🛡️ ENHANCED PROTECTED ROUTE CHECK:", {
      path: location.pathname,
      isAuthenticated,
      isLoading,
      isEmailVerified,
      user: getCurrentUser()?.id,
      userEmail: getCurrentUser()?.email,
      session: !!getCurrentUser()
    });
  }, [location.pathname, isAuthenticated, isLoading, isEmailVerified, getCurrentUser]);
  
  // CRITICAL: Enhanced loading state with extended timeout
  if (isLoading) {
    console.log("⏳ ENHANCED AUTHENTICATION LOADING...");
    return (
      <div className="flex justify-center items-center min-h-screen bg-black">
        <Spinner className="h-8 w-8 text-white" />
      </div>
    );
  }
  
  // CRITICAL: Enhanced authentication check
  if (!isAuthenticated) {
    console.log("❌ ENHANCED AUTH CHECK FAILED - User not authenticated, redirecting to:", redirectTo);
    console.log("📊 ENHANCED AUTH STATE:", {
      session: !!getCurrentUser(),
      loading: isLoading,
      authenticated: isAuthenticated
    });
    return <Navigate to={redirectTo} replace state={{ from: location }} />;
  }
  
  console.log("✅ ENHANCED AUTH CHECK PASSED - User authenticated");
  
  // DEVELOPER EMAIL ALWAYS HAS ACCESS - NO VERIFICATION REQUIRED
  const currentUser = getCurrentUser();
  const isDeveloperEmail = currentUser?.email === 'wikus77@hotmail.it';
  
  if (requireEmailVerification && !isEmailVerified && !isDeveloperEmail) {
    console.log("📧 ENHANCED EMAIL VERIFICATION CHECK - Not verified, redirecting");
    return <Navigate to="/login?verification=pending" replace />;
  }
  
  // CRITICAL: Enhanced success logging
  console.log("🎯 ENHANCED PROTECTED ROUTE SUCCESS - Rendering protected content for:", currentUser?.email);
  return children ? <>{children}</> : <Outlet />;
};

// Export a component that can be used directly in pages to show a verification alert
export const EmailVerificationGuard: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const { isEmailVerified, getCurrentUser } = useAuthContext();
  
  const currentUser = getCurrentUser();
  const isDeveloperEmail = currentUser?.email === 'wikus77@hotmail.it';
  
  if (!isEmailVerified && !isDeveloperEmail) {
    return <EmailVerificationAlert />;
  }
  
  return <>{children}</>;
};

export default ProtectedRoute;
