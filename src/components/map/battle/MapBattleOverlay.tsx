/**
 * Map Battle Overlay - Shows FUTURISTIC missile animation on the actual map
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Map as MapLibreMap } from 'maplibre-gl';

interface MapBattleOverlayProps {
  map: MapLibreMap | null;
  battle: {
    attackerLat: number;
    attackerLng: number;
    defenderLat: number;
    defenderLng: number;
    defenderName: string;
    duration: number;
    startTime: number;
  } | null;
  timeLeft: number;
  result: { won: boolean } | null;
}

export function MapBattleOverlay({ map, battle, timeLeft, result }: MapBattleOverlayProps) {
  const [attackerScreen, setAttackerScreen] = useState<{ x: number; y: number } | null>(null);
  const [defenderScreen, setDefenderScreen] = useState<{ x: number; y: number } | null>(null);
  const [missilePos, setMissilePos] = useState<{ x: number; y: number } | null>(null);
  const [showExplosion, setShowExplosion] = useState(false);
  const [trailParticles, setTrailParticles] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const animationRef = useRef<number | null>(null);
  const particleIdRef = useRef(0);

  const updateScreenPositions = () => {
    if (!map || !battle) return;
    try {
      const attackerPoint = map.project([battle.attackerLng, battle.attackerLat]);
      const defenderPoint = map.project([battle.defenderLng, battle.defenderLat]);
      setAttackerScreen({ x: attackerPoint.x, y: attackerPoint.y });
      setDefenderScreen({ x: defenderPoint.x, y: defenderPoint.y });
    } catch (e) {}
  };

  useEffect(() => {
    if (!map || !battle) return;
    updateScreenPositions();
    map.on('move', updateScreenPositions);
    map.on('zoom', updateScreenPositions);
    return () => {
      map.off('move', updateScreenPositions);
      map.off('zoom', updateScreenPositions);
    };
  }, [map, battle]);

  useEffect(() => {
    if (!battle || !attackerScreen || !defenderScreen) return;
    const totalDuration = battle.duration * 1000;
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / totalDuration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3); // Cubic ease out
      
      const x = attackerScreen.x + (defenderScreen.x - attackerScreen.x) * easeProgress;
      const y = attackerScreen.y + (defenderScreen.y - attackerScreen.y) * easeProgress;
      const arcHeight = Math.min(200, Math.abs(defenderScreen.x - attackerScreen.x) * 0.4);
      const arcY = y - Math.sin(progress * Math.PI) * arcHeight;
      
      setMissilePos({ x, y: arcY });
      
      // Add trail particles
      if (progress < 1 && elapsed % 50 < 20) {
        particleIdRef.current++;
        setTrailParticles(prev => [...prev.slice(-30), { 
          id: particleIdRef.current, 
          x: x + (Math.random() - 0.5) * 10, 
          y: arcY + (Math.random() - 0.5) * 10 
        }]);
      }
      
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setShowExplosion(true);
        setTrailParticles([]);
        setTimeout(() => setShowExplosion(false), 2500);
      }
    };
    
    animate();
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [battle, attackerScreen, defenderScreen]);

  if (!battle || !attackerScreen || !defenderScreen) return null;

  const angle = missilePos 
    ? Math.atan2(defenderScreen.y - attackerScreen.y, defenderScreen.x - attackerScreen.x) * (180 / Math.PI)
    : 0;

  return (
    <div className="fixed inset-0 pointer-events-none z-[2000]">
      {/* Battle HUD */}
      <div className="absolute top-24 left-1/2 -translate-x-1/2 z-[2001]">
        <motion.div 
          className="px-8 py-4 rounded-2xl bg-gradient-to-r from-black/90 via-red-950/80 to-black/90 backdrop-blur-md border border-red-500/50"
          initial={{ y: -50, opacity: 0, scale: 0.8 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          style={{
            boxShadow: '0 0 40px rgba(255,50,50,0.4), inset 0 0 30px rgba(255,0,0,0.1)',
          }}
        >
          <div className="text-center">
            <div className="text-xs text-red-400 uppercase tracking-[0.3em] mb-2 flex items-center justify-center gap-2">
              <motion.span 
                animate={{ opacity: [1, 0.3, 1] }} 
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                ●
              </motion.span>
              BATTLE IN PROGRESS
              <motion.span 
                animate={{ opacity: [1, 0.3, 1] }} 
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                ●
              </motion.span>
            </div>
            <div 
              className="text-4xl font-bold text-white font-mono"
              style={{ textShadow: '0 0 20px rgba(255,100,100,0.8)' }}
            >
              {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
            </div>
            <div className="text-sm text-gray-400 mt-2">
              Target: <span className="text-cyan-400 font-semibold">{battle.defenderName}</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Energy beam trail */}
      {missilePos && (
        <svg className="absolute inset-0 w-full h-full" style={{ filter: 'url(#glow)' }}>
          <defs>
            <linearGradient id="beamGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00ffff" stopOpacity="0" />
              <stop offset="30%" stopColor="#00ffff" stopOpacity="0.3" />
              <stop offset="70%" stopColor="#ff00ff" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#ff4444" stopOpacity="0.8" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="4" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          
          {/* Main energy beam */}
          <motion.line
            x1={attackerScreen.x}
            y1={attackerScreen.y}
            x2={missilePos.x}
            y2={missilePos.y}
            stroke="url(#beamGradient)"
            strokeWidth="6"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
          />
          
          {/* Secondary beam */}
          <motion.line
            x1={attackerScreen.x}
            y1={attackerScreen.y}
            x2={missilePos.x}
            y2={missilePos.y}
            stroke="#00ffff"
            strokeWidth="2"
            strokeDasharray="15 10"
            opacity="0.6"
          />
        </svg>
      )}

      {/* Trail particles */}
      {trailParticles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute w-2 h-2 rounded-full"
          style={{
            left: p.x,
            top: p.y,
            background: 'radial-gradient(circle, #00ffff 0%, #ff00ff 50%, transparent 100%)',
            boxShadow: '0 0 10px #00ffff',
          }}
          initial={{ scale: 1, opacity: 0.8 }}
          animate={{ scale: 0, opacity: 0 }}
          transition={{ duration: 0.8 }}
        />
      ))}

      {/* FUTURISTIC MISSILE */}
      {missilePos && !showExplosion && (
        <motion.div
          className="absolute"
          style={{
            left: missilePos.x,
            top: missilePos.y,
            transform: `translate(-50%, -50%) rotate(${angle}deg)`,
          }}
        >
          {/* Outer glow ring */}
          <motion.div
            className="absolute -inset-6 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(0,255,255,0.3) 0%, rgba(255,0,255,0.2) 50%, transparent 70%)',
            }}
            animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 0.3, repeat: Infinity }}
          />
          
          {/* Missile body - Futuristic design */}
          <div className="relative" style={{ width: '50px', height: '20px' }}>
            {/* Core body */}
            <div 
              style={{
                width: '50px',
                height: '20px',
                background: 'linear-gradient(180deg, #4a5568 0%, #1a202c 50%, #2d3748 100%)',
                borderRadius: '10px 4px 4px 10px',
                border: '1px solid rgba(0,255,255,0.5)',
                boxShadow: '0 0 20px rgba(0,255,255,0.6), 0 0 40px rgba(255,0,255,0.4), inset 0 2px 4px rgba(255,255,255,0.2)',
              }}
            >
              {/* Tech lines */}
              <div className="absolute top-1/2 left-2 right-4 h-px bg-gradient-to-r from-cyan-400 to-purple-400 opacity-60" style={{ transform: 'translateY(-50%)' }} />
              <motion.div 
                className="absolute top-1 left-3 w-2 h-2 rounded-full bg-cyan-400"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 0.2, repeat: Infinity }}
                style={{ boxShadow: '0 0 8px #00ffff' }}
              />
            </div>
            
            {/* Nose cone - Glowing tip */}
            <div 
              className="absolute -right-3 top-1/2"
              style={{
                transform: 'translateY(-50%)',
                width: 0,
                height: 0,
                borderLeft: '16px solid #00ffff',
                borderTop: '10px solid transparent',
                borderBottom: '10px solid transparent',
                filter: 'drop-shadow(0 0 8px #00ffff)',
              }}
            />
            
            {/* Engine exhaust - Multiple layers */}
            <motion.div
              className="absolute -left-8 top-1/2"
              style={{ transform: 'translateY(-50%)' }}
              animate={{ scaleX: [1, 1.5, 1], opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 0.08, repeat: Infinity }}
            >
              {/* Outer flame */}
              <div style={{
                width: '35px',
                height: '18px',
                background: 'radial-gradient(ellipse at right, #ff00ff 0%, #ff4444 30%, #ff8800 60%, transparent 100%)',
                borderRadius: '50%',
                filter: 'blur(3px)',
              }} />
            </motion.div>
            
            {/* Inner hot core */}
            <motion.div
              className="absolute -left-4 top-1/2"
              style={{ transform: 'translateY(-50%)' }}
              animate={{ scaleX: [1, 1.3, 1] }}
              transition={{ duration: 0.05, repeat: Infinity }}
            >
              <div style={{
                width: '20px',
                height: '10px',
                background: 'radial-gradient(ellipse at right, #fff 0%, #00ffff 50%, transparent 100%)',
                borderRadius: '50%',
                filter: 'blur(2px)',
              }} />
            </motion.div>
            
            {/* Sparks */}
            {Array.from({ length: 8 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full"
                style={{ 
                  left: -12 - i * 3, 
                  top: 6 + (Math.random() - 0.5) * 12,
                  width: 3 - i * 0.3,
                  height: 3 - i * 0.3,
                  backgroundColor: ['#00ffff', '#ff00ff', '#fff', '#ff4444'][i % 4],
                }}
                animate={{
                  x: [-5, -25],
                  opacity: [1, 0],
                  scale: [1, 0.3],
                }}
                transition={{
                  duration: 0.2,
                  repeat: Infinity,
                  delay: i * 0.02,
                }}
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* EPIC EXPLOSION */}
      <AnimatePresence>
        {showExplosion && defenderScreen && (
          <>
            {/* Shockwave rings */}
            {[0, 1, 2].map((ring) => (
              <motion.div
                key={`ring-${ring}`}
                className="absolute rounded-full border-2"
                style={{ 
                  left: defenderScreen.x, 
                  top: defenderScreen.y, 
                  transform: 'translate(-50%, -50%)',
                  borderColor: ['#00ffff', '#ff00ff', '#ff4444'][ring],
                }}
                initial={{ width: 0, height: 0, opacity: 1 }}
                animate={{ width: 300 + ring * 50, height: 300 + ring * 50, opacity: 0 }}
                transition={{ duration: 1.5, delay: ring * 0.1 }}
              />
            ))}
            
            {/* Central flash */}
            <motion.div
              className="absolute"
              style={{ left: defenderScreen.x, top: defenderScreen.y, transform: 'translate(-50%, -50%)' }}
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 4, opacity: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div 
                className="w-40 h-40 rounded-full"
                style={{
                  background: 'radial-gradient(circle, #fff 0%, #00ffff 20%, #ff00ff 40%, #ff4444 60%, transparent 80%)',
                  boxShadow: '0 0 80px #00ffff, 0 0 120px #ff00ff',
                }}
              />
            </motion.div>
            
            {/* Explosion particles */}
            {Array.from({ length: 30 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full"
                style={{
                  left: defenderScreen.x,
                  top: defenderScreen.y,
                  width: 4 + Math.random() * 8,
                  height: 4 + Math.random() * 8,
                  backgroundColor: ['#00ffff', '#ff00ff', '#fff', '#ff4444', '#ffff00'][i % 5],
                  boxShadow: `0 0 10px ${['#00ffff', '#ff00ff', '#fff'][i % 3]}`,
                }}
                initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
                animate={{
                  x: (Math.random() - 0.5) * 300,
                  y: (Math.random() - 0.5) * 300,
                  scale: 0,
                  opacity: 0,
                }}
                transition={{ duration: 1.5, delay: i * 0.02, ease: 'easeOut' }}
              />
            ))}
            
            {/* Secondary explosions */}
            {[1, 2, 3].map((n) => (
              <motion.div
                key={`sec-${n}`}
                className="absolute rounded-full"
                style={{ 
                  left: defenderScreen.x + (Math.random() - 0.5) * 80, 
                  top: defenderScreen.y + (Math.random() - 0.5) * 80, 
                  transform: 'translate(-50%, -50%)' 
                }}
                initial={{ scale: 0, opacity: 1 }}
                animate={{ scale: 2, opacity: 0 }}
                transition={{ duration: 0.6, delay: 0.2 + n * 0.15 }}
              >
                <div 
                  className="w-16 h-16 rounded-full"
                  style={{
                    background: 'radial-gradient(circle, #fff 0%, #ff8800 50%, transparent 100%)',
                  }}
                />
              </motion.div>
            ))}
          </>
        )}
      </AnimatePresence>

      {/* Result */}
      <AnimatePresence>
        {result && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="text-center"
              initial={{ scale: 0.3, y: 50, rotateX: 90 }}
              animate={{ scale: 1, y: 0, rotateX: 0 }}
              transition={{ type: 'spring', damping: 12 }}
            >
              <motion.div 
                className="text-9xl mb-6"
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: result.won ? [0, 5, -5, 0] : [0, -3, 3, 0],
                }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                {result.won ? '🏆' : '💀'}
              </motion.div>
              <motion.div 
                className={`text-6xl font-bold ${result.won ? 'text-green-400' : 'text-red-400'}`}
                style={{ 
                  textShadow: `0 0 40px ${result.won ? 'rgba(74,222,128,0.8)' : 'rgba(248,113,113,0.8)'}`,
                  fontFamily: 'Orbitron, sans-serif',
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {result.won ? 'VICTORY!' : 'DEFEATED!'}
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Target reticle */}
      {defenderScreen && !showExplosion && !result && (
        <motion.div
          className="absolute"
          style={{ left: defenderScreen.x, top: defenderScreen.y, transform: 'translate(-50%, -50%)' }}
        >
          <motion.svg 
            width="80" 
            height="80" 
            viewBox="0 0 80 80"
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          >
            <circle cx="40" cy="40" r="35" fill="none" stroke="#ff4444" strokeWidth="2" strokeDasharray="8 4" opacity="0.8" />
            <circle cx="40" cy="40" r="25" fill="none" stroke="#00ffff" strokeWidth="1" opacity="0.6" />
            <circle cx="40" cy="40" r="15" fill="none" stroke="#ff00ff" strokeWidth="1" opacity="0.4" />
          </motion.svg>
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <div className="w-2 h-2 rounded-full bg-red-500" style={{ boxShadow: '0 0 10px #ff0000' }} />
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
