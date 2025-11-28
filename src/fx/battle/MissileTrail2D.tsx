/**
 * BATTLE FX — Missile Trail 2D (Spectacular Version)
 * Vero missile con scia luminosa, particelle e esplosione finale
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import { motion } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';

interface MissileTrail2DProps {
  fromLatLng: [number, number];
  toLatLng: [number, number];
  onEnd?: () => void;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  size: number;
  color: string;
}

export function MissileTrail2D({ fromLatLng, toLatLng, onEnd }: MissileTrail2DProps) {
  const [phase, setPhase] = useState<'flying' | 'impact' | 'done'>('flying');
  const [missilePos, setMissilePos] = useState({ x: 20, y: 80 });
  const [particles, setParticles] = useState<Particle[]>([]);
  const [impactParticles, setImpactParticles] = useState<Particle[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  // Calculate target position (percentage based)
  const targetX = 80;
  const targetY = 20;
  const startX = 20;
  const startY = 80;

  // Missile flight animation
  useEffect(() => {
    const duration = 1200; // 1.2 seconds flight time
    const startTime = Date.now();
    let particleId = 0;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth acceleration/deceleration
      const eased = progress < 0.5 
        ? 2 * progress * progress 
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;

      const currentX = startX + (targetX - startX) * eased;
      const currentY = startY + (targetY - startY) * eased;
      
      setMissilePos({ x: currentX, y: currentY });

      // Generate trail particles
      if (progress < 1) {
        const newParticles: Particle[] = [];
        for (let i = 0; i < 3; i++) {
          newParticles.push({
            id: particleId++,
            x: currentX + (Math.random() - 0.5) * 2,
            y: currentY + (Math.random() - 0.5) * 2,
            vx: (Math.random() - 0.5) * 0.5,
            vy: Math.random() * 0.3 + 0.1,
            life: 1,
            size: Math.random() * 4 + 2,
            color: Math.random() > 0.5 ? '#ff4444' : '#ffaa00',
          });
        }
        setParticles(prev => [...prev.slice(-50), ...newParticles]);
      }

      // Update existing particles
      setParticles(prev => 
        prev
          .map(p => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            life: p.life - 0.03,
            size: p.size * 0.95,
          }))
          .filter(p => p.life > 0)
      );

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        // Impact!
        setPhase('impact');
        triggerExplosion();
      }
    };

    animate();

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Explosion effect
  const triggerExplosion = () => {
    const explosionParticles: Particle[] = [];
    let id = 0;
    
    // Create explosion particles
    for (let i = 0; i < 30; i++) {
      const angle = (i / 30) * Math.PI * 2;
      const speed = Math.random() * 3 + 1;
      explosionParticles.push({
        id: id++,
        x: targetX,
        y: targetY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        size: Math.random() * 8 + 4,
        color: ['#ff0000', '#ff4400', '#ff8800', '#ffcc00'][Math.floor(Math.random() * 4)],
      });
    }
    
    setImpactParticles(explosionParticles);

    // Animate explosion particles
    let frame = 0;
    const animateExplosion = () => {
      frame++;
      setImpactParticles(prev => 
        prev
          .map(p => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            vx: p.vx * 0.95,
            vy: p.vy * 0.95,
            life: p.life - 0.04,
            size: p.size * 0.97,
          }))
          .filter(p => p.life > 0)
      );

      if (frame < 40) {
        requestAnimationFrame(animateExplosion);
      } else {
        setPhase('done');
        onEnd?.();
      }
    };

    setTimeout(() => requestAnimationFrame(animateExplosion), 50);
  };

  if (phase === 'done') return null;

  return (
    <div 
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 2000 }}
    >
      {/* Trail particles */}
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            opacity: p.life,
            boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}

      {/* Missile */}
      {phase === 'flying' && (
        <motion.div
          className="absolute"
          style={{
            left: `${missilePos.x}%`,
            top: `${missilePos.y}%`,
            transform: 'translate(-50%, -50%) rotate(-45deg)',
          }}
        >
          {/* Missile body */}
          <div 
            className="relative"
            style={{
              width: 24,
              height: 8,
              background: 'linear-gradient(90deg, #333 0%, #666 50%, #ff4444 100%)',
              borderRadius: '0 4px 4px 0',
              boxShadow: '0 0 20px #ff4444, 0 0 40px #ff0000',
            }}
          >
            {/* Missile tip */}
            <div 
              style={{
                position: 'absolute',
                right: -6,
                top: '50%',
                transform: 'translateY(-50%)',
                width: 0,
                height: 0,
                borderLeft: '8px solid #ff4444',
                borderTop: '5px solid transparent',
                borderBottom: '5px solid transparent',
              }}
            />
            {/* Engine flame */}
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 0.1, repeat: Infinity }}
              style={{
                position: 'absolute',
                left: -12,
                top: '50%',
                transform: 'translateY(-50%)',
                width: 16,
                height: 6,
                background: 'linear-gradient(90deg, transparent, #ffaa00, #ff4400)',
                borderRadius: '4px 0 0 4px',
                filter: 'blur(2px)',
              }}
            />
          </div>
        </motion.div>
      )}

      {/* Impact explosion */}
      {phase === 'impact' && (
        <>
          {/* Flash */}
          <motion.div
            className="absolute"
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 3, opacity: 0 }}
            transition={{ duration: 0.4 }}
            style={{
              left: `${targetX}%`,
              top: `${targetY}%`,
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: 'radial-gradient(circle, #fff 0%, #ff4400 50%, transparent 100%)',
              transform: 'translate(-50%, -50%)',
              boxShadow: '0 0 60px #ff4400, 0 0 100px #ff0000',
            }}
          />
          
          {/* Explosion particles */}
          {impactParticles.map(p => (
            <div
              key={p.id}
              className="absolute rounded-full"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: p.size,
                height: p.size,
                backgroundColor: p.color,
                opacity: p.life,
                boxShadow: `0 0 ${p.size}px ${p.color}`,
                transform: 'translate(-50%, -50%)',
              }}
            />
          ))}

          {/* Shockwave ring */}
          <motion.div
            className="absolute"
            initial={{ scale: 0, opacity: 0.8 }}
            animate={{ scale: 4, opacity: 0 }}
            transition={{ duration: 0.6 }}
            style={{
              left: `${targetX}%`,
              top: `${targetY}%`,
              width: 30,
              height: 30,
              borderRadius: '50%',
              border: '3px solid #ff4400',
              transform: 'translate(-50%, -50%)',
            }}
          />
        </>
      )}
    </div>
  );
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
