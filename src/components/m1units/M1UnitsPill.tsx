/**
 * M1 UNITS™ Pill — Realtime Balance Display
 * Shows user M1 Units balance with realtime updates
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import { useEffect, useState } from 'react';
import { useM1UnitsRealtime } from '@/hooks/useM1UnitsRealtime';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import { M1UnitsShopModal } from './M1UnitsShopModal';

interface M1UnitsPillProps {
  className?: string;
  showLabel?: boolean;
  showPlusButton?: boolean;
}

export const M1UnitsPill = ({ className = '', showLabel = true, showPlusButton = true }: M1UnitsPillProps) => {
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const [pulseAnimation, setPulseAnimation] = useState(false);
  const [prevBalance, setPrevBalance] = useState<number | null>(null);
  const [showShopModal, setShowShopModal] = useState(false);

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
    <>
      <div className="inline-flex items-center gap-2">
        {/* M1U Pill - Responsive for PWA */}
        <motion.div
          className={`inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-2xl backdrop-blur-md bg-gradient-to-r from-[#070818]/80 to-[#131524]/80 border border-white/10 shadow-lg ${className}`}
          animate={pulseAnimation ? { scale: [1, 1.05, 1] } : {}}
          transition={{ duration: 0.3 }}
        >
          {/* M1 Badge - Yellow Circle - Responsive */}
          <motion.div 
            className="flex items-center justify-center w-5 h-5 sm:w-7 sm:h-7 rounded-full bg-gradient-to-br from-[#FFD700] to-[#FFA500] shadow-md"
            animate={pulseAnimation ? { rotate: [0, 10, -10, 0] } : {}}
          >
            <span className="text-[10px] sm:text-xs font-bold text-black">M1</span>
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
                <span className="text-xs sm:text-sm font-semibold text-white/90">M1U</span>
              )}
              <span 
                className={`text-xs sm:text-sm font-bold ${
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

        {/* Plus Button to open M1U Shop - Responsive for PWA */}
        {showPlusButton && (
          <motion.button
            onClick={() => setShowShopModal(true)}
            className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-[#00D1FF]/20 to-[#00D1FF]/10 border-2 border-[#00D1FF]/30 hover:border-[#00D1FF]/60 transition-all duration-300 hover:scale-110"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Acquista M1 Units"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-[#00D1FF]" />
          </motion.button>
        )}
      </div>

      {/* M1U Shop Modal */}
      <M1UnitsShopModal 
        isOpen={showShopModal}
        onClose={() => setShowShopModal(false)}
      />
    </>
  );
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
