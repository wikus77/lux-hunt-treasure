
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface BuzzRadarOverlayProps {
  isActive: boolean;
  hasFoundClue?: boolean;
  centerPosition: { lat: number; lng: number };
  radius?: number;
}

export const BuzzRadarOverlay: React.FC<BuzzRadarOverlayProps> = ({
  isActive,
  hasFoundClue = false,
  centerPosition,
  radius = 100
}) => {
  const [showGlow, setShowGlow] = useState(false);

  useEffect(() => {
    if (hasFoundClue) {
      setShowGlow(true);
    }
  }, [hasFoundClue]);

  if (!isActive) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      {/* Radar pulse effect */}
      <div 
        className="absolute"
        style={{
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          width: `${radius * 2}px`,
          height: `${radius * 2}px`,
        }}
      >
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-cyan-400/30"
          animate={{
            scale: [0.5, 4],
            opacity: [0.6, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeOut",
          }}
        />
        
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-cyan-400/20"
          animate={{
            scale: [0.5, 4],
            opacity: [0.4, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeOut",
            delay: 0.5,
          }}
        />
        
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-cyan-400/10"
          animate={{
            scale: [0.5, 4],
            opacity: [0.3, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeOut",
            delay: 1,
          }}
        />
      </div>

      {/* Success glow effect */}
      {showGlow && (
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-green-400"
          style={{
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: `${radius * 2}px`,
            height: `${radius * 2}px`,
            boxShadow: '0 0 20px rgba(0, 255, 0, 0.6)',
          }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        />
      )}

      {/* Center pulse */}
      <div 
        className="absolute w-4 h-4 bg-cyan-400 rounded-full"
        style={{
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      >
        <motion.div
          className="absolute inset-0 bg-cyan-400 rounded-full"
          animate={{
            scale: [1, 2],
            opacity: [1, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeOut",
          }}
        />
      </div>
    </div>
  );
};
