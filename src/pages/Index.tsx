
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getMissionDeadline } from "@/utils/countdownDate";
import ParallaxContainer from "@/components/ui/parallax-container";

// Refactored components
import LoadingScreen from "@/components/index/LoadingScreen";
import IntroManager from "@/components/index/IntroManager";
import IndexContent from "@/components/index/IndexContent";
import ModalManager from "@/components/index/ModalManager";

const Index = () => {
  console.log("Index component rendering");
  
  // State management
  const [showAgeVerification, setShowAgeVerification] = useState(false);
  const [showInviteFriend, setShowInviteFriend] = useState(false);
  const [countdownCompleted, setCountdownCompleted] = useState(false);
  const [pageLoaded, setPageLoaded] = useState(false);
  const [introCompleted, setIntroCompleted] = useState(false);
  const navigate = useNavigate();
  
  // Get target date from utility function
  const nextEventDate = getMissionDeadline();
  
  // Add a useEffect to mark when the page is fully loaded
  useEffect(() => {
    if (document.readyState === 'complete') {
      console.log("Page already loaded");
      setPageLoaded(true);
    } else {
      console.log("Setting up load event listener");
      const handleLoad = () => {
        console.log("Page fully loaded");
        setPageLoaded(true);
      };
      window.addEventListener('load', handleLoad);
      return () => window.removeEventListener('load', handleLoad);
    }
  }, []);

  // Check if countdown has already passed
  useEffect(() => {
    const now = new Date();
    if (now > nextEventDate) {
      setCountdownCompleted(true);
    }
  }, [nextEventDate]);

  // Event handlers
  const handleRegisterClick = () => {
    if (countdownCompleted) {
      setShowAgeVerification(true);
    } else {
      console.log("Registration is disabled until countdown completes");
    }
  };

  const handleAgeVerified = () => {
    setShowAgeVerification(false);
    navigate("/register");
  };

  // Function to handle invite friend button click
  const openInviteFriend = () => {
    setShowInviteFriend(true);
  };

  // Callback for when countdown completes
  const handleCountdownComplete = () => {
    setCountdownCompleted(true);
  };

  // Console logging state for debugging
  console.log("Render state:", { introCompleted, pageLoaded });

  // Show loading screen if page is not fully loaded yet
  if (!pageLoaded) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen flex flex-col w-full bg-black overflow-x-hidden">
      {/* Intro animation manager */}
      {!introCompleted && (
        <IntroManager 
          pageLoaded={pageLoaded} 
          onIntroComplete={() => setIntroCompleted(true)}
        />
      )}
      
      {/* Main content - only shown after intro completes */}
      {introCompleted && (
        <ParallaxContainer>
          <IndexContent 
            countdownCompleted={countdownCompleted}
            onRegisterClick={handleRegisterClick}
            openInviteFriend={openInviteFriend}
          />
          
          {/* Modals */}
          <ModalManager
            showAgeVerification={showAgeVerification}
            showInviteFriend={showInviteFriend}
            onCloseAgeVerification={() => setShowAgeVerification(false)}
            onCloseInviteFriend={() => setShowInviteFriend(false)}
            onAgeVerified={handleAgeVerified}
          />
        </ParallaxContainer>
      )}
    </div>
  );
};

export default Index;
