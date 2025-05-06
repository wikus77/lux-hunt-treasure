
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
    // Reset any cache issues that might be causing the blank screen
    localStorage.setItem('introShown', 'true'); // Force skip intro animation
    
    // Mark page as loaded
    setPageLoaded(true);
    
    // For emergency fix - if intro is blocking the page, mark it as completed
    setTimeout(() => {
      if (!introCompleted) {
        console.log("Force completing intro after timeout");
        setIntroCompleted(true);
      }
    }, 500); // Reduced timeout for faster display
    
  }, [introCompleted]);

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

  // Emergency fallback - if we're still seeing a blank screen, render content directly
  if (!pageLoaded) {
    return (
      <div className="min-h-screen flex flex-col w-full bg-black">
        <LoadingScreen />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col w-full bg-black">
      <ParallaxContainer>
        <IndexContent 
          countdownCompleted={countdownCompleted}
          onRegisterClick={handleRegisterClick}
          openInviteFriend={openInviteFriend}
        />
        
        <ModalManager
          showAgeVerification={showAgeVerification}
          showInviteFriend={showInviteFriend}
          onCloseAgeVerification={() => setShowAgeVerification(false)}
          onCloseInviteFriend={() => setShowInviteFriend(false)}
          onAgeVerified={handleAgeVerified}
        />
      </ParallaxContainer>
    </div>
  );
};

export default Index;
