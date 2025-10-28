// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
import React from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { useDNA } from "@/hooks/useDNA";
import { ARCHETYPE_CONFIGS } from "@/features/dna/dnaTypes";
import { toast } from "sonner";

/**
 * DNA Floating Button - positioned below "Invita un amico" button
 * Shows DNA archetype icon with pulsing glow effect
 * Navigates to /dna route on click
 */
const DNAFloatingButton: React.FC = () => {
  const [, setLocation] = useLocation();
  const { dnaProfile, isLoading } = useDNA();

  // Don't render if loading or no DNA profile
  if (isLoading || !dnaProfile) {
    return null;
  }

  const archetypeConfig = ARCHETYPE_CONFIGS[dnaProfile.archetype];

  const handleClick = () => {
    // Navigate to DNA route
    setLocation('/dna');
    
    // Show toast notification
    toast.info(`DNA: ${archetypeConfig.nameIt}`, {
      description: archetypeConfig.description,
      icon: archetypeConfig.icon,
    });
  };

  return (
    <motion.button
      aria-label={`M1SSION DNA - ${archetypeConfig.nameIt}`}
      onClick={handleClick}
      className="fixed z-[70] top-48 right-4 md:top-52 md:right-8 w-12 h-12 md:w-14 md:h-14 rounded-full backdrop-blur-md border shadow-lg hover:scale-105 transition-all flex items-center justify-center"
      style={{
        backgroundColor: `${archetypeConfig.color}15`,
        borderColor: `${archetypeConfig.color}40`,
        boxShadow: `0 8px 30px ${archetypeConfig.color}25, 0 0 20px ${archetypeConfig.color}15`,
      }}
      initial={{ opacity: 0, scale: 0.9, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Pulsing glow effect */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          backgroundColor: archetypeConfig.color,
          opacity: 0.2,
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.1, 0.2],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* DNA Helix Icon */}
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-5 h-5 md:w-6 md:h-6 relative z-10"
        style={{
          color: archetypeConfig.color,
          filter: `drop-shadow(0 0 8px ${archetypeConfig.color}60)`,
        }}
      >
        {/* DNA double helix path */}
        <path d="M2 12C2 7.5 4 4 7 2c3-2 6-2 9 0s5 5.5 5 10-2 8-5 10c-3 2-6 2-9 0s-5-5.5-5-10z" />
        <path d="M8 8c2 1 4 1 6 0M10 12h4M8 16c2-1 4-1 6 0" />
      </svg>
    </motion.button>
  );
};

export default DNAFloatingButton;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
