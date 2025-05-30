
import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import IntroAnimationOptions from "@/components/intro/IntroAnimationOptions";
import IndexContent from "@/components/index/IndexContent";
import InviteFriendDialog from "@/components/landing/InviteFriendDialog";
import { useAuthContext } from "@/contexts/auth";
import { toast } from "sonner";
import DeveloperLogin from "@/components/auth/DeveloperLogin";
import "@/styles/mobile-optimizations.css";

const Index = () => {
  const [showIntro, setShowIntro] = useState(false);
  const [countdownCompleted, setCountdownCompleted] = useState(false);
  const [inviteFriendOpen, setInviteFriendOpen] = useState(false);
  const [showDeveloperLogin, setShowDeveloperLogin] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  const { isAuthenticated, user } = useAuthContext();

  useEffect(() => {
    // Detect mobile device
    const userAgent = navigator.userAgent;
    const isMobileDevice = /iPhone|iPad|iPod|Android/i.test(userAgent);
    setIsMobile(isMobileDevice);

    // Check if intro should be shown
    const skipIntro = localStorage.getItem("skipIntro");
    if (!skipIntro) {
      setShowIntro(true);
    }
  }, []);

  // Se è mobile e l'utente è autenticato come sviluppatore, vai alla home
  if (isMobile && isAuthenticated && user?.email === 'wikus77@hotmail.it') {
    return <Navigate to="/home" replace />;
  }

  // Se è mobile e non autenticato come sviluppatore, mostra login sviluppatore
  if (isMobile && !isAuthenticated) {
    return <DeveloperLogin />;
  }

  const handleIntroComplete = () => {
    setShowIntro(false);
    localStorage.setItem("skipIntro", "true");
  };

  const handleRegisterClick = () => {
    if (isMobile) {
      setShowDeveloperLogin(true);
    } else {
      toast.info("Registrazione in arrivo!", {
        description: "La funzionalità sarà disponibile presto"
      });
    }
  };

  const openInviteFriend = () => {
    setInviteFriendOpen(true);
  };

  // Se deve mostrare l'intro, mostrala
  if (showIntro) {
    return <IntroAnimationOptions onComplete={handleIntroComplete} />;
  }

  // Se deve mostrare il login sviluppatore
  if (showDeveloperLogin) {
    return <DeveloperLogin />;
  }

  return (
    <div className="mobile-scroll mobile-safe-content retina-optimized">
      <IndexContent 
        countdownCompleted={countdownCompleted}
        onRegisterClick={handleRegisterClick}
        openInviteFriend={openInviteFriend}
      />
      
      <InviteFriendDialog 
        isOpen={inviteFriendOpen} 
        onClose={() => setInviteFriendOpen(false)} 
      />
    </div>
  );
};

export default Index;
