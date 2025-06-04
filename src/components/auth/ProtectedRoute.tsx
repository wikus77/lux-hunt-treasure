
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
    console.log("Protected route check:", {
      path: location.pathname,
      isAuthenticated,
      isLoading,
      isEmailVerified,
      user: getCurrentUser()?.id
    });
  }, [location.pathname, isAuthenticated, isLoading, isEmailVerified, getCurrentUser]);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-black">
        <Spinner className="h-8 w-8 text-white" />
      </div>
    );
  }
  
  // ✅ CONTROLLO PRIORITARIO: Developer access from localStorage
  const hasDeveloperAccess = localStorage.getItem("developer_access") === "granted";
  const isDeveloperEmail = localStorage.getItem("developer_user_email") === "wikus77@hotmail.it";
  
  if (hasDeveloperAccess || isDeveloperEmail) {
    console.log("🔑 Developer access granted via localStorage - bypassing all auth checks");
    return children ? <>{children}</> : <Outlet />;
  }
  
  // If user is not authenticated, redirect to login
  if (!isAuthenticated) {
    console.log("User not authenticated, redirecting to:", redirectTo);
    return <Navigate to={redirectTo} replace state={{ from: location }} />;
  }
  
  // Check for email verification if required
  if (requireEmailVerification && !isEmailVerified) {
    console.log("Email not verified, redirecting to verification page");
    return <Navigate to="/login?verification=pending" replace />;
  }
  
  // User is authenticated and email is verified, render the protected route
  return children ? <>{children}</> : <Outlet />;
};

// Export a component that can be used directly in pages to show a verification alert
export const EmailVerificationGuard: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const { isEmailVerified } = useAuthContext();
  
  // ✅ CONTROLLO PRIORITARIO: Developer access
  const hasDeveloperAccess = localStorage.getItem("developer_access") === "granted";
  const isDeveloperEmail = localStorage.getItem("developer_user_email") === "wikus77@hotmail.it";
  
  if (hasDeveloperAccess || isDeveloperEmail) {
    return <>{children}</>;
  }
  
  if (!isEmailVerified) {
    return <EmailVerificationAlert />;
  }
  
  return <>{children}</>;
};

export default ProtectedRoute;
