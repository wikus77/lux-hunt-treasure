// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
import React from 'react';
import { motion } from 'framer-motion';
import { Archetype, ARCHETYPE_CONFIGS } from './dnaTypes';

interface ArchetypeIconProps {
  archetype: Archetype;
  size?: number;
  animated?: boolean;
}

/**
 * Cinematic DNA Archetype Icons
 * 
 * Animated SVG icons for each archetype with subtle motion:
 * - Seeker: Eye with radial pulse
 * - Breaker: Lightning with glitch effect
 * - Oracle: Prismatic icosahedron with rotation
 * - Warden: Shield with central rune glow
 * - Nomad: Orbiting sphere with trails
 */
export const ArchetypeIcon: React.FC<ArchetypeIconProps> = ({
  archetype,
  size = 24,
  animated = true
}) => {
  const shouldAnimate = animated && window.matchMedia('(prefers-reduced-motion: no-preference)').matches;
  const color = ARCHETYPE_CONFIGS[archetype].color;

  const iconVariants = {
    Seeker: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        {/* Eye with radial pulse */}
        <motion.path
          d="M12 5C7 5 2.73 8.11 1 12.5c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5C21.27 8.11 17 5 12 5z"
          stroke={color}
          strokeWidth="1.5"
          fill="none"
          animate={shouldAnimate ? {
            opacity: [1, 0.7, 1],
            scale: [1, 1.02, 1]
          } : {}}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.circle
          cx="12"
          cy="12.5"
          r="3.5"
          fill={color}
          opacity="0.8"
          animate={shouldAnimate ? {
            scale: [1, 1.1, 1],
            opacity: [0.8, 1, 0.8]
          } : {}}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <circle cx="12" cy="12.5" r="1.5" fill="#000" />
      </svg>
    ),
    Breaker: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        {/* Lightning with glitch effect */}
        <motion.path
          d="M13 2L3 14h8l-1 8 10-12h-8l1-8z"
          fill={color}
          opacity="0.9"
          animate={shouldAnimate ? {
            x: [0, -1, 1, 0],
            opacity: [0.9, 1, 0.9, 1, 0.9]
          } : {}}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            ease: "linear",
            times: [0, 0.2, 0.4, 0.6, 1]
          }}
        />
        <motion.path
          d="M13 2L3 14h8l-1 8 10-12h-8l1-8z"
          stroke={color}
          strokeWidth="1"
          fill="none"
          animate={shouldAnimate ? {
            opacity: [0, 0.5, 0],
            scale: [1, 1.05, 1]
          } : {}}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </svg>
    ),
    Oracle: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        {/* Prismatic icosahedron - STATIC (no rotation) */}
        <g>
          <path
            d="M12 2L6 7l6 5 6-5-6-5z"
            fill={color}
            opacity="0.7"
          />
          <path
            d="M12 12l-6 5 6 5 6-5-6-5z"
            fill={color}
            opacity="0.9"
          />
          <motion.path
            d="M6 7v10l6 5V12L6 7z"
            fill={color}
            opacity="0.5"
            animate={shouldAnimate ? {
              opacity: [0.5, 0.7, 0.5]
            } : {}}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <path
            d="M18 7v10l-6 5V12l6-5z"
            fill={color}
            opacity="0.6"
          />
        </g>
      </svg>
    ),
    Warden: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        {/* Shield with central rune */}
        <path
          d="M12 2L4 6v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V6l-8-4z"
          stroke={color}
          strokeWidth="1.5"
          fill="none"
        />
        <motion.circle
          cx="12"
          cy="12"
          r="4"
          stroke={color}
          strokeWidth="1.5"
          fill="none"
          animate={shouldAnimate ? {
            scale: [1, 1.1, 1],
            opacity: [0.6, 1, 0.6]
          } : {}}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.path
          d="M12 8v8M8 12h8"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          animate={shouldAnimate ? {
            opacity: [0.8, 1, 0.8]
          } : {}}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </svg>
    ),
    Nomad: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        {/* Orbiting sphere - STATIC (no rotation) */}
        <circle
          cx="12"
          cy="12"
          r="8"
          stroke={color}
          strokeWidth="1.5"
          fill="none"
          opacity="0.3"
        />
        <motion.circle
          cx="12"
          cy="12"
          r="5"
          stroke={color}
          strokeWidth="1"
          fill="none"
          opacity="0.5"
          animate={shouldAnimate ? {
            scale: [1, 1.05, 1]
          } : {}}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <g>
          <circle cx="20" cy="12" r="2" fill={color} opacity="0.8" />
          <motion.circle
            cx="18"
            cy="12"
            r="1.5"
            fill={color}
            opacity="0.4"
            animate={shouldAnimate ? {
              opacity: [0.4, 0, 0.4]
            } : {}}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </g>
      </svg>
    )
  };

  return (
    <div className="inline-flex items-center justify-center" style={{ filter: `drop-shadow(0 0 8px ${color}40)` }}>
      {iconVariants[archetype]}
    </div>
  );
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
