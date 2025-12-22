/**
 * M1 UNITS™ Pill — Realtime Balance Display
 * Shows user M1 Units balance with realtime updates
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import { useEffect, useState, useRef } from 'react';
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
  
  // 🎰 SLOT MACHINE animation state
  const [isSlotAnimating, setIsSlotAnimating] = useState(false);
  const [slotDisplayValue, setSlotDisplayValue] = useState<number | null>(null);
  const slotAnimationRef = useRef<NodeJS.Timeout | null>(null);

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

  const { unitsData, isLoading, error, connectionState, refetch } = useM1UnitsRealtime(userId);

  // 🎰 Slot Machine Animation Function
  const animateSlotMachine = (startValue: number, targetValue: number) => {
    const duration = 1500; // 1.5 secondi
    const steps = 25;
    const stepDuration = duration / steps;
    let currentStep = 0;

    setIsSlotAnimating(true);
    setPulseAnimation(true);

    if (slotAnimationRef.current) {
      clearInterval(slotAnimationRef.current);
    }

    slotAnimationRef.current = setInterval(() => {
      currentStep++;
      
      if (currentStep >= steps) {
        // Fine animazione - mostra valore finale
        setSlotDisplayValue(null);
        setIsSlotAnimating(false);
        setPulseAnimation(false);
        if (slotAnimationRef.current) {
          clearInterval(slotAnimationRef.current);
          slotAnimationRef.current = null;
        }
      } else {
        // Durante animazione - numeri random che tendono verso il target
        const progress = currentStep / steps;
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const randomOffset = Math.floor(Math.random() * 100) - 50;
        const interpolated = Math.floor(startValue + (targetValue - startValue) * easeOut) + randomOffset;
        setSlotDisplayValue(Math.max(0, interpolated));
      }
    }, stepDuration);
  };

  // 🔥 FIX: Listen for BUZZ events AND M1U balance updates to refetch immediately
  useEffect(() => {
    const handleRefresh = () => {
      console.log('💰 M1UnitsPill: BUZZ event received, refetching balance...');
      setTimeout(() => refetch(), 500);
    };

    // 🎰 Handle cashback claim with slot machine animation
    const handleCashbackClaim = () => {
      console.log('🎰 M1UnitsPill: Cashback claimed, starting slot machine animation...');
      const currentBalance = unitsData?.balance || 0;
      // Refetch to get new balance
      setTimeout(async () => {
        await refetch();
      }, 300);
    };

    window.addEventListener('buzzAreaCreated', handleRefresh);
    window.addEventListener('buzzClueCreated', handleRefresh);
    window.addEventListener('m1u-balance-updated', handleCashbackClaim);
    
    return () => {
      window.removeEventListener('buzzAreaCreated', handleRefresh);
      window.removeEventListener('buzzClueCreated', handleRefresh);
      window.removeEventListener('m1u-balance-updated', handleCashbackClaim);
      if (slotAnimationRef.current) {
        clearInterval(slotAnimationRef.current);
      }
    };
  }, [refetch, unitsData?.balance]);

  // Trigger slot machine animation on balance INCREASE
  useEffect(() => {
    if (unitsData?.balance !== undefined && prevBalance !== null) {
      const diff = unitsData.balance - prevBalance;
      
      // Se il saldo è AUMENTATO (cashback riscattato o acquisto M1U)
      if (diff > 0 && diff > 10) {
        console.log(`🎰 M1UnitsPill: Balance increased by ${diff}, triggering slot machine!`);
        animateSlotMachine(prevBalance, unitsData.balance);
      } else if (unitsData.balance !== prevBalance) {
        // Animazione semplice per decrementi o piccoli incrementi
        setPulseAnimation(true);
        setTimeout(() => setPulseAnimation(false), 800);
      }
    }
    if (unitsData?.balance !== undefined) {
      setPrevBalance(unitsData.balance);
    }
  }, [unitsData?.balance]);

  // Always render - show skeleton when loading, error state, slot animation, or data
  const displayValue = isLoading 
    ? '...' 
    : error 
      ? '—' 
      : isSlotAnimating && slotDisplayValue !== null
        ? slotDisplayValue.toLocaleString()
        : unitsData?.balance?.toLocaleString() ?? '—';

  return (
    <>
      <div className="inline-flex items-center gap-2">
        {/* M1U Pill - Responsive for PWA + Slot Machine Animation */}
        <motion.div
          className={`inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-2xl backdrop-blur-md bg-gradient-to-r from-[#070818]/80 to-[#131524]/80 border shadow-lg ${
            isSlotAnimating 
              ? 'border-[#FFD700]/60 ring-2 ring-[#FFD700]/40 ring-offset-1 ring-offset-transparent' 
              : 'border-white/10'
          } ${className}`}
          animate={
            isSlotAnimating 
              ? { scale: [1, 1.08, 1.02, 1.06, 1], rotate: [0, -1, 1, -1, 0] }
              : pulseAnimation 
                ? { scale: [1, 1.05, 1] } 
                : {}
          }
          transition={{ duration: isSlotAnimating ? 1.5 : 0.3, repeat: isSlotAnimating ? 0 : 0 }}
        >
          {/* M1 Badge - Yellow Circle - Responsive + Slot Machine Effect */}
          <motion.div 
            className={`flex items-center justify-center w-5 h-5 sm:w-7 sm:h-7 rounded-full bg-gradient-to-br from-[#FFD700] to-[#FFA500] ${
              isSlotAnimating ? 'shadow-[0_0_16px_rgba(255,215,0,0.8)]' : 'shadow-md'
            }`}
            animate={
              isSlotAnimating 
                ? { rotate: [0, 360, 720, 1080], scale: [1, 1.2, 1, 1.1, 1] } 
                : pulseAnimation 
                  ? { rotate: [0, 10, -10, 0] } 
                  : {}
            }
            transition={{ duration: isSlotAnimating ? 1.5 : 0.3 }}
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
              <motion.span 
                className={`text-xs sm:text-sm font-bold ${
                  isLoading ? 'text-white/50 animate-pulse' : 
                  error ? 'text-white/40' : 
                  isSlotAnimating ? 'text-[#FFD700]' :
                  'text-white'
                }`}
                animate={isSlotAnimating ? { 
                  color: ['#FFFFFF', '#FFD700', '#FFA500', '#FFD700', '#FFFFFF'],
                  textShadow: ['0 0 0px #FFD700', '0 0 10px #FFD700', '0 0 5px #FFD700', '0 0 10px #FFD700', '0 0 0px #FFD700']
                } : {}}
                transition={{ duration: 1.5 }}
              >
                {displayValue}
              </motion.span>
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
