
import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import UnifiedHeader from "@/components/layout/UnifiedHeader";
import BuzzFeatureWrapper from "@/components/buzz/BuzzFeatureWrapper";
import BuzzMainContent from "@/components/buzz/BuzzMainContent";
import { ErrorBoundary } from "@/components/error/ErrorBoundary";
import ErrorFallback from "@/components/error/ErrorFallback";
import BottomNavigation from "@/components/layout/BottomNavigation";
import { useAuthContext } from "@/contexts/auth";

const Buzz = () => {
  const { user, isAuthenticated } = useAuthContext();
  const navigate = useNavigate();
  const [isValidatingAuth, setIsValidatingAuth] = React.useState(true);

  // ✅ FASE 1 - Enhanced authentication check with logging for /buzz page
  React.useEffect(() => {
    const validateAuthentication = async () => {
      console.log("🔥 LIVELLO 1 – BUZZ PAGE AUTH CHECK:", {
        user: user ? user.id : "null",
        email: user?.email || "no email",
        pathname: window.location.pathname,
        isAuthenticated
      });
      
      // Check if developer email - should always have access
      const isDeveloperEmail = user?.email === 'wikus77@hotmail.it';
      const hasDeveloperAccess = localStorage.getItem('developer_access') === 'granted';
      
      console.log('🔍 LIVELLO 1 – DEVELOPER ACCESS CHECK:', {
        isDeveloperEmail,
        hasDeveloperAccess,
        userEmail: user?.email
      });

      const finalAuthenticated = isAuthenticated || hasDeveloperAccess || isDeveloperEmail;
      
      if (!finalAuthenticated) {
        console.log("❌ LIVELLO 1 ERROR - User not authenticated, redirecting to login");
      } else {
        console.log("✅ LIVELLO 1 SUCCESS - User authenticated, showing BUZZ interface");
      }
      
      setIsValidatingAuth(false);
    };

    validateAuthentication();
  }, [user, isAuthenticated]);

  // Enhanced authentication check - allow developer access
  const isDeveloperEmail = user?.email === 'wikus77@hotmail.it';
  const hasDeveloperAccess = localStorage.getItem('developer_access') === 'granted';
  const finalAuthenticated = isAuthenticated || hasDeveloperAccess || isDeveloperEmail;

  // Show loading during auth validation
  if (isValidatingAuth) {
    return (
      <motion.div 
        className="bg-gradient-to-b from-[#131524]/70 to-black w-full min-h-screen flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center p-8">
          <div className="animate-spin w-12 h-12 border-4 border-t-transparent border-blue-500 rounded-full mx-auto mb-4"></div>
          <p className="text-white">Validating authentication...</p>
        </div>
      </motion.div>
    );
  }

  // Proper authentication check with developer bypass
  if (!finalAuthenticated) {
    return (
      <motion.div 
        className="bg-gradient-to-b from-[#131524]/70 to-black w-full min-h-screen flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center p-8">
          <h1 className="text-4xl font-orbitron font-bold text-[#00D1FF] mb-4">
            BUZZ
          </h1>
          <p className="text-white mb-6">Devi essere autenticato per accedere a questa sezione.</p>
          <Button 
            onClick={() => {
              console.log("🔥 LIVELLO 1 – REDIRECT TO LOGIN");
              navigate("/login");
            }}
            className="bg-gradient-to-r from-[#00D1FF] to-[#7B2EFF] text-white px-6 py-2"
          >
            Accedi
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="bg-gradient-to-b from-[#131524]/70 to-black w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{ 
        height: '100dvh',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      {/* Fixed Header */}
      <header 
        className="fixed top-0 left-0 right-0 z-50"
        style={{
          height: '72px',
          paddingTop: 'env(safe-area-inset-top, 47px)',
          backgroundColor: 'rgba(19, 21, 36, 0.7)',
          backdropFilter: 'blur(12px)'
        }}
      >
        <UnifiedHeader />
      </header>
      
      {/* Main scrollable content */}
      <main
        style={{
          paddingTop: 'calc(72px + env(safe-area-inset-top, 47px) + 40px)',
          paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 34px))',
          height: '100dvh',
          overflowY: 'auto',
          position: 'relative',
          zIndex: 0
        }}
      >
        <div className="container mx-auto">
          <motion.h1
            className="text-4xl font-orbitron font-bold text-[#00D1FF] text-center mt-6 mb-8"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            style={{ textShadow: "0 0 10px rgba(0, 209, 255, 0.6), 0 0 20px rgba(0, 209, 255, 0.3)" }}
          >
            BUZZ
          </motion.h1>
          
          <ErrorBoundary fallback={<ErrorFallback message="Si è verificato un errore nel caricamento della funzione Buzz" />}>
            <BuzzFeatureWrapper>
              <BuzzMainContent />
            </BuzzFeatureWrapper>
          </ErrorBoundary>
        </div>
      </main>
      
      {/* ✅ FASE 5 – VISUALIZZAZIONE UI - Ensure BottomNavigation appears */}
      <div 
        className="fixed bottom-0 left-0 right-0 z-40"
        style={{
          paddingBottom: 'env(safe-area-inset-bottom, 34px)'
        }}
      >
        <BottomNavigation />
      </div>
    </motion.div>
  );
};

export default Buzz;
