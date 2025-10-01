// © 2025 Joseph MULÉ – M1SSION™ - Final Shot Quick Access Card
import React from 'react';
import { Crosshair, ArrowRight } from 'lucide-react';
import { useLocation } from 'wouter';

const FinalShotQuickAccess: React.FC = () => {
  const [, setLocation] = useLocation();

  return (
    <div 
      onClick={() => setLocation('/intelligence/final-shot')}
      className="mt-6 p-6 rounded-2xl cursor-pointer group transition-all duration-300 hover:scale-[1.02]"
      style={{
        background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.05))',
        border: '1px solid rgba(239, 68, 68, 0.2)',
        boxShadow: '0 0 30px rgba(239, 68, 68, 0.1)'
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
            <Crosshair className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-1">Final Shot</h3>
            <p className="text-sm text-white/60">Esegui il colpo finale quando sei pronto</p>
          </div>
        </div>
        <ArrowRight className="w-6 h-6 text-red-400 group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  );
};

export default FinalShotQuickAccess;
