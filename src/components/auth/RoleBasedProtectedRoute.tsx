
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
  
  // Admin detection - permetti sempre accesso a wikus77@hotmail.it
  const currentUser = getCurrentUser();
  const isAdminEmail = currentUser?.email === 'wikus77@hotmail.it';
  const isAdminRoute = location.pathname.startsWith('/admin') || location.pathname === '/test-admin-ui' || location.pathname === '/auth-debug';
  
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
      isAdminEmail
    });
  }, [location.pathname, isAuthenticated, isLoading, isEmailVerified, currentUser, userRole, allowedRoles, isRoleLoading, bypassCheck, isAdminEmail]);
  
  // Special case for admin routes - only allow wikus77@hotmail.it
  if (isAdminRoute && !isAdminEmail && !isLoading) {
    console.log("⛔ Access denied to admin route for non-admin email:", getCurrentUser()?.email);
    toast.error("Accesso riservato all'amministratore");
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
          {isAdminEmail ? 'Admin email rilevata, autorizzazione in corso...' : 'Verifica permessi in corso...'}
        </div>
      </div>
    );
  }
  
  // If user is not authenticated, redirect to login
  if (!isAuthenticated) {
    console.log("⚠️ User not authenticated, redirecting to:", redirectTo);
    return <Navigate to={redirectTo} replace state={{ from: location }} />;
  }
  
  // Check for email verification if required
  if (requireEmailVerification && !isEmailVerified && !isAdminEmail) {
    console.log("⚠️ Email not verified, redirecting to verification page");
    return <Navigate to="/login?verification=pending" replace />;
  }
  
  // Special bypass for admin email - permetti sempre l'accesso
  if (isAdminEmail) {
    console.log("✅ Accesso consentito per email admin:", isAdminEmail);
    return children ? <>{children}</> : <Outlet />;
  }
  
  // Check if user has the required role - only if role loading is complete and we're not bypassing
  const hasRequiredRole = allowedRoles.some(role => hasRole(role));
  
  // Special bypass for debugging or admin email
  const shouldBypass = bypassCheck || isAdminEmail;
  
  if (!hasRequiredRole && !shouldBypass) {
    console.log("⛔ User does not have required role:", userRole, "needed:", allowedRoles);
    toast.error("Accesso negato", {
      description: "Non hai i permessi necessari per accedere a questa pagina"
    });
    return <Navigate to="/access-denied" replace />;
  }
  
  if (shouldBypass && !hasRequiredRole) {
    console.log("⚠️ Bypassing role check:", shouldBypass ? "bypass enabled" : "admin email");
    toast.info("Accesso consentito in modalità speciale", {
      description: "Stai accedendo con privilegi speciali"
    });
  }
  
  // User is authenticated, email is verified, and has the required role (or bypass is active)
  console.log("✅ Accesso confermato per:", currentUser?.email);
  return children ? <>{children}</> : <Outlet />;
};

export default RoleBasedProtectedRoute;
