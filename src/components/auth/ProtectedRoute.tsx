
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthContext';
import { Spinner } from '@/components/ui/spinner';

interface ProtectedRouteProps {
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  redirectTo = '/login'
}) => {
  const { isAuthenticated, isLoading } = useAuthContext();
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-black">
        <Spinner className="h-8 w-8 text-white" />
      </div>
    );
  }
  
  if (!isAuthenticated()) {
    return <Navigate to={redirectTo} replace />;
  }
  
  return <Outlet />;
};

export default ProtectedRoute;
