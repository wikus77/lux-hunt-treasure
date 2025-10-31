// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProgressHUDProps {
  totalLinks: number;
  linksByTheme: Record<string, number>;
  milestones: number;
  maxMilestones: number;
  activeTheme: string | null;
}

export function ProgressHUD({ totalLinks, linksByTheme, milestones, maxMilestones, activeTheme }: ProgressHUDProps) {
  const maxLinks = 48;
  const percentage = Math.min(100, Math.round((totalLinks / maxLinks) * 100));
  
  return (
    <div className="absolute top-4 left-4 z-40 pointer-events-none select-none">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="backdrop-blur-md bg-black/70 rounded-lg border border-cyan-400/30 p-3 space-y-2"
      >
        {/* Progress Bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-cyan-400 font-medium">Links</span>
            <span className="text-white font-mono">{totalLinks} / {maxLinks}</span>
          </div>
          <div className="w-48 h-1.5 bg-black/50 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-cyan-400 to-violet-400"
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          </div>
          <div className="text-right">
            <span className="text-cyan-300/70 text-xs font-mono">{percentage}%</span>
          </div>
        </div>

        {/* Milestones */}
        <div className="flex items-center justify-between text-xs pt-2 border-t border-cyan-400/20">
          <span className="text-violet-400 font-medium">Milestones</span>
          <span className="text-white font-mono">{milestones} / {maxMilestones}</span>
        </div>

        {/* Active Theme */}
        <AnimatePresence>
          {activeTheme && linksByTheme[activeTheme] !== undefined && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="pt-2 border-t border-cyan-400/20"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="text-cyan-300/90">{activeTheme}</span>
                <span className="text-white/90 font-mono">{linksByTheme[activeTheme]} / 12</span>
              </div>
              <div className="w-full h-1 bg-black/50 rounded-full overflow-hidden mt-1">
                <motion.div
                  className="h-full bg-gradient-to-r from-cyan-500 to-violet-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (linksByTheme[activeTheme] / 12) * 100)}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
