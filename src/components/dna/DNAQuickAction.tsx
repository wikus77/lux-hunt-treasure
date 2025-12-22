// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// 🔧 FIX: Stile pill come PulseBreakerPill
import React from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { useDNA } from "@/hooks/useDNA";
import { ARCHETYPE_CONFIGS } from "@/features/dna/dnaTypes";
import { toast } from "sonner";
import { ArchetypeIcon } from "@/features/dna/ArchetypeIcon";
import '@/features/pulse/styles/pulse-pill.css';

/**
 * DNA Quick Action - positioned below "Invita un amico" button
 * Same UX pattern as PulseBreakerPill
 * Shows DNA archetype badge and navigates to /dna on click
 */
const DNAQuickAction: React.FC = () => {
  const [, setLocation] = useLocation();
  const { dnaProfile, isLoading } = useDNA();

  // Don't render if loading or no DNA profile
  if (isLoading || !dnaProfile) {
    return null;
  }

  const archetypeConfig = ARCHETYPE_CONFIGS[dnaProfile.archetype];
  const archetypeColor = archetypeConfig.color || '#00ff88';

  const handleClick = () => {
    setLocation('/dna');
    toast.info('DNA Hub aperto', {
      description: `${archetypeConfig.nameIt} — Codice Vivo`,
      icon: archetypeConfig.icon,
    });
  };

  return (
    <motion.button
      aria-label={`M1SSION DNA - ${archetypeConfig.nameIt}`}
      onClick={handleClick}
      className="pe-pill-orb fixed z-[70] bottom-24 right-4 md:bottom-28 md:right-8"
      initial={{ opacity: 0, scale: 0.9, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
    >
      {/* Archetype Icon */}
      <div className="relative z-10" style={{ filter: `drop-shadow(0 0 4px ${archetypeColor})` }}>
        <ArchetypeIcon 
          archetype={dnaProfile.archetype}
          size={22}
          animated={true}
        />
      </div>
      
      {/* Orbiting dot with archetype color */}
      <span className="pe-dot" style={{ background: `linear-gradient(135deg, ${archetypeColor}, #00d4ff)` }} />
      
      {/* Decorative arc overlay */}
      <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
        <circle
          cx="50%"
          cy="50%"
          r="45%"
          fill="none"
          stroke={`${archetypeColor}25`}
          strokeWidth="2"
        />
        <circle
          cx="50%"
          cy="50%"
          r="45%"
          fill="none"
          stroke="url(#dnaGradient)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="200 283"
        />
        <defs>
          <linearGradient id="dnaGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={archetypeColor} />
            <stop offset="50%" stopColor="#00d4ff" />
            <stop offset="100%" stopColor="#00ff88" />
          </linearGradient>
        </defs>
      </svg>
    </motion.button>
  );
};

export default DNAQuickAction;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
