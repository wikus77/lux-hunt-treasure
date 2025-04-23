
import React from "react";
import CluePopup from "../CluePopup";
import BuzzMapBanner from "@/components/buzz/BuzzMapBanner";
import { SearchArea } from "@/components/maps/MapMarkers";

interface MapNotificationsProps {
  showCluePopup: boolean;
  clueMessage: string;
  activeSearchArea: string | null;
  searchAreas: SearchArea[];
  onCloseClue: () => void;
  onCloseArea: () => void;
}

const MapNotifications = ({
  showCluePopup,
  clueMessage,
  activeSearchArea,
  searchAreas,
  onCloseClue,
  onCloseArea,
}: MapNotificationsProps) => {
  const activeArea = activeSearchArea ? searchAreas.find(a => a.id === activeSearchArea) : null;

  return showCluePopup ? (
    <CluePopup 
      open={showCluePopup} 
      clueMessage={clueMessage} 
      showBanner={false} 
      onClose={onCloseClue}
    />
  ) : (
    <BuzzMapBanner 
      open={!!activeSearchArea} 
      area={activeArea ? {
        lat: activeArea.lat,
        lng: activeArea.lng,
        radius: activeArea.radius,
        label: activeArea.label,
        confidence: activeArea.confidence || 'Media'
      } : null} 
      onClose={onCloseArea}
    />
  );
};

export default MapNotifications;
