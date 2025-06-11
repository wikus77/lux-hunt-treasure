
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/contexts/auth';
import { useDeveloperAutoLogin } from '@/hooks/useDeveloperAutoLogin';
import LoadingScreen from '@/components/index/LoadingScreen';
import IntroManager from '@/components/index/IntroManager';

const AppHome: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading, getCurrentUser } = useAuthContext();
  const [pageLoaded, setPageLoaded] = useState(false);
  const [introCompleted, setIntroCompleted] = useState(false);

  // Initialize developer auto-login
  useDeveloperAutoLogin();

  // FIXED: Stabilized page loading without early returns before hooks
  useEffect(() => {
    const timer = setTimeout(() => {
      setPageLoaded(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleIntroComplete = () => {
    setIntroCompleted(true);
    
    // FIXED: Check authentication state after intro
    const currentUser = getCurrentUser();
    const isDeveloper = currentUser?.email === 'wikus77@hotmail.it';
    const hasDeveloperAccess = localStorage.getItem('developer_access') === 'granted';
    
    if (isDeveloper || hasDeveloperAccess) {
      console.log('🔧 Developer: Redirecting to /home');
      navigate('/home');
    } else if (isAuthenticated) {
      console.log('✅ User authenticated: Redirecting to /home');
      navigate('/home');
    } else {
      console.log('❌ User not authenticated: Redirecting to /login');
      navigate('/login');
    }
  };

  // CRITICAL FIX: NO EARLY RETURNS BEFORE ALL HOOKS ARE CALLED
  // All hooks must be called before any conditional logic

  // Show loading screen during auth check
  if (authLoading || !pageLoaded) {
    return <LoadingScreen />;
  }

  // Show intro if not completed
  if (!introCompleted) {
    return (
      <IntroManager 
        pageLoaded={pageLoaded}
        onIntroComplete={handleIntroComplete}
      />
    );
  }

  // Final fallback - should not reach here due to navigation in handleIntroComplete
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-white">Reindirizzamento in corso...</div>
    </div>
  );
};

export default AppHome;
