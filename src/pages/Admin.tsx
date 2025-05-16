'use client';
import { useEffect } from 'react';
import { useAuthContext } from '@/contexts/auth';
import { Navigate } from 'react-router-dom';
import AdminPrizeForm from './AdminPrizeForm';

export default function Admin() {
  const { isAuthenticated, isLoading, userRole, hasRole } = useAuthContext();

  useEffect(() => {
    document.title = 'Admin Dashboard - M1SSION';
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  if (!isAuthenticated || !hasRole('admin')) {
    return <Navigate to="/access-denied" replace />;
  }

  return (
    <div className="min-h-screen bg-black text-white pt-16 px-4">
      <h1 className="text-2xl font-bold mb-6 text-center">🛠 Pannello Amministratore</h1>
      <AdminPrizeForm />
    </div>
  );
}
