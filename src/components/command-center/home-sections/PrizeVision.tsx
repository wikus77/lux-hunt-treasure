
import React from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Zap } from 'lucide-react';

interface PrizeVisionProps {
  progress: number;
  status: "locked" | "partial" | "near" | "unlocked";
  daysRemaining: number;
}

export const PrizeVision: React.FC<PrizeVisionProps> = ({ progress, status, daysRemaining }) => {
  const getVisibilityLevel = () => {
    switch (status) {
      case "locked": return 0;
      case "partial": return 0.3;
      case "near": return 0.7;
      case "unlocked": return 1;
      default: return 0;
    }
  };

  const visibilityLevel = getVisibilityLevel();
  
  const getStatusMessage = () => {
    switch (status) {
      case "locked":
        return "PREMIO CLASSIFICATO - ACCESSO NEGATO";
      case "partial":
        return "SCANSIONE PARZIALE RILEVATA";
      case "near":
        return "IDENTIFICAZIONE IN CORSO...";
      case "unlocked":
        return "PREMIO IDENTIFICATO - PORSCHE 911 GT3 RS";
      default:
        return "SISTEMA OFFLINE";
    }
  };

  return (
    <motion.div 
      className="relative w-full h-64 bg-gradient-to-br from-black/90 to-gray-900/90 rounded-xl border border-cyan-400/30 overflow-hidden"
      style={{
        boxShadow: "0 0 20px rgba(0, 209, 255, 0.3), inset 0 0 20px rgba(0, 0, 0, 0.8)"
      }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.7 }}
    >
      {/* Scan lines overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-400/5 to-transparent animate-pulse" />
      
      {/* Prize image with progressive reveal */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div 
          className="relative w-48 h-32 bg-center bg-cover rounded-lg transition-all duration-1000"
          style={{
            backgroundImage: `url(https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&h=600&fit=crop)`,
            filter: `blur(${(1 - visibilityLevel) * 20}px) brightness(${0.3 + visibilityLevel * 0.7})`,
            opacity: 0.4 + visibilityLevel * 0.6
          }}
        >
          {/* Overlay grid for scan effect */}
          <div 
            className="absolute inset-0 bg-black/60 rounded-lg"
            style={{
              backgroundImage: `
                linear-gradient(90deg, transparent 49%, rgba(0, 209, 255, 0.1) 50%, transparent 51%),
                linear-gradient(0deg, transparent 49%, rgba(0, 209, 255, 0.1) 50%, transparent 51%)
              `,
              backgroundSize: '20px 20px',
              opacity: 1 - visibilityLevel
            }}
          />
        </div>
      </div>

      {/* Status overlay */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
        <div className="flex items-center space-x-2">
          {status === "locked" ? (
            <EyeOff className="w-5 h-5 text-red-400" />
          ) : (
            <Eye className="w-5 h-5 text-cyan-400" />
          )}
          <span className="text-xs font-orbitron text-cyan-400 uppercase tracking-wider">
            {getStatusMessage()}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <Zap className="w-4 h-4 text-yellow-400" />
          <span className="text-xs font-orbitron text-yellow-400">
            {progress}% COMPLETO
          </span>
        </div>
      </div>

      {/* Progress visualization */}
      <div className="absolute bottom-4 left-4 right-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-orbitron text-white/60">PROGRESSO MISSIONE</span>
          <span className="text-xs font-orbitron text-white/60">{daysRemaining} GIORNI RIMANENTI</span>
        </div>
        
        <div className="w-full h-2 bg-black/50 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-cyan-500 to-purple-500"
            style={{ width: `${progress}%` }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, delay: 0.5 }}
          />
        </div>
      </div>

      {/* Decorative corner elements */}
      <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-cyan-400/50" />
      <div className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-cyan-400/50" />
      <div className="absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-cyan-400/50" />
      <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-cyan-400/50" />
    </motion.div>
  );
};
