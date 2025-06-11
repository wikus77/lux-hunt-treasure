
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
    console.log("🛡️ Protected route check:", {
      path: location.pathname,
      isAuthenticated,
      isLoading,
      isEmailVerified,
      user: getCurrentUser()?.id,
      userEmail: getCurrentUser()?.email
    });
  }, [location.pathname, isAuthenticated, isLoading, isEmailVerified, getCurrentUser]);
  
  // CRITICAL: Extended loading time to allow session persistence
  if (isLoading) {
    console.log("⏳ Authentication still loading, showing spinner...");
    return (
      <div className="flex justify-center items-center min-h-screen bg-black">
        <Spinner className="h-8 w-8 text-white" />
      </div>
    );
  }
  
  // If user is not authenticated, redirect to login
  if (!isAuthenticated) {
    console.log("❌ User not authenticated, redirecting to:", redirectTo);
    return <Navigate to={redirectTo} replace state={{ from: location }} />;
  }
  
  console.log("✅ User authenticated, proceeding to protected route");
  
  // DEVELOPER EMAIL ALWAYS HAS ACCESS - NO VERIFICATION REQUIRED
  const currentUser = getCurrentUser();
  const isDeveloperEmail = currentUser?.email === 'wikus77@hotmail.it';
  
  if (requireEmailVerification && !isEmailVerified && !isDeveloperEmail) {
    console.log("📧 Email not verified, redirecting to verification page");
    return <Navigate to="/login?verification=pending" replace />;
  }
  
  // User is authenticated and email is verified (or is developer), render the protected route
  console.log("🎯 Rendering protected content for authenticated user");
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
