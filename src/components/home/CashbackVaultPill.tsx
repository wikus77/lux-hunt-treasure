/**
 * M1SSION Cashback Vault™ Pill — Slot Machine Animation + Glassmorphism
 * Displays accumulated cashback M1U with claim functionality
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
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

      {/* Claim Modal - Renderizzato via Portal nel body */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {showClaimModal && accumulatedM1U > 0 && (
            <motion.div
              className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowClaimModal(false)}
            >
              <motion.div
                className="rounded-3xl p-7 max-w-md w-full relative overflow-hidden"
                style={{
                  background: 'linear-gradient(145deg, rgba(0, 40, 40, 0.98), rgba(0, 60, 60, 0.95))',
                  border: '2px solid rgba(0, 255, 136, 0.5)',
                  boxShadow: '0 0 60px rgba(0, 255, 136, 0.3), 0 12px 40px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255,255,255,0.1)',
                }}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Ambient glow */}
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'radial-gradient(ellipse at 50% 0%, rgba(0, 255, 136, 0.2) 0%, transparent 60%)',
                  pointerEvents: 'none',
                  borderRadius: '24px',
                }} />
                
                {/* Icon */}
                <div className="relative flex justify-center mb-5">
                  <div 
                    className="w-20 h-20 rounded-2xl flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(135deg, #00FF88 0%, #00D1FF 100%)',
                      boxShadow: '0 8px 30px rgba(0, 255, 136, 0.5)',
                    }}
                  >
                    <Vault className="w-10 h-10 text-black" />
                  </div>
                </div>

                {/* Title */}
                <h3 
                  className="text-2xl font-bold text-center mb-3"
                  style={{ 
                    color: '#00FF88',
                    textShadow: '0 0 20px rgba(0, 255, 136, 0.6)',
                  }}
                >
                  M1SSION Cashback Vault™
                </h3>

                {/* Amount */}
                <div className="relative text-center mb-7">
                  <span 
                    className="text-5xl font-bold"
                    style={{
                      background: 'linear-gradient(135deg, #00FF88, #00E5FF)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      textShadow: '0 0 30px rgba(0, 255, 136, 0.4)',
                    }}
                  >
                    +{accumulatedM1U.toLocaleString()}
                  </span>
                  <span className="text-2xl text-cyan-300 ml-2">M1U</span>
                  <p className="text-white/70 text-sm mt-3">
                    Cashback accumulato pronto per essere riscattato
                  </p>
                </div>

                {/* Buttons */}
                <div className="relative flex gap-3">
                  <motion.button
                    className="flex-1 py-4 px-5 rounded-xl font-semibold"
                    style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      color: '#fff',
                    }}
                    whileHover={{ scale: 1.02, background: 'rgba(255, 255, 255, 0.15)' }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowClaimModal(false)}
                  >
                    Annulla
                  </motion.button>
                  <motion.button
                    className="flex-1 py-4 px-5 rounded-xl font-bold flex items-center justify-center gap-2"
                    style={{
                      background: canClaim 
                        ? 'linear-gradient(135deg, #00FF88 0%, #00D1FF 100%)' 
                        : 'rgba(100,100,100,0.3)',
                      color: canClaim ? '#000' : 'rgba(255,255,255,0.4)',
                      boxShadow: canClaim ? '0 4px 25px rgba(0, 255, 136, 0.4)' : 'none',
                      cursor: canClaim ? 'pointer' : 'not-allowed',
                    }}
                    whileHover={canClaim ? { scale: 1.02, boxShadow: '0 6px 35px rgba(0, 255, 136, 0.6)' } : {}}
                    whileTap={canClaim ? { scale: 0.98 } : {}}
                    onClick={handleClaim}
                    disabled={!canClaim || isClaiming}
                  >
                    {isClaiming ? (
                      <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    ) : (
                      <>
                        <Gift className="w-5 h-5" />
                        Riscatta
                      </>
                    )}
                  </motion.button>
                </div>

                {/* Info - SOLO DOMENICA */}
                {!canClaim && (
                  <p className="relative text-center text-white/50 text-xs mt-5">
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
        </AnimatePresence>,
        document.body
      )}
    </>
  );
};

export default CashbackVaultPill;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
