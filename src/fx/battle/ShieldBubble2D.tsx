/**
 * BATTLE FX — Shield Bubble 2D (Defense Effect)
 * Scudo energetico con effetto hexagon e glow pulsante
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface ShieldBubble2DProps {
  targetLatLng: [number, number];
  onEnd?: () => void;
}

export function ShieldBubble2D({ targetLatLng, onEnd }: ShieldBubble2DProps) {
  const [hexagons, setHexagons] = useState<number[]>([]);

  useEffect(() => {
    // Generate hexagon pattern
    setHexagons(Array.from({ length: 6 }, (_, i) => i));

    const timer = setTimeout(() => {
      onEnd?.();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onEnd]);

  return (
    <div 
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 2000 }}
    >
      {/* Main shield bubble */}
      <motion.div
        className="absolute left-1/2 top-1/2"
        style={{ transform: 'translate(-50%, -50%)' }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ 
          scale: [0, 1.3, 1],
          opacity: [0, 0.9, 0.7],
        }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        {/* Outer glow ring */}
        <motion.div
          className="absolute rounded-full"
          style={{
            width: 180,
            height: 180,
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            border: '3px solid #00d4ff',
            boxShadow: '0 0 30px #00d4ff, 0 0 60px #00d4ff40, inset 0 0 30px #00d4ff40',
          }}
          animate={{
            boxShadow: [
              '0 0 30px #00d4ff, 0 0 60px #00d4ff40, inset 0 0 30px #00d4ff40',
              '0 0 50px #00d4ff, 0 0 80px #00d4ff60, inset 0 0 50px #00d4ff60',
              '0 0 30px #00d4ff, 0 0 60px #00d4ff40, inset 0 0 30px #00d4ff40',
            ],
          }}
          transition={{ duration: 1, repeat: 2 }}
        />

        {/* Inner shield */}
        <motion.div
          className="rounded-full"
          style={{
            width: 160,
            height: 160,
            background: 'radial-gradient(circle, rgba(0,212,255,0.3) 0%, rgba(0,212,255,0.1) 50%, transparent 100%)',
            backdropFilter: 'blur(4px)',
          }}
          animate={{
            scale: [1, 1.05, 1],
          }}
          transition={{ duration: 0.8, repeat: 3 }}
        />

        {/* Hexagon pattern */}
        <div 
          className="absolute left-1/2 top-1/2"
          style={{ transform: 'translate(-50%, -50%)' }}
        >
          {hexagons.map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{
                width: 40,
                height: 46,
                left: '50%',
                top: '50%',
                transform: `translate(-50%, -50%) rotate(${i * 60}deg) translateY(-50px)`,
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: [0, 0.8, 0.6, 0.8, 0],
                scale: [0, 1, 1, 1, 0],
              }}
              transition={{ 
                duration: 2.5, 
                delay: i * 0.1,
                times: [0, 0.2, 0.5, 0.8, 1],
              }}
            >
              <svg viewBox="0 0 40 46" className="w-full h-full">
                <polygon
                  points="20,0 40,11.5 40,34.5 20,46 0,34.5 0,11.5"
                  fill="none"
                  stroke="#00d4ff"
                  strokeWidth="2"
                  style={{ filter: 'drop-shadow(0 0 5px #00d4ff)' }}
                />
              </svg>
            </motion.div>
          ))}
        </div>

        {/* Shield icon */}
        <motion.div
          className="absolute left-1/2 top-1/2"
          style={{ transform: 'translate(-50%, -50%)' }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ 
            opacity: [0, 1, 1, 0],
            scale: [0.5, 1, 1, 0.8],
          }}
          transition={{ duration: 2.5 }}
        >
          <div 
            className="text-5xl"
            style={{ 
              filter: 'drop-shadow(0 0 10px #00d4ff)',
            }}
          >
            🛡️
          </div>
        </motion.div>
      </motion.div>

      {/* "DEFENDING" text */}
      <motion.div
        className="absolute left-1/2 top-[60%]"
        style={{ transform: 'translateX(-50%)' }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ 
          opacity: [0, 1, 1, 0],
          y: [20, 0, 0, -10],
        }}
        transition={{ duration: 2.5, times: [0, 0.2, 0.8, 1] }}
      >
        <div 
          className="text-xl font-bold font-orbitron tracking-wider"
          style={{
            color: '#00d4ff',
            textShadow: '0 0 10px #00d4ff, 0 0 20px #00d4ff60',
          }}
        >
          DEFENDING
        </div>
      </motion.div>

      {/* Ripple effects */}
      {[0, 0.3, 0.6].map((delay, i) => (
        <motion.div
          key={i}
          className="absolute left-1/2 top-1/2 rounded-full"
          style={{ 
            transform: 'translate(-50%, -50%)',
            border: '2px solid #00d4ff40',
          }}
          initial={{ width: 160, height: 160, opacity: 0.6 }}
          animate={{ 
            width: [160, 300],
            height: [160, 300],
            opacity: [0.6, 0],
          }}
          transition={{ 
            duration: 1.5, 
            delay: delay + 0.5,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  );
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
