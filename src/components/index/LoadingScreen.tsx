
import React from "react";

const LoadingScreen = () => {
  console.log("LoadingScreen rendered");
  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-[9999]">
      <div className="loading-spinner text-center">
        <div className="w-16 h-16 border-4 border-t-cyan-400 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
        <p className="text-white mt-4 text-xl">Caricamento...</p>
      </div>
    </div>
  );
};

export default LoadingScreen;
