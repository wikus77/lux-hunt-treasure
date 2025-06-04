
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "@/hooks/useAuth";
import { Spinner } from '@/components/ui/spinner';

const WelcomeRedirect = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, session, user } = useAuth();
  
  useEffect(() => {
    console.log("🎯 WelcomeRedirect - Detailed state:", {
      isLoading,
      isAuthenticated,
      hasSession: !!session,
      hasUser: !!user,
      userEmail: user?.email
    });
    
    // Redirigi solo quando il caricamento è completo
    if (!isLoading) {
      if (session && isAuthenticated) {
        console.log("➡️ Redirecting to /home from welcome page (session + auth confirmed)");
        navigate('/home', { replace: true });
      } else {
        console.log("➡️ Redirecting to /login from welcome page (no session/auth)");
        navigate('/login', { replace: true });
      }
    } else {
      console.log("⏳ Still loading in WelcomeRedirect, waiting...");
    }
  }, [isAuthenticated, isLoading, session, user, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black">
      <div className="text-center">
        <div className="mb-6">
          <Spinner className="h-12 w-12 text-projectx-blue" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">
          <span className="text-projectx-blue">M1</span>SSION™
        </h1>
        <p className="text-gray-400">Reindirizzamento in corso...</p>
        <p className="text-gray-500 text-sm mt-2">Debug: Loading={isLoading ? 'true' : 'false'}, Auth={isAuthenticated ? 'true' : 'false'}</p>
      </div>
    </div>
  );
};

export default WelcomeRedirect;
