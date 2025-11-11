/**
 * M1 UNITS™ Pill — Realtime Balance Display
 * Shows user M1 Units balance with realtime updates
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import { useEffect, useState } from 'react';
import { useM1UnitsRealtime } from '@/hooks/useM1UnitsRealtime';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';

interface M1UnitsPillProps {
  className?: string;
  showLabel?: boolean;
}

export const M1UnitsPill = ({ className = '', showLabel = true }: M1UnitsPillProps) => {
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const [pulseAnimation, setPulseAnimation] = useState(false);
  const [prevBalance, setPrevBalance] = useState<number | null>(null);

  // Get current user ID
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setUserId(data.user.id);
      }
    };
    getUser();
  }, []);

  const { unitsData, isLoading, error, connectionState } = useM1UnitsRealtime(userId);

  // Trigger pulse animation on balance change
  useEffect(() => {
    if (unitsData?.balance !== undefined && prevBalance !== null && unitsData.balance !== prevBalance) {
      setPulseAnimation(true);
      setTimeout(() => setPulseAnimation(false), 800);
    }
    if (unitsData?.balance !== undefined) {
      setPrevBalance(unitsData.balance);
    }
  }, [unitsData?.balance, prevBalance]);

  // Always render - show skeleton when loading, error state, or data
  const displayValue = isLoading ? '...' : error ? '—' : unitsData?.balance?.toLocaleString() ?? '—';

  return (
    <motion.div
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl backdrop-blur-md bg-gradient-to-r from-[#070818]/80 to-[#131524]/80 border border-white/10 shadow-lg ${className}`}
      animate={pulseAnimation ? { scale: [1, 1.05, 1] } : {}}
      transition={{ duration: 0.3 }}
    >
      {/* M1 Badge - Yellow Circle */}
      <motion.div 
        className="flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-[#FFD700] to-[#FFA500] shadow-md"
        animate={pulseAnimation ? { rotate: [0, 10, -10, 0] } : {}}
      >
        <span className="text-xs font-bold text-black">M1</span>
      </motion.div>

      {/* Balance Display */}
      <AnimatePresence mode="wait">
        <motion.div
          key={displayValue}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="flex items-center gap-1.5"
        >
          {showLabel && (
            <span className="text-sm font-semibold text-white/90">M1U</span>
          )}
          <span 
            className={`text-sm font-bold ${
              isLoading ? 'text-white/50 animate-pulse' : 
              error ? 'text-white/40' : 
              'text-white'
            }`}
          >
            {displayValue}
          </span>
        </motion.div>
      </AnimatePresence>

      {/* Heartbeat indicator */}
      {(connectionState === 'HEARTBEAT' || pulseAnimation) && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          className="w-2 h-2 rounded-full bg-[#00D1FF] shadow-[0_0_8px_rgba(0,209,255,0.8)]"
        />
      )}
    </motion.div>
  );
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
