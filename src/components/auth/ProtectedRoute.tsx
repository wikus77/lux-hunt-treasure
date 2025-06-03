
import React from 'react';
import { Outlet } from 'react-router-dom';

interface ProtectedRouteProps {
  redirectTo?: string;
  requireEmailVerification?: boolean;
  children?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children
}) => {
  
  // BYPASS ALL AUTHENTICATION - ALWAYS ALLOW ACCESS
  console.log("🔓 BYPASSING ALL AUTHENTICATION CHECKS");
  
  // Always render the protected content without any checks
  return children ? <>{children}</> : <Outlet />;
};

export const EmailVerificationGuard: React.FC<{children: React.ReactNode}> = ({ children }) => {
  // BYPASS EMAIL VERIFICATION
  return <>{children}</>;
};

export default ProtectedRoute;
