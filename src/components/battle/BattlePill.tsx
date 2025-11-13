/**
 * Battle Pill - Circular floating button for battle system
 * Replaces BattleWidget with pill + modal approach
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Swords } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useMyActiveBattles } from '@/hooks/useMyActiveBattles';
import { BattleModal } from './BattleModal';

interface BattlePillProps {
  userId: string | null;
}

export function BattlePill({ userId }: BattlePillProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { activeBattles, pendingChallenges, loading } = useMyActiveBattles(userId);

  const totalBadgeCount = activeBattles.length + pendingChallenges.length;

  if (!userId) return null;

  return (
    <>
      {/* Circular Battle Pill */}
      <motion.button
        className="fixed z-[1001] h-14 w-14 rounded-full flex items-center justify-center"
        style={{
          left: '16px',
          bottom: 'calc(env(safe-area-inset-bottom, 34px) + 240px)',
          background: 'radial-gradient(120% 120% at 50% 10%, rgba(255,255,255,.12), rgba(0,0,0,.3) 68%)',
          border: '1.5px solid rgba(0, 209, 255, 0.3)',
          boxShadow: '0 4px 20px rgba(0, 209, 255, 0.25), 0 0 30px rgba(138, 43, 226, 0.15) inset',
          backdropFilter: 'blur(16px)',
        }}
        onClick={() => setIsModalOpen(true)}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        <Swords className="h-6 w-6 text-cyan-400" />
        
        {/* Badge counter */}
        {totalBadgeCount > 0 && (
          <Badge
            className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px] bg-gradient-to-br from-red-500 to-pink-600 border-2 border-background"
            variant="destructive"
          >
            {totalBadgeCount}
          </Badge>
        )}
      </motion.button>

      {/* Battle Modal */}
      <BattleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userId={userId}
        activeBattles={activeBattles}
        pendingChallenges={pendingChallenges}
        loading={loading}
      />
    </>
  );
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
