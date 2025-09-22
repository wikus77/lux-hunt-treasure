// © 2025 Joseph MULÉ – M1SSION™
import React from 'react';
import { cn } from '@/lib/utils';

interface M1ssionLoaderProps {
  className?: string;
  text?: string;
}

export const M1ssionLoader: React.FC<M1ssionLoaderProps> = ({ 
  className,
  text = "Caricamento M1SSION™"
}) => {
  return (
    <div className={cn(
      "fixed inset-0 bg-black flex flex-col items-center justify-center z-[9999]",
      className
    )}>
      {/* Logo M1SSION con animazione */}
      <div className="relative mb-8">
        <div className="text-4xl md:text-6xl font-bold text-white font-orbitron tracking-wider">
          M1SSION
        </div>
        <div className="text-xs md:text-sm text-cyan-400 font-light tracking-[0.2em] text-center mt-1">
          INTELLIGENCE NETWORK
        </div>
      </div>

      {/* Animazione circolare elegante */}
      <div className="relative w-16 h-16 mb-6">
        {/* Cerchio di base */}
        <div className="absolute inset-0 rounded-full border-2 border-white/10"></div>
        
        {/* Semicerchio animato */}
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-cyan-400 border-r-cyan-400 animate-spin"></div>
        
        {/* Punto centrale */}
        <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-cyan-400 rounded-full transform -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
      </div>

      {/* Testo di caricamento */}
      <div className="text-white/80 text-lg font-medium">
        {text}
      </div>

      {/* Sottotesto */}
      <div className="text-cyan-400/60 text-sm mt-2 tracking-wide">
        Sistema di intelligence in inizializzazione...
      </div>

      {/* Animazione di sfondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-cyan-900/5 via-transparent to-blue-900/5"></div>
        <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-cyan-400/30 rounded-full animate-ping"></div>
        <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-cyan-400/30 rounded-full animate-ping delay-1000"></div>
        <div className="absolute bottom-1/4 left-3/4 w-1 h-1 bg-cyan-400/30 rounded-full animate-ping delay-2000"></div>
      </div>
    </div>
  );
};

export default M1ssionLoader;