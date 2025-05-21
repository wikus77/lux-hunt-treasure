
import { useState } from "react";

export function useBuzzUiState() {
  const [showDialog, setShowDialog] = useState(false);
  const [showExplosion, setShowExplosion] = useState(false);
  const [showClueBanner, setShowClueBanner] = useState(false);

  const handleExplosionCompleted = (callback?: () => void) => {
    setShowExplosion(false);
    if (callback) callback();
  };

  return {
    showDialog,
    setShowDialog,
    showExplosion,
    setShowExplosion,
    showClueBanner,
    setShowClueBanner,
    handleExplosionCompleted
  };
}
