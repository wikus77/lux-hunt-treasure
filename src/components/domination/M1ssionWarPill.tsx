/**
 * M1SSION WAR — Pill per accedere alle statistiche dominio
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Globe, Swords } from 'lucide-react';
import { M1ssionWarModal } from './M1ssionWarModal';

interface M1ssionWarPillProps {
  userId: string | null;
  className?: string;
}

export const M1ssionWarPill: React.FC<M1ssionWarPillProps> = ({
  userId,
  className = ''
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!userId) return null;

  return (
    <>
      <motion.button
        onClick={() => setIsModalOpen(true)}
        className={`
          flex items-center gap-2 px-3 py-2
          bg-gradient-to-r from-red-900/80 to-orange-900/80
          backdrop-blur-md
          border border-red-500/40
          rounded-full
          shadow-lg shadow-red-500/20
          hover:from-red-800/90 hover:to-orange-800/90
          hover:border-red-400/60
          hover:shadow-red-500/30
          transition-all duration-300
          ${className}
        `}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="relative">
          <Globe className="w-4 h-4 text-red-400" />
          <Swords className="w-3 h-3 text-orange-400 absolute -bottom-1 -right-1" />
        </div>
        <span className="text-xs font-bold text-red-300 tracking-wide">
          WAR
        </span>
      </motion.button>

      <M1ssionWarModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userId={userId}
      />
    </>
  );
};

export default M1ssionWarPill;

