
import React from "react";
import { useBuzzFeature } from "@/hooks/useBuzzFeature";
import BuzzUnlockDialog from "@/components/buzz/BuzzUnlockDialog";
import BuzzExplosionHandler from "@/components/buzz/BuzzExplosionHandler";
import ClueBanner from "@/components/buzz/ClueBanner";

interface BuzzFeatureProps {
  children: React.ReactNode;
}

// Re-export for backward compatibility
export { useBuzzFeature };

export default function BuzzFeatureWrapper({ children }: BuzzFeatureProps) {
  const {
    showDialog,
    setShowDialog,
    showExplosion,
    showClueBanner,
    setShowClueBanner,
    unlockedClues,
    handlePayment,
    handleExplosionCompleted
  } = useBuzzFeature();

  return (
    <>
      {children}
      <BuzzUnlockDialog 
        open={showDialog} 
        onOpenChange={setShowDialog} 
        handlePayment={handlePayment} 
      />
      <BuzzExplosionHandler 
        show={showExplosion} 
        onCompleted={handleExplosionCompleted} 
      />
      <ClueBanner 
        open={showClueBanner} 
        message={unlockedClues.toString()} 
        onClose={() => setShowClueBanner(false)} 
      />
    </>
  );
}
