
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface EventHandlersResult {
  showAgeVerification: boolean;
  showInviteFriend: boolean;
  handleRegisterClick: () => void;
  handleAgeVerified: () => void;
  openInviteFriend: () => void;
  closeAgeVerification: () => void;
  closeInviteFriend: () => void;
}

/**
 * Custom hook to handle all event handlers for the Index page
 */
export const useEventHandlers = (countdownCompleted: boolean): EventHandlersResult => {
  const navigate = useNavigate();
  const [showAgeVerification, setShowAgeVerification] = useState(false);
  const [showInviteFriend, setShowInviteFriend] = useState(false);

  // Event handlers
  const handleRegisterClick = () => {
    // Track Plausible event
    if (typeof window !== 'undefined' && window.plausible) {
      window.plausible('click_cta_join');
    }
    
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

  const closeAgeVerification = () => {
    setShowAgeVerification(false);
  };

  const closeInviteFriend = () => {
    setShowInviteFriend(false);
  };

  return {
    showAgeVerification,
    showInviteFriend,
    handleRegisterClick,
    handleAgeVerified,
    openInviteFriend,
    closeAgeVerification,
    closeInviteFriend
  };
};
