/**
 * M1 UNITS™ Pill — Glassmorphism Design with Animated Orb
 * Realtime balance display with M1SSION™ branding
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

const DEBUG_M1U_PILL = false;

const GLOBAL_LOCK_KEY = '__m1u_pill_credit_lock__';
const GLOBAL_REFETCH_LOCK_KEY = '__m1u_refetch_lock__';
const PENDING_CREDIT_KEY = '__m1u_pending_credit__';
const PENDING_CREDIT_TTL_MS = 5000;
const CREDIT_LOCK_WINDOW_MS = 2000;
const REFETCH_THROTTLE_MS = 1500;

interface PendingCredit {
  amount: number;
  issuedAt: number;
  source: string;
  id: string;
}

function readPendingCredit(win: (Window & { [key: string]: unknown }) | null): PendingCredit | null {
  if (!win || !win[PENDING_CREDIT_KEY]) return null;
  const p = win[PENDING_CREDIT_KEY] as PendingCredit;
  if (typeof p.amount !== 'number' || p.amount <= 0) return null;
  if (Date.now() - p.issuedAt >= PENDING_CREDIT_TTL_MS) {
    delete win[PENDING_CREDIT_KEY];
    return null;
  }
  return p;
}

function clearPendingCredit(win: (Window & { [key: string]: unknown }) | null): void {
  if (win && win[PENDING_CREDIT_KEY]) delete win[PENDING_CREDIT_KEY];
}

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useM1UnitsRealtime } from '@/hooks/useM1UnitsRealtime';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { M1UnitsShopModal } from '@/components/m1units/M1UnitsShopModal';
import { buttonClickFeedback } from '@/utils/buttonClickFeedback';
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
  const animationRef = useRef<number | null>(null);
  const animatingRef = useRef(false);
  const displayedBalanceRef = useRef(displayedBalance);
  const animationTargetRef = useRef<number | null>(null);
  const hardStopTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const instanceIdRef = useRef<string>(`pill-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`);
  const lastTickLogRef = useRef<number>(0);
  const lastCreditAtRef = useRef<number>(0);

  const HARD_STOP_MS = 3200;
  const CREDIT_COOLDOWN_MS = 4000;

  const win = typeof window !== 'undefined' ? (window as any) : null;

  displayedBalanceRef.current = displayedBalance;

  useEffect(() => {
    if (DEBUG_M1U_PILL) {
      const route = typeof window !== 'undefined' ? (window as any).location?.pathname ?? '' : '';
      console.error(`[M1UPill][mount] id=${instanceIdRef.current} route=${route}`);
    }
    return () => {
      if (DEBUG_M1U_PILL) console.error(`[M1UPill][unmount] id=${instanceIdRef.current}`);
      if (animationRef.current != null) cancelAnimationFrame(animationRef.current);
      if (hardStopTimeoutRef.current != null) clearTimeout(hardStopTimeoutRef.current);
      animatingRef.current = false;
    };
  }, []);

  const forceStopAnimation = useCallback(() => {
    const target = animationTargetRef.current;
    const displayedAtStop = displayedBalanceRef.current;
    if (DEBUG_M1U_PILL) console.error(`[M1UPill][forceStopAnimation] id=${instanceIdRef.current} finalTarget=${target} displayedBalanceRef.current=${displayedAtStop} reason=HARD_STOP_MS`);
    if (animationRef.current != null) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    if (hardStopTimeoutRef.current != null) {
      clearTimeout(hardStopTimeoutRef.current);
      hardStopTimeoutRef.current = null;
    }
    if (target != null) {
      setDisplayedBalance(target);
      setPrevBalance(target);
      animationTargetRef.current = null;
    }
    setIsAnimating(false);
    setPulseAnimation(false);
    animatingRef.current = false;
  }, []);

  // 🏪 COUNTER ANIMATION - Animates numbers rolling up progressively; hard-stop guaranteed
  const animateBalance = useCallback((startValue: number, endValue: number, duration: number = 2000) => {
    if (DEBUG_M1U_PILL) console.error(`[M1UPill][animateBalance:start] id=${instanceIdRef.current} start=${startValue} target=${endValue} dur=${duration} animatingRef=${animatingRef.current}`);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    if (hardStopTimeoutRef.current) {
      clearTimeout(hardStopTimeoutRef.current);
    }
    animationTargetRef.current = endValue;
    const startTime = performance.now();
    const difference = endValue - startValue;
    setIsAnimating(true);
    setPulseAnimation(true);
    animatingRef.current = true;

    hardStopTimeoutRef.current = setTimeout(() => {
      hardStopTimeoutRef.current = null;
      forceStopAnimation();
    }, HARD_STOP_MS);

    const animate = (currentTime: number) => {
      if (win && win[GLOBAL_LOCK_KEY]) {
        const lock = win[GLOBAL_LOCK_KEY] as { expiresAt: number };
        if (Date.now() > lock.expiresAt) {
          win[GLOBAL_LOCK_KEY] = null;
          forceStopAnimation();
          return;
        }
      }
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      if (DEBUG_M1U_PILL && progress < 1) {
        const now = Date.now();
        if (now - lastTickLogRef.current > 500) {
          lastTickLogRef.current = now;
          if (DEBUG_M1U_PILL) console.error(`[M1UPill][animateBalance:raf] id=${instanceIdRef.current} progress=${progress.toFixed(3)} elapsed=${Math.round(elapsed)}`);
        }
      }
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = Math.round(startValue + (difference * easeOutQuart));
      setDisplayedBalance(currentValue);
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        if (DEBUG_M1U_PILL) console.error(`[M1UPill][animateBalance:complete] id=${instanceIdRef.current} final=${endValue} progress>=1`);
        if (hardStopTimeoutRef.current) {
          clearTimeout(hardStopTimeoutRef.current);
          hardStopTimeoutRef.current = null;
        }
        setDisplayedBalance(endValue);
        setPrevBalance(endValue);
        setIsAnimating(false);
        setPulseAnimation(false);
        animationRef.current = null;
        animatingRef.current = false;
        animationTargetRef.current = null;
      }
    };
    animationRef.current = requestAnimationFrame(animate);
  }, [forceStopAnimation]);

  // Refetch with global throttle (single-flight + 1500ms) to avoid cascade from 2 pill instances
  const refetchWithThrottle = useCallback((reason: string) => {
    if (!win) {
      refetch();
      return;
    }
    let lock = win[GLOBAL_REFETCH_LOCK_KEY] as { lastRefetchAt: number; inflight: boolean } | undefined;
    if (!lock) {
      lock = { lastRefetchAt: 0, inflight: false };
      win[GLOBAL_REFETCH_LOCK_KEY] = lock;
    }
    const now = Date.now();
    if (now - lock.lastRefetchAt < REFETCH_THROTTLE_MS) {
      if (DEBUG_M1U_PILL) console.error(`[M1UPill][refetch:skip] id=${instanceIdRef.current} reason=${reason} lastRefetchAt=${lock.lastRefetchAt} willRefetch=false`);
      return;
    }
    if (lock.inflight) {
      if (DEBUG_M1U_PILL) console.error(`[M1UPill][refetch:skip] id=${instanceIdRef.current} reason=${reason} inflight=true willRefetch=false`);
      return;
    }
    if (DEBUG_M1U_PILL) console.error(`[M1UPill][refetch:call] id=${instanceIdRef.current} reason=${reason} lastRefetchAt=${lock.lastRefetchAt} willRefetch=true`);
    lock.inflight = true;
    refetch().finally(() => {
      if (win && win[GLOBAL_REFETCH_LOCK_KEY]) {
        win[GLOBAL_REFETCH_LOCK_KEY].inflight = false;
        win[GLOBAL_REFETCH_LOCK_KEY].lastRefetchAt = Date.now();
      }
    });
  }, [refetch]);

  useEffect(() => {
    const handleRefreshBalanceChanged = () => {
      if (DEBUG_M1U_PILL) {
        const creditKey = `balance|${Math.floor(Date.now() / 500)}`;
        console.error(`[M1UPill][m1u-balance-changed] id=${instanceIdRef.current} creditKey=${creditKey}`);
      }
      refetchWithThrottle('balanceChanged');
    };
    const handleRefreshBuzzArea = () => refetchWithThrottle('buzzAreaCreated');
    const handleRefreshBuzzClue = () => refetchWithThrottle('buzzClueCreated');

    const handleM1USpent = (event: CustomEvent) => {
      const amount = event.detail?.amount || 0;
      const newBalance = event.detail?.newBalance;
      if (!DEBUG_M1U_PILL) console.log('💸 M1UPill: M1U spent event!', { amount, newBalance });
      if (newBalance !== undefined) {
        setDisplayedBalance(newBalance);
        setPrevBalance(newBalance);
      }
      setTimeout(() => refetchWithThrottle('m1u-spent'), 300);
    };

    window.addEventListener('buzzAreaCreated', handleRefreshBuzzArea);
    window.addEventListener('buzzClueCreated', handleRefreshBuzzClue);
    window.addEventListener('m1u-spent', handleM1USpent as EventListener);
    window.addEventListener('m1u-balance-changed', handleRefreshBalanceChanged);
    return () => {
      window.removeEventListener('buzzAreaCreated', handleRefreshBuzzArea);
      window.removeEventListener('buzzClueCreated', handleRefreshBuzzClue);
      window.removeEventListener('m1u-spent', handleM1USpent as EventListener);
      window.removeEventListener('m1u-balance-changed', handleRefreshBalanceChanged);
    };
  }, [refetchWithThrottle]);

  // 🎉 Listen for M1U credited — baseline PRE→POST deterministic (targetBalance - amount); global lock: only ONE pill animates (fix2)
  const handleM1UCredited = useCallback(
    (event: Event) => {
      const amount = (event as CustomEvent).detail?.amount ?? 0;
      const now = Date.now();
      const rounded2s = Math.floor(now / CREDIT_LOCK_WINDOW_MS);
      const creditKey = `credited|${amount}|${rounded2s}`;
      const evTs = (event as CustomEvent).timeStamp ?? now;

      // FASE 1 forensics: at event start
      if (DEBUG_M1U_PILL) {
        const lock = win ? (win[GLOBAL_LOCK_KEY] as { creditKey: string; expiresAt: number } | undefined) : undefined;
        console.error(
          `[M1UPill][handleM1UCredited:start] instanceId=${instanceIdRef.current} amount=${amount} unitsDataBalance=${unitsData?.balance} displayedBalanceRef.current=${displayedBalanceRef.current} lock=${lock ? `creditKey=${lock.creditKey} expiresAt=${lock.expiresAt}` : 'none'}`
        );
      }
      if (amount <= 0) return;
      if (animatingRef.current) return;

      if (win) {
        let lock = win[GLOBAL_LOCK_KEY] as { creditKey: string; expiresAt: number } | undefined;
        if (lock && now >= lock.expiresAt) {
          win[GLOBAL_LOCK_KEY] = null;
          lock = undefined;
        }
        if (lock && lock.creditKey === creditKey && now < lock.expiresAt) {
          if (DEBUG_M1U_PILL) console.error(`[M1UPill][m1u-credited:skip] id=${instanceIdRef.current} creditKey=${creditKey} lock held by another`);
          return;
        }
        win[GLOBAL_LOCK_KEY] = { creditKey, expiresAt: now + HARD_STOP_MS + 800 };
      }

      lastCreditAtRef.current = now;

      // FASE 2: deterministic baseline PRE → POST (single source: m1u-credited)
      const targetBalance =
        typeof unitsData?.balance === 'number'
          ? unitsData.balance
          : typeof displayedBalanceRef.current === 'number'
            ? displayedBalanceRef.current
            : 0;
      const targetReason =
        typeof unitsData?.balance === 'number' ? 'targetFromUnitsData' : typeof displayedBalanceRef.current === 'number' ? 'targetFromDisplayed' : 'fallback';

      let fromBalance: number;
      let fromReason: string;
      if (typeof amount === 'number' && amount >= 0 && typeof targetBalance === 'number') {
        fromBalance = Math.max(0, targetBalance - amount);
        fromReason = 'fromComputedPre';
      } else if (typeof prevBalance === 'number') {
        fromBalance = prevBalance;
        fromReason = 'fromPrevBalance';
      } else {
        fromBalance = typeof displayedBalanceRef.current === 'number' ? displayedBalanceRef.current : 0;
        fromReason = 'fromDisplayed';
      }

      if (DEBUG_M1U_PILL) {
        console.error(
          `[M1UPill][handleM1UCredited:preAnim] computedFromBalance=${fromBalance} computedTargetBalance=${targetBalance} reason=${targetReason} fromReason=${fromReason}`
        );
      }

      // Sync UI to PRE (fromBalance) before animating so user sees pre-accredit then clean increment
      setDisplayedBalance(fromBalance);
      displayedBalanceRef.current = fromBalance;
      setPrevBalance(fromBalance);

      // Consume pending credit so sync effects can show POST again after TTL if needed (POST-FIRST FIX)
      const pending = readPendingCredit(win);
      if (pending && pending.amount === amount) clearPendingCredit(win);

      // Animate only if there is a real increment
      if (targetBalance <= fromBalance) {
        if (DEBUG_M1U_PILL) console.error(`[M1UPill][handleM1UCredited:skipAnim] targetBalance=${targetBalance} <= fromBalance=${fromBalance}`);
        setDisplayedBalance(targetBalance);
        setPrevBalance(targetBalance);
        displayedBalanceRef.current = targetBalance;
        setTimeout(() => refetchWithThrottle('credited'), 100);
        return;
      }

      setTimeout(() => refetchWithThrottle('credited'), 100);
      animateBalance(fromBalance, targetBalance, 2500);
    },
    [refetchWithThrottle, animateBalance, unitsData?.balance, prevBalance]
  );

  useEffect(() => {
    window.addEventListener('m1u-credited', handleM1UCredited);
    return () => window.removeEventListener('m1u-credited', handleM1UCredited);
  }, [handleM1UCredited]);

  // Initialize displayed balance when data loads — pending-aware: show PRE if shop credit pending (POST-FIRST FIX)
  useEffect(() => {
    if (unitsData?.balance === undefined || animatingRef.current) return;
    const pending = readPendingCredit(win);
    if (pending && typeof unitsData.balance === 'number') {
      const pre = Math.max(0, unitsData.balance - pending.amount);
      if (displayedBalance !== pre) {
        setDisplayedBalance(pre);
        setPrevBalance(pre);
      }
      return;
    }
    if (displayedBalance !== unitsData.balance) {
      console.log('💰 M1UPill: Syncing balance', { displayed: displayedBalance, actual: unitsData.balance });
      setDisplayedBalance(unitsData.balance);
    }
  }, [unitsData?.balance, isAnimating, displayedBalance]);

  // FIX2: Balance effect — pending-aware: show PRE if shop credit pending; else sync to unitsData (POST-FIRST FIX)
  useEffect(() => {
    if (animatingRef.current) return;
    if (unitsData?.balance === undefined) return;
    const pending = readPendingCredit(win);
    if (pending && typeof unitsData.balance === 'number') {
      const pre = Math.max(0, unitsData.balance - pending.amount);
      if (displayedBalance !== pre) {
        setDisplayedBalance(pre);
        setPrevBalance(pre);
      }
      return;
    }
    if (prevBalance === null) {
      if (DEBUG_M1U_PILL) console.error(`[M1UPill][balanceEffect] id=${instanceIdRef.current} prevBalance=null newBalance=${unitsData.balance} reason=init`);
      setPrevBalance(unitsData.balance);
      setDisplayedBalance(unitsData.balance);
      return;
    }
    if (unitsData.balance !== prevBalance) {
      if (DEBUG_M1U_PILL) console.error(`[M1UPill][balanceEffect] id=${instanceIdRef.current} prevBalance=${prevBalance} newBalance=${unitsData.balance} sync_only`);
      setDisplayedBalance(unitsData.balance);
      setPrevBalance(unitsData.balance);
    }
  }, [unitsData?.balance, prevBalance, displayedBalance]);
  
  // Cleanup animation and hard-stop timeout on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current != null) cancelAnimationFrame(animationRef.current);
      if (hardStopTimeoutRef.current != null) clearTimeout(hardStopTimeoutRef.current);
      animatingRef.current = false;
    };
  }, []);

  const balance = unitsData?.balance ?? 0;
  const lowBalance = balance < 100;

  const handleOpenRecharge = (e?: React.MouseEvent<HTMLElement>) => {
    buttonClickFeedback();
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
            // 🎨 DARK GLASS SEMI-TRASPARENTE - Testo bianco visibile
            background: 'rgba(10, 10, 15, 0.7)',
            border: '1px solid rgba(0, 209, 255, 0.2)',
            boxShadow:
              '0 4px 16px rgba(0, 0, 0, 0.4), 0 0 20px rgba(255, 215, 0, 0.15) inset, inset 0 1px 0 rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(16px) saturate(150%)',
            WebkitBackdropFilter: 'blur(16px) saturate(150%)',
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
                  <span 
                    className="text-sm font-semibold font-orbitron"
                    style={{ 
                      color: '#FFFFFF',
                      textShadow: '0 0 8px rgba(255, 255, 255, 0.3)'
                    }}
                  >M1U</span>
                )}
                <span 
                  className={`text-sm font-bold font-orbitron tracking-wide transition-all ${
                    isAnimating 
                      ? 'text-[#FFD700] scale-110 drop-shadow-[0_0_8px_rgba(255,215,0,0.8)]' 
                      : ''
                  }`}
                  style={{
                    color: isAnimating ? '#FFD700' : '#FFFFFF',
                    textShadow: isAnimating ? '0 0 10px rgba(255, 215, 0, 0.9)' : '0 0 6px rgba(255, 255, 255, 0.2)'
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
