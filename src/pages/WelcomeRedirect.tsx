
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "@/hooks/useAuth";
import { Spinner } from '@/components/ui/spinner';

const WelcomeRedirect = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();
  
  useEffect(() => {
    console.log("🎯 WelcomeRedirect - Auth state:", isLoading ? "loading" : (isAuthenticated ? "authenticated" : "not authenticated"));
    
    // Redirigi solo quando il caricamento è completo
    if (!isLoading) {
      if (isAuthenticated) {
        console.log("➡️ Redirecting to /home from welcome page");
        navigate('/home', { replace: true });
      } else {
        console.log("➡️ Redirecting to /login from welcome page");
        navigate('/login', { replace: true });
      }
    }
  }, [isAuthenticated, isLoading, navigate]);

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
      </div>
    </div>
  );
};

export default WelcomeRedirect;
