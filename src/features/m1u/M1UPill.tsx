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
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
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
  // ⚡ FIX: Usa useUnifiedAuth per avere userId SUBITO (no chiamata di rete extra)
  const { user } = useUnifiedAuth();
  const userId = user?.id;
  
  const [pulseAnimation, setPulseAnimation] = useState(false);
  const [prevBalance, setPrevBalance] = useState<number | null>(null);
  const [showShopModal, setShowShopModal] = useState(false);
  const [shopOriginRect, setShopOriginRect] = useState<DOMRect | null>(null);
  
  const { unitsData, isLoading, error, refetch } = useM1UnitsRealtime(userId);
  
  // 🚀 Get cached M1U for instant display
  const getCachedM1U = (): number => {
    try {
      const cached = localStorage.getItem('m1ssion_m1u_cache');
      if (cached) {
        const { balance, userId: cachedUserId } = JSON.parse(cached);
        if (cachedUserId === userId) return balance;
      }
    } catch {}
    return unitsData?.balance || 0;
  };
  
  // 🎰 SLOT MACHINE ANIMATION STATE - Initialize with cached value!
  const [displayedBalance, setDisplayedBalance] = useState<number>(() => getCachedM1U());
  const [isAnimating, setIsAnimating] = useState(false);
  const animationRef = React.useRef<number | null>(null);

  // 🏪 COUNTER ANIMATION - Animates numbers rolling up progressively
  const animateBalance = (startValue: number, endValue: number, duration: number = 2000) => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    const startTime = performance.now();
    const difference = endValue - startValue;
    
    setIsAnimating(true);
    setPulseAnimation(true);
    
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth deceleration (like a slot machine slowing down)
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      
      const currentValue = Math.round(startValue + (difference * easeOutQuart));
      setDisplayedBalance(currentValue);
      
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayedBalance(endValue);
        setIsAnimating(false);
        setPulseAnimation(false);
        animationRef.current = null;
      }
    };
    
    animationRef.current = requestAnimationFrame(animate);
  };

  // 🔥 FIX: Listen for BUZZ events and SHOP purchases to refetch M1U immediately
  useEffect(() => {
    const handleRefresh = () => {
      console.log('💰 M1UPill: Event received, refetching balance...');
      refetch();
    };

    // Also listen for shop purchases (M1U spent)
    const handleM1USpent = (event: CustomEvent) => {
      const amount = event.detail?.amount || 0;
      const newBalance = event.detail?.newBalance;
      console.log('💸 M1UPill: M1U spent event!', { amount, newBalance });
      
      // Immediately update displayed balance if we have the new value
      if (newBalance !== undefined) {
        setDisplayedBalance(newBalance);
        setPrevBalance(newBalance);
      }
      
      // Also refetch to be sure
      setTimeout(() => refetch(), 300);
    };

    window.addEventListener('buzzAreaCreated', handleRefresh);
    window.addEventListener('buzzClueCreated', handleRefresh);
    window.addEventListener('m1u-spent', handleM1USpent as EventListener);
    window.addEventListener('m1u-balance-changed', handleRefresh);
    
    return () => {
      window.removeEventListener('buzzAreaCreated', handleRefresh);
      window.removeEventListener('buzzClueCreated', handleRefresh);
      window.removeEventListener('m1u-spent', handleM1USpent as EventListener);
      window.removeEventListener('m1u-balance-changed', handleRefresh);
    };
  }, [refetch]);

  // 🎉 Listen for M1U credited event (from marker rewards) - trigger SLOT MACHINE animation
  useEffect(() => {
    const handleM1UCredited = (event: CustomEvent) => {
      const amount = event.detail?.amount || 0;
      console.log('💰 M1UPill: M1U credited event received!', amount);
      
      // 🎰 Start slot machine animation from current displayed value
      const currentDisplayed = displayedBalance;
      const newBalance = currentDisplayed + amount;
      
      // Refetch to get actual new balance from server
      setTimeout(() => refetch(), 100);
      
      // Start the rolling animation - NO TOAST, let the animation speak!
      animateBalance(currentDisplayed, newBalance, 2500); // 2.5 seconds for dramatic effect
      
      // 🎰 Toast removed - the slot machine animation IS the celebration!
      console.log(`[M1UPill] 🎰 Slot machine animation started: +${amount} M1U`);
    };

    window.addEventListener('m1u-credited', handleM1UCredited as EventListener);
    return () => {
      window.removeEventListener('m1u-credited', handleM1UCredited as EventListener);
    };
  }, [refetch, displayedBalance]);

  // Initialize displayed balance when data loads - FIXED SYNC LOGIC
  useEffect(() => {
    if (unitsData?.balance !== undefined && !isAnimating) {
      // Always sync if difference exists (was broken before!)
      if (displayedBalance !== unitsData.balance) {
        console.log('💰 M1UPill: Syncing balance', { displayed: displayedBalance, actual: unitsData.balance });
        setDisplayedBalance(unitsData.balance);
      }
    }
  }, [unitsData?.balance, isAnimating, displayedBalance]);

  // Trigger pulse animation on balance change (for non-event changes)
  useEffect(() => {
    if (unitsData?.balance !== undefined && prevBalance !== null && unitsData.balance !== prevBalance) {
      // Only animate if difference is significant and not already animating
      if (!isAnimating && Math.abs(unitsData.balance - prevBalance) >= 5) {
        animateBalance(prevBalance, unitsData.balance, 1500);
      }
    }
    if (unitsData?.balance !== undefined) {
      setPrevBalance(unitsData.balance);
    }
  }, [unitsData?.balance, prevBalance, isAnimating]);
  
  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const balance = unitsData?.balance ?? 0;
  const lowBalance = balance < 100;

  const handleOpenRecharge = (e?: React.MouseEvent<HTMLElement>) => {
    if (e) {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      setShopOriginRect(rect);
    }
    setShowShopModal(true);
  };

  return (
    <>
      <div className={`flex items-center gap-2 relative ${className}`}>
        {/* Plus Orb - NOW FIRST (LEFT) */}
        {showPlusButton && (
          <motion.button
            className="pill-orb"
            aria-label="Add M1U"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={(e) => {
              handleOpenRecharge(e);
            }}
          >
            <Plus className="w-4 h-4 text-cyan-100" />
            <span className="dot" />
          </motion.button>
        )}

        {/* M1U Pill - NOW SECOND (RIGHT) */}
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
          onClick={(e) => handleOpenRecharge(e)}
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
            {/* 🚀 FIX: Show cached balance immediately instead of loading dots */}
            {isLoading && displayedBalance === 0 ? (
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
                <span 
                  className={`text-sm font-bold font-orbitron tracking-wide transition-all ${
                    isAnimating 
                      ? 'text-[#FFD700] scale-110 drop-shadow-[0_0_8px_rgba(255,215,0,0.8)]' 
                      : 'text-white'
                  }`}
                  style={{
                    textShadow: isAnimating ? '0 0 10px rgba(255, 215, 0, 0.9)' : 'none'
                  }}
                >
                  {displayedBalance.toLocaleString('it-IT')}
                </span>
                {/* 🎰 Sparkle effect during animation */}
                {isAnimating && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                    className="text-yellow-400 text-xs"
                  >
                    ✨
                  </motion.span>
                )}
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
      </div>

      {/* M1U Shop Modal - FULLSCREEN con animazione FLIP */}
      <M1UnitsShopModal 
        isOpen={showShopModal}
        onClose={() => setShowShopModal(false)}
        originRect={shopOriginRect}
      />
    </>
  );
};

export default M1UPill;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
