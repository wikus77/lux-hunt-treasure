/**
 * Battle Pill - Circular floating button for battle system
 * Replaces BattleWidget with pill + modal approach
 * Uses pill-orb style like other map pills
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Swords } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useMyActiveBattles } from '@/hooks/useMyActiveBattles';
import { BattleModal } from './BattleModal';
import '@/features/m1u/m1u-ui.css'; // For pill-orb style

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
      {/* Battle Pill - pill-orb style */}
      <motion.button
        className="pill-orb fixed z-[1001]"
        style={{
          left: '16px',
          bottom: 'calc(env(safe-area-inset-bottom, 34px) + 240px)',
        }}
        onClick={() => setIsModalOpen(true)}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        aria-label="Battle System"
      >
        <Swords className="w-5 h-5 text-red-400" />
        <span className="dot" style={{ background: '#f44', boxShadow: '0 0 8px #f44' }} />
        
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
