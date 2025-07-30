// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// SAFE MODE HERO3D - Static Fallback Version

import React from 'react';

const SafeModeHero3D = () => {
  console.log("🛡️ SafeModeHero3D - Static version active");
  
  return (
    <div className="relative h-screen w-full overflow-hidden bg-gradient-to-br from-gray-900 via-black to-gray-800">
      {/* Static background without Canvas */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-800" />
      
      {/* Static logo representation */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex items-center space-x-4">
          <div className="w-24 h-8 bg-gradient-to-r from-cyan-400 to-cyan-600 rounded opacity-80"></div>
          <div className="w-8 h-8 bg-gradient-to-r from-white to-gray-200 rounded-full opacity-80"></div>
        </div>
      </div>

      {/* Overlay content - STATIC */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
        <div className="text-center space-y-8 max-w-4xl px-6">
          <h1 className="text-6xl md:text-8xl font-light tracking-wider text-white drop-shadow-2xl">
            The Future
            <span className="block font-thin text-4xl md:text-6xl mt-4 text-cyan-400 drop-shadow-lg">
              Starts Here
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto leading-relaxed drop-shadow-lg">
            Discover next-generation experiences with M1SSION™
          </p>

          <button className="pointer-events-auto px-12 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-full text-lg font-medium transition-colors duration-300">
            <span>Start Mission</span>
          </button>
        </div>
      </div>

      {/* Static scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/50 rounded-full mt-2"></div>
        </div>
      </div>
    </div>
  );
};

export default SafeModeHero3D;