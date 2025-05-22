
import React from 'react';

const LoadingScreen = () => {
  return (
    <div className="flex items-center justify-center h-full min-h-[400px]">
      <div className="relative">
        <div className="w-12 h-12 border-t-2 border-b-2 border-[#00D1FF] rounded-full animate-spin"></div>
        <div className="w-12 h-12 border-r-2 border-l-2 border-[#F059FF] rounded-full animate-spin absolute top-0 left-0" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
      </div>
      <p className="ml-4 text-[#00D1FF] text-lg">Caricamento mappa...</p>
    </div>
  );
};

export default LoadingScreen;
