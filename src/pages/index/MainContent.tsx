
// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// MainContent senza IntroManager

import React from "react";
import ParallaxContainer from "@/components/ui/parallax-container";
import IndexContent from "@/components/index/IndexContent";
import ModalManager from "@/components/index/ModalManager";
import LoadingScreen from "@/components/index/LoadingScreen";
import ErrorFallback from "./ErrorFallback";
import XavierStyleLandingPage from "@/components/landing/XavierStyleLandingPage";

interface MainContentProps {
  pageLoaded: boolean;
  introCompleted: boolean;
  renderContent: boolean;
  error: Error | null;
  countdownCompleted: boolean;
  showAgeVerification: boolean;
  showInviteFriend: boolean;
  onIntroComplete: () => void;
  onRetry: () => void;
  onRegisterClick: () => void;
  openInviteFriend: () => void;
  onCloseAgeVerification: () => void;
  onCloseInviteFriend: () => void;
  onAgeVerified: () => void;
}

/**
 * Main content component for the Index page - Landing Page diretta
 */
const MainContent: React.FC<MainContentProps> = ({
  pageLoaded,
  introCompleted,
  renderContent,
  error,
  countdownCompleted,
  showAgeVerification,
  showInviteFriend,
  onIntroComplete,
  onRetry,
  onRegisterClick,
  openInviteFriend,
  onCloseAgeVerification,
  onCloseInviteFriend,
  onAgeVerified,
}) => {
  // Log di debug per la diagnostica
  React.useEffect(() => {
    console.log("MainContent - stato render:", { 
      pageLoaded, 
      introCompleted, 
      renderContent,
      error: error ? error.message : null
    });
  }, [pageLoaded, introCompleted, renderContent, error]);

  // Se c'è un errore, mostra error fallback
  if (error) {
    return <ErrorFallback error={error} onRetry={onRetry} />;
  }

  // Se la pagina non è caricata, mostra loading screen
  if (!renderContent || !pageLoaded) {
    return <LoadingScreen />;
  }

  // Renderizza la nuova landing page in stile Xavier Cusso
  return (
    <>
      <XavierStyleLandingPage
        onRegisterClick={onRegisterClick}
        openInviteFriend={openInviteFriend}
      />
      
      {/* Modals */}
      <ModalManager
        showAgeVerification={showAgeVerification}
        showInviteFriend={showInviteFriend}
        onCloseAgeVerification={onCloseAgeVerification}
        onCloseInviteFriend={onCloseInviteFriend}
        onAgeVerified={onAgeVerified}
      />
    </>
  );
};

export default MainContent;
