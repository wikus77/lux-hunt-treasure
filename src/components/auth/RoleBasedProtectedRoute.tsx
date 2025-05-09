
import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthContext } from '@/contexts/auth';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';

interface RoleBasedProtectedRouteProps {
  redirectTo?: string;
  requireEmailVerification?: boolean;
  allowedRoles?: string[];
  children?: React.ReactNode;
}

export const RoleBasedProtectedRoute: React.FC<RoleBasedProtectedRouteProps> = ({ 
  redirectTo = '/login',
  requireEmailVerification = true,
  allowedRoles = ['user', 'admin', 'moderator'],
  children
}) => {
  const { isAuthenticated, isLoading, isEmailVerified, getCurrentUser, userRole, hasRole, isRoleLoading } = useAuthContext();
  const location = useLocation();
  
  useEffect(() => {
    console.log("Role-based protected route check:", {
      path: location.pathname,
      isAuthenticated,
      isLoading,
      isEmailVerified,
      userRole,
      isRoleLoading,
      user: getCurrentUser()?.id,
      allowedRoles
    });
  }, [location.pathname, isAuthenticated, isLoading, isEmailVerified, getCurrentUser, userRole, allowedRoles, isRoleLoading]);
  
  // Waiting for authentication or role loading to complete
  if (isLoading || (isAuthenticated && isRoleLoading)) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-black">
        <Spinner className="h-8 w-8 text-white" />
        <div className="ml-2 text-white font-medium">
          {isRoleLoading ? 'Caricamento ruolo...' : 'Caricamento...'}
        </div>
      </div>
    );
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
  
  // Check if user has the required role - only if role loading is complete
  const hasRequiredRole = allowedRoles.some(role => hasRole(role));
  
  if (!hasRequiredRole) {
    console.log("User does not have required role, redirecting to access denied");
    toast.error("Accesso negato", {
      description: "Non hai i permessi necessari per accedere a questa pagina"
    });
    return <Navigate to="/access-denied" replace />;
  }
  
  // User is authenticated, email is verified, and has the required role
  return children ? <>{children}</> : <Outlet />;
};

export default RoleBasedProtectedRoute;
