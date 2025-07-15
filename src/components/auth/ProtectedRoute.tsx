
import React, { useEffect } from 'react';
import { useZustandNavigation } from '@/hooks/useZustandNavigation';
import { useAuthContext } from '@/contexts/auth';
import { Spinner } from '@/components/ui/spinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
  requireEmailVerification?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children,
  redirectTo = '/login',
  requireEmailVerification = true
}) => {
  const { isAuthenticated, isLoading, isEmailVerified, getCurrentUser, userRole, hasRole } = useAuthContext();
  const { currentPath, navigate } = useZustandNavigation();
  
  useEffect(() => {
    console.log("🛡️ PROTECTED ROUTE CHECK:", {
      path: currentPath,
      isAuthenticated,
      isLoading,
      isEmailVerified,
      user: getCurrentUser()?.id,
      userEmail: getCurrentUser()?.email,
      userRole,
      isDeveloper: hasRole('developer')
    });
  }, [currentPath, isAuthenticated, isLoading, isEmailVerified, getCurrentUser, userRole, hasRole]);
  
  // Show loading during authentication check
  if (isLoading) {
    console.log("⏳ AUTHENTICATION LOADING...");
    return (
      <div className="flex justify-center items-center min-h-screen bg-black">
        <Spinner className="h-8 w-8 text-white" />
      </div>
    );
  }
  
  // Check authentication
  if (!isAuthenticated) {
    console.log("❌ AUTH CHECK FAILED - User not authenticated, redirecting to:", redirectTo);
    navigate(redirectTo);
    return null;
  }
  
  console.log("✅ AUTH CHECK PASSED - User authenticated");
  
  // Developer users bypass email verification
  const currentUser = getCurrentUser();
  const isDeveloper = hasRole('developer');
  
  if (requireEmailVerification && !isEmailVerified && !isDeveloper) {
    console.log("📧 EMAIL VERIFICATION CHECK - Not verified, redirecting");
    navigate('/login?verification=pending');
    return null;
  }
  
  console.log("🎯 PROTECTED ROUTE SUCCESS - Rendering protected content for:", currentUser?.email);
  return <>{children}</>;
};

export default ProtectedRoute;
