// 🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™
// M1SSION™ - Loading Screen Component
import React from 'react';
import AnimatedLogo from '@/components/logo/AnimatedLogo';

const LoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-[#0B1426] to-[#1a1a2e] text-white">
      <div className="text-center">
        <div className="mb-6">
          <AnimatedLogo />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold neon-text-cyan">M1SSION™</h2>
          <p className="text-gray-400 animate-pulse">Caricamento modulo...</p>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;