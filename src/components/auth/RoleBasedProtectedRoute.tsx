
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
  bypassCheck?: boolean;
}

export const RoleBasedProtectedRoute: React.FC<RoleBasedProtectedRouteProps> = ({ 
  redirectTo = '/login',
  requireEmailVerification = true,
  allowedRoles = ['user', 'admin', 'moderator'],
  children,
  bypassCheck = false // For debugging, can bypass role check if needed
}) => {
  const { isAuthenticated, isLoading, isEmailVerified, getCurrentUser, userRole, hasRole, isRoleLoading } = useAuthContext();
  const location = useLocation();
  
  // Admin detection
  const isAdminEmail = getCurrentUser()?.email === 'wikus77@hotmail.it';
  const isAdminRoute = location.pathname === '/test-admin-ui' || location.pathname === '/auth-debug';
  
  useEffect(() => {
    console.log("Role-based protected route check:", {
      path: location.pathname,
      isAuthenticated,
      isLoading,
      isEmailVerified,
      userRole,
      isRoleLoading,
      user: getCurrentUser()?.id,
      email: getCurrentUser()?.email,
      allowedRoles,
      bypassCheck,
      isAdminEmail
    });
  }, [location.pathname, isAuthenticated, isLoading, isEmailVerified, getCurrentUser, userRole, allowedRoles, isRoleLoading, bypassCheck, isAdminEmail]);
  
  // Special case for admin routes - only allow wikus77@hotmail.it
  if (isAdminRoute && !isAdminEmail) {
    console.log("Access denied to admin route for non-admin email:", getCurrentUser()?.email);
    toast.error("Accesso riservato all'amministratore");
    return <Navigate to="/login" replace />;
  }
  
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
  
  // Special bypass for admin email or if bypassCheck is true
  const shouldBypass = bypassCheck || isAdminEmail;
  
  if (!hasRequiredRole && !shouldBypass) {
    console.log("User does not have required role, redirecting to access denied");
    toast.error("Accesso negato", {
      description: "Non hai i permessi necessari per accedere a questa pagina"
    });
    return <Navigate to="/access-denied" replace />;
  }
  
  if (shouldBypass && !hasRequiredRole) {
    console.log("Bypassing role check for admin email or debug mode");
    toast.info("Accesso consentito in modalità bypass", {
      description: "Stai accedendo con privilegi speciali"
    });
  }
  
  // User is authenticated, email is verified, and has the required role (or bypass is active)
  return children ? <>{children}</> : <Outlet />;
};

export default RoleBasedProtectedRoute;
