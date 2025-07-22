// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import React from 'react';

export const DailySpinHeader: React.FC = () => {
  return (
    <div className="text-center mb-12 px-4">
      {/* Main Title */}
      <h1 className="font-mission text-5xl md:text-6xl font-bold mb-4 tracking-wider">
        <span 
          className="text-cyan-400"
          style={{
            textShadow: '0 0 20px #00FFFF, 0 0 40px #00FFFF, 0 0 60px #00FFFF',
            filter: 'drop-shadow(0 0 10px rgba(0, 255, 255, 0.8))'
          }}
        >
          M1
        </span>
        <span className="text-white">SSION</span>
        <br />
        <span className="font-display text-3xl md:text-4xl font-normal text-white/90 tracking-normal">
          DAILY SPIN
        </span>
      </h1>
      
      {/* Subtitle */}
      <div className="relative">
        <p className="text-white/70 text-lg md:text-xl font-light tracking-wide">
          Una sola possibilità al giorno!
        </p>
        
        {/* Glow line */}
        <div className="mt-4 h-px bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent"></div>
      </div>
    </div>
  );
};