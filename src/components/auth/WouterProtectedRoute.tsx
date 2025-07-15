// M1SSION™ - Wouter-compatible ProtectedRoute Component
// 🔐 FIRMATO: Joseph Mulè – CEO NIYVORA KFT™

import React from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import Login from '@/pages/Login';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const [location, setLocation] = useLocation();

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-white">Caricamento...</div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    // Use Wouter navigation instead of Navigate component
    if (location !== '/login') {
      setLocation('/login');
    }
    return <Login />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;