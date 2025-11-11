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
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 ${className}`}
      animate={pulseAnimation ? { scale: [1, 1.05, 1] } : {}}
      transition={{ duration: 0.3 }}
    >
      {showLabel && (
        <span className="text-xs font-medium text-cyan-300/70">M1U</span>
      )}
      <AnimatePresence mode="wait">
        <motion.span
          key={displayValue}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className={`text-sm font-bold ${isLoading ? 'text-cyan-400/50' : error ? 'text-cyan-400/40' : 'text-cyan-400'}`}
        >
          {displayValue}
        </motion.span>
      </AnimatePresence>
      {(connectionState === 'HEARTBEAT' || pulseAnimation) && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.2, 1] }}
          className="w-2 h-2 rounded-full bg-cyan-400"
        />
      )}
    </motion.div>
  );
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
