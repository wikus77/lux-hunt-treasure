/**
 * BATTLE FX — EMP Wave 2D (Victory Effect)
 * Onda elettromagnetica spettacolare quando la battaglia si risolve
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface EMPWave2DProps {
  centerLatLng: [number, number];
  onEnd?: () => void;
}

interface LightningBolt {
  id: number;
  angle: number;
  length: number;
  delay: number;
}

export function EMPWave2D({ centerLatLng, onEnd }: EMPWave2DProps) {
  const [lightnings, setLightnings] = useState<LightningBolt[]>([]);

  useEffect(() => {
    // Generate random lightning bolts
    const bolts: LightningBolt[] = [];
    for (let i = 0; i < 12; i++) {
      bolts.push({
        id: i,
        angle: (i / 12) * 360 + Math.random() * 15,
        length: 80 + Math.random() * 60,
        delay: Math.random() * 0.5,
      });
    }
    setLightnings(bolts);

    const timer = setTimeout(() => {
      onEnd?.();
    }, 2500);

    return () => clearTimeout(timer);
  }, [onEnd]);

  return (
    <div 
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 2000 }}
    >
      {/* Central flash */}
      <motion.div
        className="absolute left-1/2 top-1/2"
        style={{ transform: 'translate(-50%, -50%)' }}
        initial={{ scale: 0, opacity: 1 }}
        animate={{ scale: [0, 1.5, 0.8], opacity: [1, 0.9, 0] }}
        transition={{ duration: 0.8 }}
      >
        <div 
          className="rounded-full"
          style={{
            width: 100,
            height: 100,
            background: 'radial-gradient(circle, #00d4ff 0%, #8b5cf6 50%, transparent 100%)',
            boxShadow: '0 0 80px #00d4ff, 0 0 120px #8b5cf6',
          }}
        />
      </motion.div>

      {/* EMP Rings */}
      {[0, 0.15, 0.3].map((delay, i) => (
        <motion.div
          key={i}
          className="absolute left-1/2 top-1/2 rounded-full"
          style={{ transform: 'translate(-50%, -50%)' }}
          initial={{ width: 20, height: 20, opacity: 0.9 }}
          animate={{
            width: [20, 300 + i * 100],
            height: [20, 300 + i * 100],
            opacity: [0.9, 0],
          }}
          transition={{ duration: 1.5, delay, ease: 'easeOut' }}
        >
          <div 
            className="w-full h-full rounded-full"
            style={{
              border: `${3 - i}px solid`,
              borderColor: i === 0 ? '#00d4ff' : i === 1 ? '#8b5cf6' : '#00ff88',
              boxShadow: `0 0 20px ${i === 0 ? '#00d4ff' : i === 1 ? '#8b5cf6' : '#00ff88'}`,
            }}
          />
        </motion.div>
      ))}

      {/* Lightning bolts */}
      {lightnings.map(bolt => (
        <motion.div
          key={bolt.id}
          className="absolute left-1/2 top-1/2"
          style={{
            transform: `translate(-50%, -50%) rotate(${bolt.angle}deg)`,
            transformOrigin: 'center center',
          }}
          initial={{ opacity: 0, scaleY: 0 }}
          animate={{ 
            opacity: [0, 1, 1, 0],
            scaleY: [0, 1, 1, 0.5],
          }}
          transition={{ 
            duration: 0.6, 
            delay: bolt.delay,
            times: [0, 0.2, 0.7, 1],
          }}
        >
          <div
            style={{
              width: 3,
              height: bolt.length,
              background: `linear-gradient(to top, transparent, ${
                bolt.id % 3 === 0 ? '#00d4ff' : bolt.id % 3 === 1 ? '#8b5cf6' : '#00ff88'
              })`,
              boxShadow: `0 0 10px ${
                bolt.id % 3 === 0 ? '#00d4ff' : bolt.id % 3 === 1 ? '#8b5cf6' : '#00ff88'
              }`,
              marginTop: 30,
            }}
          />
        </motion.div>
      ))}

      {/* Electric particles */}
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={`particle-${i}`}
          className="absolute left-1/2 top-1/2 rounded-full"
          initial={{ 
            x: 0, 
            y: 0, 
            opacity: 1,
            scale: 1,
          }}
          animate={{ 
            x: (Math.random() - 0.5) * 400,
            y: (Math.random() - 0.5) * 400,
            opacity: 0,
            scale: 0,
          }}
          transition={{ 
            duration: 1.5, 
            delay: Math.random() * 0.3,
            ease: 'easeOut',
          }}
          style={{
            width: 6 + Math.random() * 6,
            height: 6 + Math.random() * 6,
            backgroundColor: ['#00d4ff', '#8b5cf6', '#00ff88'][Math.floor(Math.random() * 3)],
            boxShadow: '0 0 10px currentColor',
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}

      {/* Victory text flash */}
      <motion.div
        className="absolute left-1/2 top-1/2 text-center"
        style={{ transform: 'translate(-50%, -50%)' }}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: [0, 1, 1, 0], scale: [0.5, 1.2, 1, 0.8] }}
        transition={{ duration: 2, delay: 0.3 }}
      >
        <div 
          className="text-4xl font-bold font-orbitron"
          style={{
            color: '#00d4ff',
            textShadow: '0 0 20px #00d4ff, 0 0 40px #8b5cf6',
          }}
        >
          ⚡ VICTORY ⚡
        </div>
      </motion.div>
    </div>
  );
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
