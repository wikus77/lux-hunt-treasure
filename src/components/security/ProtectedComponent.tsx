
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthContext } from '@/contexts/auth';
import { Spinner } from '@/components/ui/spinner';

interface ProtectedComponentProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireRole?: string;
  fallback?: React.ReactNode;
}

export const ProtectedComponent: React.FC<ProtectedComponentProps> = ({
  children,
  requireAuth = true,
  requireRole,
  fallback
}) => {
  const { isAuthenticated, isLoading, hasRole, isRoleLoading } = useAuthContext();

  if (isLoading || (requireRole && isRoleLoading)) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Spinner className="h-6 w-6 text-white" />
      </div>
    );
  }

  if (requireAuth && !isAuthenticated) {
    if (fallback) {
      return <>{fallback}</>;
    }
    return <Navigate to="/login" replace />;
  }

  if (requireRole && !hasRole(requireRole)) {
    if (fallback) {
      return <>{fallback}</>;
    }
    return <Navigate to="/access-denied" replace />;
  }

  return <>{children}</>;
};
