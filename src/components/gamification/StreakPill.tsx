/**
 * STREAK PILL™ - Glassmorphism Design with Animated Fire Orb
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/auth';
import { StreakModal } from './StreakModal';
import '@/features/m1u/m1u-ui.css';

interface StreakPillProps {
  className?: string;
  showLabel?: boolean;
}

const StreakPill: React.FC<StreakPillProps> = ({ className = '', showLabel = true }) => {
  const { user, isLoading: authLoading } = useAuthContext();
  const [streak, setStreak] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [pulseAnimation, setPulseAnimation] = useState(false);
  const [canCheckIn, setCanCheckIn] = useState(true);
  const hasLoadedRef = useRef(false);

  // 🔥 FIX: Load data when user becomes available (handles race condition)
  useEffect(() => {
    // Skip if auth is still loading
    if (authLoading) {
      console.log('[StreakPill] Waiting for auth...');
      return;
    }
    
    if (user) {
      console.log('[StreakPill] User available, loading data...');
      loadStreakData();
      hasLoadedRef.current = true;
    } else if (!authLoading) {
      // Auth finished but no user - stop loading state
      setIsLoading(false);
    }
  }, [user, authLoading]);

  const loadStreakData = async (retryCount = 0) => {
    if (!user) return;
    setIsLoading(true);
    setError(false); // Reset error state before attempting
    
    try {
      const { data, error: queryError } = await supabase
        .from('profiles')
        .select('current_streak_days, last_check_in_date')
        .eq('id', user.id)
        .single();

      if (queryError) {
        throw queryError;
      }

      if (data) {
        setStreak(data.current_streak_days || 0);
        const today = new Date().toISOString().split('T')[0];
        setCanCheckIn(data.last_check_in_date !== today);
        console.log('[StreakPill] Data loaded successfully:', { 
          streak: data.current_streak_days, 
          canCheckIn: data.last_check_in_date !== today 
        });
      } else {
        // No data found - use defaults
        console.warn('[StreakPill] No profile data found, using defaults');
        setStreak(0);
        setCanCheckIn(true);
      }
    } catch (err) {
      console.error('[StreakPill] Error loading streak data:', err);
      
      // Retry logic - up to 3 attempts with exponential backoff
      if (retryCount < 3) {
        const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
        console.log(`[StreakPill] Retrying in ${delay}ms (attempt ${retryCount + 1}/3)`);
        setTimeout(() => loadStreakData(retryCount + 1), delay);
        return; // Don't set error yet, still retrying
      }
      
      // All retries failed - set error but also provide defaults
      setError(true);
      setStreak(0); // Default to 0 so UI still shows something
      setCanCheckIn(true); // Assume they can check in
    } finally {
      if (retryCount >= 3 || !error) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    const handleUpdate = () => {
      setPulseAnimation(true);
      loadStreakData();
      setTimeout(() => setPulseAnimation(false), 1000);
    };
    window.addEventListener('streak-updated', handleUpdate);
    return () => window.removeEventListener('streak-updated', handleUpdate);
  }, []);

  const getFireColor = () => {
    if (streak >= 30) return { from: '#9B59B6', to: '#8E44AD', glow: 'rgba(155,89,182,0.6)' };
    if (streak >= 15) return { from: '#FFD700', to: '#FFA500', glow: 'rgba(255,215,0,0.6)' };
    if (streak >= 5) return { from: '#FF6B35', to: '#FF4500', glow: 'rgba(255,107,53,0.6)' };
    return { from: '#FF4757', to: '#FF6B81', glow: 'rgba(255,71,87,0.5)' };
  };

  const fireColor = getFireColor();

  return (
    <>
      <div className={`flex items-center gap-3 relative ${className}`}>
        <motion.div
          className="flex items-center gap-2 px-4 py-2 rounded-full cursor-pointer"
          style={{
            background: 'radial-gradient(120% 120% at 50% 10%, rgba(255,255,255,.08), rgba(0,0,0,.2) 58%)',
            border: '1px solid rgba(255,255,255,0.18)',
            boxShadow: `0 2px 12px rgba(0,0,0,.35), 0 0 20px ${fireColor.glow} inset`,
            backdropFilter: 'blur(12px)',
            minHeight: 40,
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowModal(true)}
          animate={pulseAnimation ? { scale: [1, 1.05, 1] } : {}}
        >
          <motion.div
            className="w-5 h-5 rounded-full flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${fireColor.from}, ${fireColor.to})`,
              boxShadow: `0 0 8px ${fireColor.glow}`,
            }}
            animate={canCheckIn ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 1, repeat: canCheckIn ? Infinity : 0, repeatDelay: 2 }}
          >
            <Flame className="w-3 h-3 text-white" />
          </motion.div>

          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div key="loading" className="animate-pulse text-sm font-orbitron text-white/60">…</motion.div>
            ) : error ? (
              <motion.div key="error" className="flex items-center gap-1 text-sm text-red-500">
                <AlertCircle className="w-3 h-3" /> ERR
              </motion.div>
            ) : (
              <motion.div key="streak" className="flex items-center gap-1.5" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {showLabel && <span className="text-sm font-semibold text-white/90 font-orbitron">STREAK</span>}
                <span className={`text-sm font-bold font-orbitron ${pulseAnimation ? 'text-orange-400' : 'text-white'}`}>
                  {streak}
                </span>
                <span className="text-xs text-white/60">d</span>
              </motion.div>
            )}
          </AnimatePresence>

          {canCheckIn && !isLoading && (
            <motion.div
              className="absolute -top-1 -right-1 w-3 h-3 rounded-full"
              style={{ background: 'linear-gradient(135deg, #00D1FF, #00FF88)', boxShadow: '0 0 8px rgba(0,209,255,0.8)' }}
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          )}
        </motion.div>
        {/* Pill-orb rotondo RIMOSSO - solo pill STREAK rimane */}
      </div>

      <StreakModal 
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onCheckInComplete={() => {
          loadStreakData();
          window.dispatchEvent(new CustomEvent('streak-updated'));
        }}
      />
    </>
  );
};

export default StreakPill;
