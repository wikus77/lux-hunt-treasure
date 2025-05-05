
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthContext } from '@/contexts/auth';
import { Spinner } from '@/components/ui/spinner';

interface ProtectedRouteProps {
  redirectTo?: string;
  requireEmailVerification?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  redirectTo = '/login',
  requireEmailVerification = true
}) => {
  const { isAuthenticated, isLoading, isEmailVerified } = useAuthContext();
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-black">
        <Spinner className="h-8 w-8 text-white" />
      </div>
    );
  }
  
  // Se l'utente non è autenticato, reindirizza al login
  if (!isAuthenticated()) {
    return <Navigate to={redirectTo} replace />;
  }
  
  // Controllo aggiuntivo per la verifica dell'email se richiesta
  if (requireEmailVerification && !isEmailVerified) {
    return <Navigate to="/auth?verification=pending" replace />;
  }
  
  return <Outlet />;
};

export default ProtectedRoute;
