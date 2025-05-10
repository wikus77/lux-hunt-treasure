
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
  // If there's an error, show error fallback
  if (error) {
    return <ErrorFallback error={error} onRetry={onRetry} />;
  }

  // If page isn't loaded or content shouldn't be rendered yet, show loading screen
  if (!renderContent || !pageLoaded) {
    return <LoadingScreen />;
  }

  // Show intro animation if needed
  return (
    <>
      {pageLoaded && (
        <IntroManager 
          pageLoaded={pageLoaded} 
          onIntroComplete={onIntroComplete}
        />
      )}
      
      {/* Main content rendered only when everything is ready */}
      {renderContent && introCompleted && (
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
      )}
    </>
  );
};

export default MainContent;
