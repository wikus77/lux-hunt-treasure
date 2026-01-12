/**
 * Risiko Domination - Stats Badge Component
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 * 
 * Mostra statistiche dominio dell'utente in un badge compatto
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Globe, Crown, Swords } from 'lucide-react';
import { useUserDominationStats } from '@/pages/sandbox/map3d/hooks/useCountryDomination';
import { CONTINENT_NAMES, COUNTRY_NAMES } from '@/lib/domination/continentMapping';

interface DominationStatsBadgeProps {
  userId: string | null;
  variant?: 'compact' | 'expanded';
  className?: string;
}

export const DominationStatsBadge: React.FC<DominationStatsBadgeProps> = ({
  userId,
  variant = 'compact',
  className = ''
}) => {
  const { stats, loading } = useUserDominationStats(userId);

  if (!userId || loading) {
    return null;
  }

  if (!stats || stats.countries_owned === 0) {
    return null;
  }

  if (variant === 'compact') {
    return (
      <motion.div
        className={`flex items-center gap-1.5 px-2 py-1 rounded-full bg-gradient-to-r from-green-900/60 to-cyan-900/60 border border-green-500/30 ${className}`}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <Globe className="w-3.5 h-3.5 text-green-400" />
        <span className="text-xs font-bold text-green-300">
          {stats.countries_owned}
        </span>
        {stats.continents_owned.length > 0 && (
          <>
            <Crown className="w-3 h-3 text-yellow-400" />
            <span className="text-xs font-bold text-yellow-300">
              {stats.continents_owned.length}
            </span>
          </>
        )}
      </motion.div>
    );
  }

  // Expanded variant
  return (
    <motion.div
      className={`p-4 rounded-xl bg-gradient-to-br from-green-950/80 to-cyan-950/80 border border-green-500/30 backdrop-blur-sm ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center gap-2 mb-3">
        <Globe className="w-5 h-5 text-green-400" />
        <h3 className="text-sm font-bold text-green-300">Risiko Domination</h3>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {/* Paesi conquistati */}
        <div className="text-center">
          <div className="text-2xl font-bold text-green-400">
            {stats.countries_owned}
          </div>
          <div className="text-xs text-green-300/70">Paesi</div>
        </div>

        {/* Paesi contested */}
        <div className="text-center">
          <div className="text-2xl font-bold text-amber-400">
            {stats.countries_contested}
          </div>
          <div className="text-xs text-amber-300/70">Contesi</div>
        </div>

        {/* Vittorie totali */}
        <div className="text-center">
          <div className="text-2xl font-bold text-cyan-400">
            {stats.total_wins}
          </div>
          <div className="text-xs text-cyan-300/70">Vittorie</div>
        </div>
      </div>

      {/* Continenti conquistati */}
      {stats.continents_owned.length > 0 && (
        <div className="mt-3 pt-3 border-t border-green-500/20">
          <div className="flex items-center gap-1.5 mb-2">
            <Crown className="w-4 h-4 text-yellow-400" />
            <span className="text-xs font-bold text-yellow-300">
              Continenti Conquistati
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {stats.continents_owned.map(continent => (
              <span
                key={continent}
                className="px-2 py-0.5 text-xs font-medium rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"
              >
                {CONTINENT_NAMES[continent] || continent}
              </span>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default DominationStatsBadge;

