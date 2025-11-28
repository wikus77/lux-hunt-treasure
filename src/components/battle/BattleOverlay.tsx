/**
 * Battle Overlay - SOLO COUNTDOWN poi si chiude
 * Il missile viene mostrato sulla mappa, non qui
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Swords, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

// 🔊 Beep sound generator using Web Audio API
const playBeep = (frequency: number = 800, duration: number = 100, volume: number = 0.3) => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration / 1000);
  } catch (e) {
    console.log('Audio not supported');
  }
};

export interface BattleOverlayProps {
  isActive: boolean;
  attackerName: string;
  defenderName: string;
  defenderIsFake: boolean;
  weaponUsed?: string;
  defenseUsed?: string;
  stakePercent: number;
  stakeType: string;
  onCountdownComplete: () => void; // Called when countdown ends - close modal & start map battle
  onCancel?: () => void;
}

export function BattleOverlay({
  isActive,
  attackerName,
  defenderName,
  defenderIsFake,
  weaponUsed,
  stakePercent,
  stakeType,
  onCountdownComplete,
  onCancel,
}: BattleOverlayProps) {
  const [countdown, setCountdown] = useState(10);

  // Reset countdown when activated
  useEffect(() => {
    if (isActive) {
      setCountdown(10);
    }
  }, [isActive]);

  // Countdown logic with BEEP sound
  useEffect(() => {
    if (!isActive) return;

    if (countdown > 0) {
      // 🔊 Play beep - higher pitch for last 3 seconds
      if (countdown <= 3) {
        playBeep(1200, 150, 0.4); // High pitch urgent beep
      } else {
        playBeep(800, 100, 0.3); // Normal beep
      }
      
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      // 🔊 Final launch sound - ascending tone
      playBeep(600, 50, 0.3);
      setTimeout(() => playBeep(900, 50, 0.3), 50);
      setTimeout(() => playBeep(1200, 100, 0.4), 100);
      
      // Countdown finished! Close modal and start battle on map
      onCountdownComplete();
    }
  }, [isActive, countdown, onCountdownComplete]);

  if (!isActive) return null;

  return (
    <motion.div
      className="fixed inset-0 z-[3000] bg-black/95 backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Header */}
      <div className="absolute top-8 left-0 right-0 p-4 z-[3002]">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div className="text-center flex-1">
            <div className="text-xs text-cyan-400 uppercase tracking-wider mb-1">Attacker</div>
            <div className="text-xl font-bold text-white">{attackerName}</div>
            {weaponUsed && (
              <div className="text-xs text-orange-400 flex items-center justify-center gap-1 mt-1">
                <Swords className="h-3 w-3" /> {weaponUsed}
              </div>
            )}
          </div>
          
          <div className="px-6">
            <motion.div 
              className="text-4xl"
              animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              ⚔️
            </motion.div>
          </div>
          
          <div className="text-center flex-1">
            <div className="text-xs text-red-400 uppercase tracking-wider mb-1">Target</div>
            <div className="text-xl font-bold text-white">{defenderName}</div>
            {defenderIsFake && (
              <div className="text-xs text-gray-400 mt-1">🤖 Test Agent</div>
            )}
          </div>
        </div>
      </div>

      {/* Center - Countdown */}
      <div className="absolute inset-0 flex items-center justify-center z-[3002]">
        <motion.div
          className="text-center"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <div className="text-sm text-cyan-400 uppercase tracking-widest mb-6">
            🚀 Attack launching in...
          </div>
          
          <motion.div
            className="relative"
            key={countdown}
            initial={{ scale: 2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 10, stiffness: 100 }}
          >
            {/* Glow rings */}
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                width: 200,
                height: 200,
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                border: '2px solid rgba(0,212,255,0.3)',
                boxShadow: '0 0 60px rgba(0,212,255,0.4), inset 0 0 60px rgba(0,212,255,0.2)',
              }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{ duration: 1, repeat: Infinity }}
            />
            
            {/* Number */}
            <div
              className="text-[120px] font-bold text-white leading-none"
              style={{
                textShadow: '0 0 40px rgba(0,212,255,0.9), 0 0 80px rgba(255,77,240,0.6), 0 0 120px rgba(0,212,255,0.4)',
                fontFamily: 'Orbitron, monospace',
              }}
            >
              {countdown}
            </div>
          </motion.div>

          <motion.div 
            className="text-lg text-white/60 mt-8"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            Prepare for combat...
          </motion.div>
          
          {/* Cancel button - only in first 5 seconds */}
          {onCancel && countdown > 5 && (
            <Button
              variant="ghost"
              onClick={onCancel}
              className="mt-8 text-red-400 hover:text-red-300 hover:bg-red-500/10"
            >
              ✕ Cancel Attack
            </Button>
          )}
        </motion.div>
      </div>

      {/* Stake Info */}
      <div className="absolute bottom-8 left-0 right-0 text-center z-[3002]">
        <div className="inline-block px-6 py-3 rounded-full bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30">
          <span className="text-sm text-gray-400">Stake: </span>
          <span className="text-lg font-bold text-cyan-400">{stakePercent}% {stakeType}</span>
        </div>
      </div>

      {/* Animated particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
