
import React from 'react';
import { useAuthContext } from '@/contexts/auth';
import { Navigate } from 'react-router-dom';
import HomeContent from '@/components/home/HomeContent';
import { Spinner } from '@/components/ui/spinner';

const AppHome = () => {
  const { isAuthenticated, isLoading, user } = useAuthContext();
  
  // ✅ FIXED: Always call all hooks before any conditional returns
  const isDeveloperEmail = user?.email === 'wikus77@hotmail.it';
  const hasDeveloperAccess = typeof window !== 'undefined' && localStorage.getItem('developer_access') === 'granted';
  const canAccess = isAuthenticated || isDeveloperEmail || hasDeveloperAccess;

  console.log('🏠 APP HOME: Authentication check', {
    isAuthenticated,
    isLoading,
    canAccess,
    isDeveloperEmail,
    hasDeveloperAccess,
    userEmail: user?.email
  });

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Spinner className="text-[#00D1FF]" size="lg" />
      </div>
    );
  }

  // Redirect if not authenticated
  if (!canAccess) {
    console.log('🏠 APP HOME: Redirecting to login - no access');
    return <Navigate to="/login" replace />;
  }

  // Render main content
  return <HomeContent />;
};

export default AppHome;
