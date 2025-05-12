
import React from "react";
import ParallaxContainer from "@/components/ui/parallax-container";
import IndexContent from "@/components/index/IndexContent";
import ModalManager from "@/components/index/ModalManager";
import IntroManager from "@/components/index/IntroManager";
import LoadingScreen from "@/components/index/LoadingScreen";
import ErrorFallback from "./ErrorFallback";

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
 * Main content component for the Index page
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
  // Aggiungiamo log per diagnosticare il problema
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
    console.error("⚠️ Rilevato errore nel MainContent:", error);
    return <ErrorFallback error={error} onRetry={onRetry} />;
  }

  // BUGFIX: MOSTRIAMO SEMPRE IL CONTENUTO PRINCIPALE, BYPASSA CONTROLLI CHE CAUSANO SCHERMO VUOTO
  // Questo è un fix temporaneo per garantire che il contenuto venga sempre mostrato
  const shouldShowContent = true; // pageLoaded && introCompleted && renderContent;
  
  if (shouldShowContent) {
    console.log("✅ MainContent: Renderizzando contenuto principale");
    return (
      <ParallaxContainer>
        <IndexContent 
          countdownCompleted={countdownCompleted}
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
      </ParallaxContainer>
    );
  }
  
  // Se l'intro non è ancora completata ma la pagina è caricata, mostro l'IntroManager
  if (pageLoaded && !introCompleted) {
    console.log("➡️ MainContent: Mostrando IntroManager");
    return (
      <IntroManager 
        pageLoaded={pageLoaded} 
        onIntroComplete={onIntroComplete}
      />
    );
  }

  // In qualsiasi altro caso, mostro la schermata di caricamento
  console.log("⏳ MainContent: Mostrando LoadingScreen");
  return <LoadingScreen />;
};

export default MainContent;
