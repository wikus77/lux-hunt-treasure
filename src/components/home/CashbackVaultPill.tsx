/**
 * M1SSION Cashback Vault™ Pill — Slot Machine Animation + Glassmorphism
 * Displays accumulated cashback M1U with claim functionality
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Vault, Gift, Clock, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { useCashbackWallet } from '@/hooks/useCashbackWallet';
import { M1SSION_ENABLE_CASHBACK } from '@/config/cashbackConfig';
import { emitM1UCreditEvent } from '@/features/m1u/m1uCreditEvent';
import { buttonClickFeedback } from '@/utils/buttonClickFeedback';

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
  const { t } = useTranslation();
  const {
    accumulatedM1U,
    canClaim,
    nextClaimAvailable,
    isLoading,
    error: walletError,
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

  // Handle claim with better error handling
  const handleClaim = async () => {
    console.log('[CashbackVaultPill] handleClaim called', { canClaim, isClaiming, accumulatedM1U });
    
    if (isClaiming) {
      console.log('[CashbackVaultPill] Already claiming, skipping');
      return;
    }
    
    // Se il pulsante è disabilitato ma l'utente è riuscito a premere, mostra motivo
    if (!canClaim) {
      if (accumulatedM1U <= 0) {
        toast.error(t('home_cashback_no_claim'), { description: t('home_cashback_accumulate_playing') });
      } else if (nextClaimAvailable) {
        toast.error(t('home_cashback_not_yet'), { 
          description: t('home_cashback_next', { date: formatNextClaim() }) 
        });
      }
      return;
    }

    setIsClaiming(true);
    try {
      console.log('[CashbackVaultPill] Calling claimCashback...');
      const result = await claimCashback();
      console.log('[CashbackVaultPill] claimCashback result:', result);
      
      if (result) {
        toast.success(`🎉 ${t('home_cashback_claimed')}`, {
          description: t('home_cashback_credited', { amount: result.credited_m1u.toLocaleString() }),
        });
        setShowClaimModal(false);
        window.dispatchEvent(new CustomEvent('m1u-balance-updated'));
        emitM1UCreditEvent(result.credited_m1u, 'cashback');
      } else {
        toast.error(t('home_cashback_claim_failed'), { 
          description: walletError || t('home_cashback_check_connection') 
        });
      }
    } catch (err: any) {
      console.error('[CashbackVaultPill] Claim error:', err);
      toast.error(t('home_cashback_error'), { 
        description: err?.message || t('home_cashback_retry') 
      });
    } finally {
      setIsClaiming(false);
    }
  };

  const formatNextClaim = () => {
    if (!nextClaimAvailable) return t('home_cashback_available_now');
    const now = new Date();
    const diff = nextClaimAvailable.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days <= 0) return t('home_cashback_available');
    if (days === 1) return t('home_cashback_tomorrow');
    return t('home_cashback_in_days', { count: days });
  };

  return (
    <>
      {/* Pill principale - COMPATTO come Streak/Shop (rounded-full) */}
      <motion.div
        className={`
          relative overflow-hidden rounded-full
          cursor-pointer
          ${isAnimating ? 'ring-2 ring-cyan-400/50' : ''}
          ${className}
        `}
        style={{
          background: 'linear-gradient(135deg, rgba(0, 209, 255, 0.25), rgba(236, 72, 153, 0.2))',
          border: '1px solid rgba(0, 209, 255, 0.5)',
          boxShadow: '0 2px 16px rgba(0, 209, 255, 0.4), inset 0 0 24px rgba(236, 72, 153, 0.15)',
          backdropFilter: 'blur(12px)',
        }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ 
          opacity: 1, 
          scale: isAnimating ? [1, 1.05, 1] : 1,
        }}
        transition={{ 
          duration: isAnimating ? 0.3 : 0.3,
          repeat: isAnimating ? 3 : 0,
        }}
        onClick={() => {
          buttonClickFeedback();
          if (accumulatedM1U > 0) setShowClaimModal(true);
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="relative px-4 py-2 flex items-center gap-2">
          {/* Icon */}
          <div className="relative">
            <motion.div 
              className="w-5 h-5 rounded-full bg-gradient-to-br from-cyan-400 to-pink-500 flex items-center justify-center"
              style={{ boxShadow: '0 0 8px rgba(0, 209, 255, 0.6)' }}
              animate={isAnimating ? { rotate: [0, 10, -10, 0] } : {}}
              transition={{ duration: 0.2, repeat: isAnimating ? 5 : 0 }}
            >
              <Vault className="w-3 h-3 text-white" />
            </motion.div>
            {canClaim && accumulatedM1U > 0 && (
              <motion.div
                className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full border border-black"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              />
            )}
          </div>

            {/* Content - COMPATTO: solo valore */}
          <motion.span 
            className={`text-sm font-bold font-orbitron ${isAnimating ? 'text-cyan-300' : 'text-white/90'}`}
            animate={isAnimating ? { 
              color: ['#fff', '#22d3ee', '#f472b6', '#22d3ee', '#fff']
            } : {}}
            transition={{ duration: 1.2 }}
          >
            {isLoading ? '...' : `+${displayedValue}`}
          </motion.span>
          
          {/* Indicator se può riscattare */}
          {canClaim && accumulatedM1U > 0 && (
            <motion.div
              className="w-2 h-2 bg-green-500 rounded-full"
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              style={{ boxShadow: '0 0 6px rgba(34, 197, 94, 0.8)' }}
            />
          )}
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
                  {t('home_cashback_title')}
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
                    {t('home_cashback_desc')}
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
                    {t('home_cashback_cancel')}
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
                        {t('home_cashback_claim')}
                      </>
                    )}
                  </motion.button>
                </div>

                {/* Info */}
                {!canClaim && (
                  <p className="relative text-center text-white/50 text-xs mt-5">
                    {nextClaimAvailable 
                      ? `⏰ ${t('home_cashback_next', { date: formatNextClaim() })}`
                      : t('home_cashback_accumulate')
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
