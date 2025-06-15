
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
  allowedRoles = ['user', 'developer', 'admin'],
  children,
  bypassCheck = false
}) => {
  const { isAuthenticated, isLoading, isEmailVerified, getCurrentUser, userRole, hasRole, isRoleLoading } = useAuthContext();
  const location = useLocation();
  
  const currentUser = getCurrentUser();
  const isDeveloper = hasRole('developer');
  const isAdmin = hasRole('admin');
  const isAdminRoute = location.pathname.startsWith('/admin') || location.pathname === '/test-admin-ui';
  
  useEffect(() => {
    console.log("🛡️ Role-based protected route check:", {
      path: location.pathname,
      isAuthenticated,
      isLoading,
      isEmailVerified,
      userRole,
      isRoleLoading,
      userId: currentUser?.id,
      email: currentUser?.email,
      allowedRoles,
      bypassCheck,
      isDeveloper,
      isAdmin
    });
  }, [location.pathname, isAuthenticated, isLoading, isEmailVerified, currentUser, userRole, allowedRoles, isRoleLoading, bypassCheck, isDeveloper, isAdmin]);
  
  // Special case for admin routes - only allow developers and admins
  if (isAdminRoute && !isDeveloper && !isAdmin && !isLoading && !isRoleLoading) {
    console.log("⛔ Access denied to admin route for user:", getCurrentUser()?.email);
    toast.error("Accesso riservato agli amministratori");
    return <Navigate to="/login" replace />;
  }
  
  // Waiting for authentication or role loading to complete
  if (isLoading || (isAuthenticated && isRoleLoading)) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-black">
        <Spinner className="h-8 w-8 text-white" />
        <div className="mt-3 text-white font-medium">
          {isRoleLoading ? 'Caricamento ruolo...' : 'Caricamento autenticazione...'}
        </div>
        <div className="mt-2 text-xs text-gray-400">
          {isDeveloper ? 'Developer access rilevato...' : 'Verifica permessi in corso...'}
        </div>
      </div>
    );
  }
  
  // If user is not authenticated, redirect to login
  if (!isAuthenticated) {
    console.log("⚠️ User not authenticated, redirecting to:", redirectTo);
    return <Navigate to={redirectTo} replace state={{ from: location }} />;
  }
  
  // Check for email verification if required (bypass for developers)
  if (requireEmailVerification && !isEmailVerified && !isDeveloper) {
    console.log("⚠️ Email not verified, redirecting to verification page");
    return <Navigate to="/login?verification=pending" replace />;
  }
  
  // Special access for developers and admins
  if (isDeveloper || isAdmin) {
    console.log("✅ Developer/Admin access granted for:", currentUser?.email);
    return children ? <>{children}</> : <Outlet />;
  }
  
  // Check if user has the required role
  const hasRequiredRole = allowedRoles.some(role => hasRole(role));
  
  if (!hasRequiredRole && !bypassCheck) {
    console.log("⛔ User does not have required role:", userRole, "needed:", allowedRoles);
    toast.error("Accesso negato", {
      description: "Non hai i permessi necessari per accedere a questa pagina"
    });
    return <Navigate to="/access-denied" replace />;
  }
  
  if (bypassCheck && !hasRequiredRole) {
    console.log("⚠️ Bypassing role check");
    toast.info("Accesso consentito in modalità speciale");
  }
  
  // User is authenticated, email is verified, and has the required role
  console.log("✅ Accesso confermato per:", currentUser?.email);
  return children ? <>{children}</> : <Outlet />;
};

export default RoleBasedProtectedRoute;
