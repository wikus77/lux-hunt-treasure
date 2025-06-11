
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
  // ✅ FIXED: Always call all hooks at the top level
  const { isAuthenticated, isLoading, isEmailVerified, getCurrentUser } = useAuthContext();
  const location = useLocation();
  
  useEffect(() => {
    console.log("Protected route check:", {
      path: location.pathname,
      isAuthenticated,
      isLoading,
      isEmailVerified,
      user: getCurrentUser()?.id
    });
  }, [location.pathname, isAuthenticated, isLoading, isEmailVerified, getCurrentUser]);
  
  // Always call getCurrentUser
  const currentUser = getCurrentUser();
  const isDeveloperEmail = currentUser?.email === 'wikus77@hotmail.it';
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-black">
        <Spinner className="h-8 w-8 text-white" />
      </div>
    );
  }
  
  // Check authentication
  if (!isAuthenticated) {
    console.log("User not authenticated, redirecting to:", redirectTo);
    return <Navigate to={redirectTo} replace state={{ from: location }} />;
  }
  
  // Check email verification for non-developer users
  if (requireEmailVerification && !isEmailVerified && !isDeveloperEmail) {
    console.log("Email not verified, redirecting to verification page");
    return <Navigate to="/login?verification=pending" replace />;
  }
  
  // Render protected content
  return children ? <>{children}</> : <Outlet />;
};

export const EmailVerificationGuard: React.FC<{children: React.ReactNode}> = ({ children }) => {
  // ✅ Always call hooks at top level
  const { isEmailVerified, getCurrentUser } = useAuthContext();
  const currentUser = getCurrentUser();
  const isDeveloperEmail = currentUser?.email === 'wikus77@hotmail.it';
  
  if (!isEmailVerified && !isDeveloperEmail) {
    return <EmailVerificationAlert />;
  }
  
  return <>{children}</>;
};

export default ProtectedRoute;
