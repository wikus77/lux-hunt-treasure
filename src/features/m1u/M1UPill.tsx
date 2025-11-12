/**
 * M1 UNITS™ Pill — Glassmorphism Design with Animated Orb
 * Realtime balance display with M1SSION™ branding
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useM1UnitsRealtime } from '@/hooks/useM1UnitsRealtime';
import { supabase } from '@/integrations/supabase/client';
import { M1UnitsShopModal } from '@/components/m1units/M1UnitsShopModal';
import '@/features/m1u/m1u-ui.css';

interface M1UPillProps {
  className?: string;
  showLabel?: boolean;
  showPlusButton?: boolean;
}

const M1UPill: React.FC<M1UPillProps> = ({
  className = '',
  showLabel = true,
  showPlusButton = true,
}) => {
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

  const { unitsData, isLoading, error } = useM1UnitsRealtime(userId);

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

  const balance = unitsData?.balance ?? 0;
  const lowBalance = balance < 100;

  const handleOpenRecharge = () => {
    setShowShopModal(true);
  };

  return (
    <>
      <div className={`flex items-center gap-3 relative ${className}`}>
        <motion.div
          className="m1u-pill-main flex items-center gap-2 px-4 py-2 rounded-full cursor-pointer"
          style={{
            background:
              'radial-gradient(120% 120% at 50% 10%, rgba(255,255,255,.08), rgba(0,0,0,.2) 58%)',
            border: '1px solid rgba(255, 255, 255, 0.18)',
            boxShadow:
              '0 2px 12px rgba(0,0,0,.35), 0 0 20px rgba(255, 215, 0, 0.12) inset',
            backdropFilter: 'blur(12px)',
            minHeight: 40,
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleOpenRecharge}
          animate={pulseAnimation ? { scale: [1, 1.05, 1] } : {}}
          transition={{ duration: 0.3 }}
        >
          {/* Icona M1 */}
          <motion.div
            className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
            style={{
              background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
              color: '#1a1a1a',
              boxShadow: '0 0 8px rgba(255, 215, 0, 0.6)',
            }}
            animate={pulseAnimation ? { rotate: [0, 10, -10, 0] } : {}}
          >
            M1
          </motion.div>

          {/* Stato dinamico */}
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                className="animate-pulse text-sm font-orbitron text-white opacity-60"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                …
              </motion.div>
            ) : error ? (
              <motion.div
                key="error"
                className="flex items-center gap-1 text-sm font-orbitron text-red-500"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <AlertCircle className="w-3 h-3" /> ERR
              </motion.div>
            ) : (
              <motion.div
                key="balance"
                className="flex items-center gap-1.5"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
              >
                {showLabel && (
                  <span className="text-sm font-semibold text-white/90 font-orbitron">M1U</span>
                )}
                <span className="text-sm font-bold text-white font-orbitron tracking-wide">
                  {balance.toLocaleString('it-IT')}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Low balance indicator */}
          {lowBalance && !isLoading && !error && (
            <div
              className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"
              style={{ boxShadow: '0 0 8px rgba(239,68,68,0.8)' }}
            />
          )}
        </motion.div>

        {/* Plus Orb */}
        {showPlusButton && (
          <motion.button
            className="pill-orb"
            aria-label="Add M1U"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              handleOpenRecharge();
            }}
          >
            <Plus className="w-4 h-4 text-cyan-100" />
            <span className="dot" />
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

export default M1UPill;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
