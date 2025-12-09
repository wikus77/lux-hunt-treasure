/**
 * M1SSION Cashback Vault™ Pill — Slot Machine Animation + Glassmorphism
 * Displays accumulated cashback M1U with claim functionality
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Vault, Gift, Clock, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { useCashbackWallet } from '@/hooks/useCashbackWallet';
import { M1SSION_ENABLE_CASHBACK } from '@/config/cashbackConfig';

interface CashbackVaultPillProps {
  className?: string;
  variant?: 'full' | 'compact';
}

/**
 * CashbackVaultPill - Pill per visualizzare il cashback accumulato
 * 
 * Comportamento:
 * - Se M1SSION_ENABLE_CASHBACK === false: Pill nascosto (opzione A)
 * - Se M1SSION_ENABLE_CASHBACK === true: Mostra valore reale con opzione claim
 * - Animazione slot machine quando arriva cashback
 */
const CashbackVaultPill: React.FC<CashbackVaultPillProps> = ({
  className = '',
  variant = 'compact',
}) => {
  const {
    accumulatedM1U,
    canClaim,
    nextClaimAvailable,
    isLoading,
    claimCashback,
    refresh,
  } = useCashbackWallet();

  const [isClaiming, setIsClaiming] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(false);
  
  // 🎰 Slot machine animation state
  const [displayedValue, setDisplayedValue] = useState(accumulatedM1U);
  const [isAnimating, setIsAnimating] = useState(false);
  const animationRef = useRef<NodeJS.Timeout | null>(null);

  // ========================================================================
  // OPZIONE A: Pill nascosto se cashback disabilitato
  // ========================================================================
  if (!M1SSION_ENABLE_CASHBACK) {
    return null;
  }

  // 🎰 Slot machine animation function
  const animateSlotMachine = (targetValue: number, increment: number) => {
    const startValue = displayedValue;
    const duration = 1200; // 1.2 secondi
    const steps = 20;
    const stepDuration = duration / steps;
    let currentStep = 0;

    setIsAnimating(true);

    if (animationRef.current) {
      clearInterval(animationRef.current);
    }

    animationRef.current = setInterval(() => {
      currentStep++;
      
      if (currentStep >= steps) {
        // Fine animazione - mostra valore finale
        setDisplayedValue(targetValue);
        setIsAnimating(false);
        if (animationRef.current) {
          clearInterval(animationRef.current);
          animationRef.current = null;
        }
      } else {
        // Durante animazione - mostra numeri random che tendono verso il target
        const progress = currentStep / steps;
        const randomOffset = Math.floor(Math.random() * 10) - 5;
        const interpolated = Math.floor(startValue + (targetValue - startValue) * progress) + randomOffset;
        setDisplayedValue(Math.max(0, interpolated));
      }
    }, stepDuration);
  };

  // 🔥 Ascolta evento cashbackUpdated per animazione
  useEffect(() => {
    const handleCashbackUpdate = (event: CustomEvent<{ amount: number; source: string }>) => {
      console.log('[CashbackVaultPill] 🎰 Cashback update received:', event.detail);
      const newTotal = accumulatedM1U + event.detail.amount;
      animateSlotMachine(newTotal, event.detail.amount);
    };

    window.addEventListener('cashbackUpdated', handleCashbackUpdate as EventListener);
    return () => {
      window.removeEventListener('cashbackUpdated', handleCashbackUpdate as EventListener);
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
    };
  }, [accumulatedM1U]);

  // Sync displayed value with actual value when not animating
  useEffect(() => {
    if (!isAnimating) {
      setDisplayedValue(accumulatedM1U);
    }
  }, [accumulatedM1U, isAnimating]);

  // Handle claim
  const handleClaim = async () => {
    if (!canClaim || isClaiming) return;

    setIsClaiming(true);
    try {
      const result = await claimCashback();
      if (result) {
        toast.success(`🎉 Cashback riscattato!`, {
          description: `+${result.credited_m1u.toLocaleString()} M1U aggiunti al tuo saldo`,
        });
        setShowClaimModal(false);
        // Trigger M1U pill refresh
        window.dispatchEvent(new CustomEvent('m1u-balance-updated'));
      }
    } catch (err) {
      toast.error('Errore nel riscatto del cashback');
    } finally {
      setIsClaiming(false);
    }
  };

  // Format next claim date - SOLO DOMENICA
  const formatNextClaim = () => {
    if (!nextClaimAvailable) {
      // Se oggi è domenica e può riscattare
      const isSunday = new Date().getDay() === 0;
      return isSunday ? 'Disponibile oggi!' : 'Solo di Domenica';
    }
    const now = new Date();
    const diff = nextClaimAvailable.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days <= 0) return 'Disponibile';
    if (days === 1) return 'Domani (Dom)';
    return `Domenica (${days}g)`;
  };
  
  // Check if today is Sunday
  const isSunday = new Date().getDay() === 0;

  return (
    <>
      {/* Pill principale - Azzurro/Cyan gradiente Rosa, semitrasparente */}
      <motion.div
        className={`
          relative overflow-hidden rounded-2xl
          bg-gradient-to-br from-cyan-500/30 via-blue-500/25 to-pink-500/30
          backdrop-blur-md border border-cyan-400/30
          shadow-lg shadow-cyan-500/10
          cursor-pointer
          ${isAnimating ? 'ring-2 ring-cyan-400/50 ring-offset-2 ring-offset-transparent' : ''}
          ${className}
        `}
        initial={{ opacity: 0, y: 10 }}
        animate={{ 
          opacity: 1, 
          y: 0,
          scale: isAnimating ? [1, 1.02, 1] : 1,
        }}
        transition={{ 
          duration: isAnimating ? 0.3 : 0.3,
          repeat: isAnimating ? 3 : 0,
        }}
        onClick={() => accumulatedM1U > 0 && setShowClaimModal(true)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Glow effect - azzurro/rosa */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 via-pink-400/15 to-cyan-400/10 animate-pulse" />
        
        <div className="relative px-3 py-2 flex items-center justify-between gap-2">
          {/* Icon */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <motion.div 
                className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-400 to-pink-500 flex items-center justify-center shadow-lg shadow-cyan-500/30"
                animate={isAnimating ? { rotate: [0, 10, -10, 0] } : {}}
                transition={{ duration: 0.2, repeat: isAnimating ? 5 : 0 }}
              >
                <Vault className="w-4 h-4 text-white" />
              </motion.div>
              {canClaim && accumulatedM1U > 0 && (
                <motion.div
                  className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full border border-black"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                />
              )}
            </div>

            {/* Content */}
            <div className="flex flex-col">
              <span className="text-[10px] text-cyan-200/80 font-medium leading-tight">
                Cashback
              </span>
              <div className="flex items-center gap-1">
                {/* 🎰 Slot machine number display */}
                <motion.span 
                  className={`text-sm font-bold ${isAnimating ? 'text-cyan-300' : 'text-white'}`}
                  animate={isAnimating ? { 
                    color: ['#fff', '#22d3ee', '#f472b6', '#22d3ee', '#fff']
                  } : {}}
                  transition={{ duration: 1.2 }}
                >
                  {isLoading ? '...' : `+${displayedValue.toLocaleString()}`}
                </motion.span>
                <span className="text-[10px] text-cyan-300 font-medium">M1U</span>
              </div>
            </div>
          </div>

          {/* Claim status - compact */}
          {canClaim && accumulatedM1U > 0 ? (
            <motion.div
              className="flex items-center gap-1 px-1.5 py-0.5 bg-green-500/20 rounded-lg"
              whileHover={{ scale: 1.05 }}
            >
              <Gift className="w-2.5 h-2.5 text-green-400" />
              <ChevronRight className="w-2.5 h-2.5 text-green-400" />
            </motion.div>
          ) : nextClaimAvailable && nextClaimAvailable > new Date() ? (
            <div className="flex items-center gap-1 px-1.5 py-0.5 bg-gray-500/20 rounded-lg">
              <Clock className="w-2.5 h-2.5 text-gray-400" />
            </div>
          ) : null}
        </div>
      </motion.div>

      {/* Claim Modal */}
      <AnimatePresence>
        {showClaimModal && accumulatedM1U > 0 && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowClaimModal(false)}
          >
            <motion.div
              className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-6 max-w-sm w-full border border-cyan-500/30 shadow-2xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Icon */}
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-pink-500 flex items-center justify-center shadow-xl shadow-cyan-500/30">
                  <Vault className="w-8 h-8 text-white" />
                </div>
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-center text-white mb-2">
                M1SSION Cashback Vault™
              </h3>

              {/* Amount */}
              <div className="text-center mb-6">
                <span className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
                  +{accumulatedM1U.toLocaleString()}
                </span>
                <span className="text-xl text-cyan-300 ml-2">M1U</span>
                <p className="text-gray-400 text-sm mt-2">
                  Cashback accumulato pronto per essere riscattato
                </p>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <motion.button
                  className="flex-1 py-3 px-4 rounded-xl bg-gray-700 text-white font-medium"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowClaimModal(false)}
                >
                  Annulla
                </motion.button>
                <motion.button
                  className={`flex-1 py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-2
                    ${canClaim 
                      ? 'bg-gradient-to-r from-cyan-500 to-pink-500 text-white' 
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    }`}
                  whileHover={canClaim ? { scale: 1.02 } : {}}
                  whileTap={canClaim ? { scale: 0.98 } : {}}
                  onClick={handleClaim}
                  disabled={!canClaim || isClaiming}
                >
                  {isClaiming ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Gift className="w-4 h-4" />
                      Riscatta
                    </>
                  )}
                </motion.button>
              </div>

              {/* Info - SOLO DOMENICA */}
              {!canClaim && (
                <p className="text-center text-gray-500 text-xs mt-4">
                  {!isSunday 
                    ? '⏰ Il riscatto è disponibile solo di Domenica'
                    : nextClaimAvailable 
                      ? `Prossimo riscatto: ${formatNextClaim()}`
                      : 'Accumula cashback per riscattare'
                  }
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default CashbackVaultPill;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
