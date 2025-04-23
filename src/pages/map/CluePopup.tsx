
import React from "react";
import BuzzMapBanner from "@/components/buzz/BuzzMapBanner";

type CluePopupProps = {
  open: boolean;
  clueMessage: string;
  showBanner: boolean;
  onClose: () => void;
};

const CluePopup: React.FC<CluePopupProps> = ({
  open,
  clueMessage,
  showBanner,
  onClose
}) => (
  <BuzzMapBanner
    open={open && showBanner}
    message={clueMessage}
    area={null}
    onClose={onClose}
  />
);

export default CluePopup;
