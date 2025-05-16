
import { useEffect } from 'react';
import { useAuthContext } from '@/contexts/auth';
import { Navigate } from 'react-router-dom';
import AdminPrizeForm from './AdminPrizeForm';

export default function Admin() {
  const { isAuthenticated, isLoading, userRole, hasRole } = useAuthContext();
  
  useEffect(() => {
    document.title = "Admin Dashboard - M1SSION";
  }, []);
  
  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }
  
  // Redirect if not authenticated or not admin
  if (!isAuthenticated || !hasRole('admin')) {
    return <Navigate to="/access-denied" replace />;
  }
  
  return (
    <div className="min-h-screen bg-black text-white pt-16">
      <AdminPrizeForm />
    </div>
  );
}
