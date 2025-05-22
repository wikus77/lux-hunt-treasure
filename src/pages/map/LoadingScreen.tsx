
import React from "react";
import GradientBox from "@/components/ui/gradient-box";

const LoadingScreen = () => (
  <GradientBox className="min-h-[60vh] flex items-center justify-center p-6">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-projectx-neon-blue mb-4"></div>
      <p className="text-white/80">Caricamento mappa e localizzazione...</p>
      <p className="text-white/60 text-sm mt-1">Un attimo di pazienza</p>
    </div>
  </GradientBox>
);

export default LoadingScreen;
