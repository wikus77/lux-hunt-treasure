
import { useState } from "react";
import { useWouterNavigation } from "@/hooks/useWouterNavigation";

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
  const { navigate } = useWouterNavigation();
  const [showAgeVerification, setShowAgeVerification] = useState(false);
  const [showInviteFriend, setShowInviteFriend] = useState(false);

  // Event handlers
  const handleRegisterClick = () => {
    // Track Plausible event
    if (typeof window !== 'undefined' && window.plausible) {
      window.plausible('click_cta_join');
    }
    
    // FLUSSO CORRETTO: Landing → Login (non Age Verification)
    navigate("/login");
  };

  const handleAgeVerified = () => {
    setShowAgeVerification(false);
    navigate("/subscriptions");
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
