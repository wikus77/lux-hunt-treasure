/**
 * PULSE BREAKER™ — Quick Access Pill (Same style as AgentEnergyPill)
 * Pill circolare stile M1SSION con anelli rotanti
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import { motion } from 'framer-motion';
import { useState } from 'react';
import { Gamepad2 } from 'lucide-react';
import { PulseBreaker } from './PulseBreaker';
import '@/features/pulse/styles/pulse-pill.css';

export const PulseBreakerPill = () => {
  const [isGameOpen, setIsGameOpen] = useState(false);

  return (
    <div className="relative">
      {/* Main Orb - Same style as AgentEnergyPill */}
      <motion.button
        className="pe-pill-orb"
        aria-label="Pulse Breaker Game"
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => setIsGameOpen(true)}
      >
        {/* Gamepad icon inside */}
        <Gamepad2 className="w-5 h-5 z-10 relative text-cyan-400" style={{ filter: 'drop-shadow(0 0 4px #00d4ff)' }} />
        
        {/* Orbiting dot */}
        <span className="pe-dot" />
        
        {/* Decorative arc overlay */}
        <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
          <circle
            cx="50%"
            cy="50%"
            r="45%"
            fill="none"
            stroke="rgba(0, 255, 200, 0.15)"
            strokeWidth="2"
          />
          <circle
            cx="50%"
            cy="50%"
            r="45%"
            fill="none"
            stroke="url(#pbGradient)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="200 283"
          />
          <defs>
            <linearGradient id="pbGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00d4ff" />
              <stop offset="50%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#00ff88" />
            </linearGradient>
          </defs>
        </svg>
      </motion.button>

      {/* Game Modal */}
      <PulseBreaker 
        isOpen={isGameOpen} 
        onClose={() => setIsGameOpen(false)} 
      />
    </div>
  );
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™


