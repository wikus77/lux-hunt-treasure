
import React from "react";
import AgeVerificationModal from "@/components/auth/AgeVerificationModal";
import InviteFriendDialog from "@/components/landing/InviteFriendDialog";

interface ModalManagerProps {
  showAgeVerification: boolean;
  showInviteFriend: boolean;
  onCloseAgeVerification: () => void;
  onCloseInviteFriend: () => void;
  onAgeVerified: () => void;
}

const ModalManager = ({
  showAgeVerification,
  showInviteFriend,
  onCloseAgeVerification,
  onCloseInviteFriend,
  onAgeVerified
}: ModalManagerProps) => {
  return (
    <>
      <AgeVerificationModal
        open={showAgeVerification}
        onClose={onCloseAgeVerification}
        onVerified={onAgeVerified}
      />
      
      <InviteFriendDialog
        isOpen={showInviteFriend}
        onClose={onCloseInviteFriend}
      />
    </>
  );
};

export default ModalManager;
