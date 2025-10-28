// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
import React from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'wouter';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ARCHETYPE_CONFIGS } from '@/features/dna/dnaTypes';
import type { Archetype } from '@/features/dna/dnaTypes';

interface DNABadgeProps {
  archetype: Archetype;
  className?: string;
}

export const DNABadge: React.FC<DNABadgeProps> = ({ archetype, className = '' }) => {
  const [, setLocation] = useLocation();
  const config = ARCHETYPE_CONFIGS[archetype];

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.button
            onClick={() => setLocation('/dna')}
            className={`relative flex items-center justify-center w-8 h-8 rounded-full bg-black/40 border-2 backdrop-blur-sm cursor-pointer ${className}`}
            style={{ borderColor: config.color }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
          >
            <span className="text-base">{config.icon}</span>
            
            {/* Pulsing glow */}
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{ 
                boxShadow: `0 0 15px ${config.color}40`,
                opacity: 0.5
              }}
              animate={{
                opacity: [0.3, 0.7, 0.3],
                scale: [1, 1.2, 1]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </motion.button>
        </TooltipTrigger>
        <TooltipContent 
          side="bottom" 
          className="bg-black/95 border-2 backdrop-blur-sm"
          style={{ borderColor: config.color }}
        >
          <div className="text-xs">
            <div className="font-bold text-white">{config.nameIt}</div>
            <div className="text-white/60">DNA: {config.name}</div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
