
import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useUnifiedAuth } from '@/hooks/use-unified-auth';
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
  const { isAuthenticated, isLoading, isEmailVerified, user } = useUnifiedAuth();
  const location = useLocation();
  
  useEffect(() => {
    console.log("🛡️ UNIFIED PROTECTED ROUTE CHECK:", {
      path: location.pathname,
      isAuthenticated,
      isLoading,
      isEmailVerified,
      userEmail: user?.email
    });
  }, [location.pathname, isAuthenticated, isLoading, isEmailVerified, user]);
  
  // Show loading during authentication check
  if (isLoading) {
    console.log("⏳ UNIFIED AUTH: Loading...");
    return (
      <div className="flex justify-center items-center min-h-screen bg-black">
        <div className="text-center">
          <Spinner className="h-8 w-8 text-white mx-auto mb-4" />
          <p className="text-white/70">Verifica autenticazione...</p>
        </div>
      </div>
    );
  }
  
  // Check authentication
  if (!isAuthenticated) {
    console.log("❌ UNIFIED AUTH: Not authenticated, redirecting to:", redirectTo);
    return <Navigate to={redirectTo} replace state={{ from: location }} />;
  }
  
  console.log("✅ UNIFIED AUTH: Authenticated");
  
  // Check email verification (skip for developer)
  const isDeveloper = user?.email === 'wikus77@hotmail.it';
  
  if (requireEmailVerification && !isEmailVerified && !isDeveloper) {
    console.log("📧 UNIFIED AUTH: Email not verified, redirecting");
    return <Navigate to="/login?verification=pending" replace />;
  }
  
  console.log("🎯 UNIFIED PROTECTED ROUTE: Success for:", user?.email);
  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
