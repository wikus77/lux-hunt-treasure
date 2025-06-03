
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
      user: getCurrentUser()?.id,
      userEmail: getCurrentUser()?.email
    });
  }, [location.pathname, isAuthenticated, isLoading, isEmailVerified, getCurrentUser]);
  
  // 🔥 IMMEDIATE CAPACITOR BYPASS - NO AUTHENTICATION REQUIRED
  const isCapacitorApp = !!(window as any).Capacitor;
  if (isCapacitorApp) {
    console.log("🔓 CAPACITOR BYPASS: Allowing access without authentication");
    return children ? <>{children}</> : <Outlet />;
  }
  
  // Developer bypass for wikus77@hotmail.it
  const user = getCurrentUser();
  if (user?.email === "wikus77@hotmail.it") {
    console.log("🔓 Developer bypass: allowing access for wikus77@hotmail.it");
    return children ? <>{children}</> : <Outlet />;
  }
  
  // Check for developer bypass flags
  const developerBypass = sessionStorage.getItem('developer_bypass_active') === 'true' ||
                         sessionStorage.getItem('developer-access') === 'true' ||
                         sessionStorage.getItem('dev-bypass') === 'true';
  
  if (developerBypass) {
    console.log("🔓 Developer bypass active, allowing access");
    return children ? <>{children}</> : <Outlet />;
  }
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-black">
        <Spinner className="h-8 w-8 text-white" />
      </div>
    );
  }
  
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
  
  if (!isEmailVerified) {
    return <EmailVerificationAlert />;
  }
  
  return <>{children}</>;
};

export default ProtectedRoute;
