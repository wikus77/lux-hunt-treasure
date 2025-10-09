
// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Landing Page diretta senza Laser Intro

import CookiebotInit from "@/components/cookiebot/CookiebotInit";
import LoadingManager from "./index/LoadingManager";
import CountdownManager from "./index/CountdownManager";
import MainContent from "./index/MainContent";
import { useEventHandlers } from "./index/EventHandlers";
import DeveloperAccess from "@/components/auth/DeveloperAccess";
import {
  useDeveloperAccess,
  useErrorRecovery,
  useIntroState,
  useMutationObserver,
  useHealthMonitor,
  useIndexHandlers
} from "./index/hooks";

const Index = () => {
  console.log("✅ LANDING MOUNTED - Index component rendering - PUBLIC LANDING PAGE - BY JOSEPH MULÈ");
  console.log("✅ ROUTE: Landing page component successfully mounted at /");
  
  // Custom hooks for organized state management
  const { showDeveloperAccess } = useDeveloperAccess();
  const { error, setError } = useErrorRecovery();
  const { introCompleted, setIntroCompleted } = useIntroState();
  const {
    pageLoaded,
    renderContent,
    countdownCompleted,
    handleLoaded,
    handleIntroComplete,
    handleCountdownComplete,
    handleRetry
  } = useIndexHandlers();

  // Side effects hooks
  useMutationObserver();
  useHealthMonitor(renderContent, pageLoaded, setError);
  
  // Get event handlers
  const {
    showAgeVerification,
    showInviteFriend,
    handleRegisterClick,
    handleAgeVerified,
    openInviteFriend,
    closeAgeVerification,
    closeInviteFriend
  } = useEventHandlers(countdownCompleted);

  // Show developer access screen for mobile users without access
  if (showDeveloperAccess) {
    return <DeveloperAccess />;
  }

  console.log("✅ LANDING RENDER STATE:", { introCompleted, pageLoaded, renderContent, showDeveloperAccess });

  return (
    <div className="min-h-screen flex flex-col w-full bg-black overflow-x-hidden full-viewport smooth-scroll">
      <CookiebotInit />
      
      <LoadingManager onLoaded={handleLoaded} />
      
      <CountdownManager onCountdownComplete={handleCountdownComplete} />
      
      <MainContent 
        pageLoaded={pageLoaded}
        introCompleted={introCompleted}
        renderContent={renderContent}
        error={error}
        countdownCompleted={countdownCompleted}
        showAgeVerification={showAgeVerification}
        showInviteFriend={showInviteFriend}
        onIntroComplete={() => {
          handleIntroComplete();
          setIntroCompleted(true);
        }}
        onRetry={handleRetry}
        onRegisterClick={handleRegisterClick}
        openInviteFriend={openInviteFriend}
        onCloseAgeVerification={closeAgeVerification}
        onCloseInviteFriend={closeInviteFriend}
        onAgeVerified={handleAgeVerified}
      />
    </div>
  );
};

export default Index;
