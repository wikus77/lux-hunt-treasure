
import React from "react";

const LoadingScreen = () => (
  <div className="min-h-[60vh] flex items-center justify-center bg-black/20 rounded-lg">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-projectx-neon-blue mb-4"></div>
      <p className="text-white/80">Caricamento mappa e localizzazione...</p>
      <p className="text-white/60 text-sm mt-1">Un attimo di pazienza</p>
    </div>
  </div>
);

export default LoadingScreen;
