/**
 * M1SSION™ Shop Pill - FULLSCREEN REVOLUT STYLE
 * Il centro acquisti dell'app: Scratch & Win, Gira la Ruota, Lotteria
 * 
 * © 2026 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Sparkles, Trophy } from 'lucide-react';
import { SectionErrorBoundary } from '@/components/error/SectionErrorBoundary';
import { supabase } from '@/integrations/supabase/client';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { ShopFlipOverlay } from '@/components/shop/ShopFlipOverlay';
import { ShopContent } from '@/components/shop/ShopContent';
import { buttonClickFeedback } from '@/utils/buttonClickFeedback';

const WHEEL_STORAGE_KEY = 'm1_fortune_wheel_last_spin';

export const ShopPill: React.FC = () => {
  const { user } = useUnifiedAuth();
  const [showShop, setShowShop] = useState(false);
  const [originRect, setOriginRect] = useState<DOMRect | null>(null);
  const [hasNotification, setHasNotification] = useState(false);
  const [hasPendingWins, setHasPendingWins] = useState(false);

  // Check if user has pending actions (wheel spin available, lottery wins, etc.)
  useEffect(() => {
    const checkNotifications = async () => {
      // Check wheel availability
      const lastSpin = localStorage.getItem(WHEEL_STORAGE_KEY);
      const canSpin = !lastSpin || new Date(lastSpin).toDateString() !== new Date().toDateString();
      
      // Check lottery pending wins
      let pendingWins = false;
      if (user) {
        try {
          const { data } = await supabase.rpc('get_my_lottery_wins');
          if (data?.wins) {
            pendingWins = data.wins.some((w: any) => w.claim_status === 'pending');
          }
        } catch (err) {
          console.error('Failed to check lottery wins:', err);
        }
      }
      
      setHasPendingWins(pendingWins);
      setHasNotification(canSpin || pendingWins);
    };

    checkNotifications();
    
    // Listen for storage changes
    window.addEventListener('storage', checkNotifications);
    window.addEventListener('wheel-spun', checkNotifications);
    window.addEventListener('lottery-prize-claimed', checkNotifications);
    
    return () => {
      window.removeEventListener('storage', checkNotifications);
      window.removeEventListener('wheel-spun', checkNotifications);
      window.removeEventListener('lottery-prize-claimed', checkNotifications);
    };
  }, [user]);

  const handleOpenShop = (e: React.MouseEvent<HTMLButtonElement>) => {
    buttonClickFeedback();
    setOriginRect(e.currentTarget.getBoundingClientRect());
    setShowShop(true);
  };

  const handleCloseShop = () => {
    setShowShop(false);
    // Recheck notifications after closing
    const lastSpin = localStorage.getItem(WHEEL_STORAGE_KEY);
    const canSpin = !lastSpin || new Date(lastSpin).toDateString() !== new Date().toDateString();
    setHasNotification(canSpin);
  };

  return (
    <>
      <motion.button
        onClick={handleOpenShop}
        className="flex items-center gap-2 px-4 py-2 rounded-full cursor-pointer relative"
        style={{
          background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.25), rgba(236, 72, 153, 0.2))',
          border: '1px solid rgba(147, 51, 234, 0.5)',
          boxShadow: '0 2px 16px rgba(147, 51, 234, 0.4), inset 0 0 24px rgba(236, 72, 153, 0.15)',
          backdropFilter: 'blur(12px)',
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        {/* Animated icon */}
        <motion.div
          animate={{ rotate: [0, -10, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ShoppingBag className="w-5 h-5 text-purple-400" />
        </motion.div>
        
        <span className="text-sm font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          SHOP
        </span>
        
        {/* Sparkle effect */}
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <Sparkles className="w-4 h-4 text-pink-400" />
        </motion.div>

        {/* Notification badge */}
        <AnimatePresence>
          {hasPendingWins ? (
            /* Gold badge for lottery wins */
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 flex items-center justify-center"
              style={{ boxShadow: '0 0 12px rgba(255, 215, 0, 0.9)' }}
            >
              <Trophy className="w-3 h-3 text-white" />
              <motion.div
                className="absolute inset-0 rounded-full bg-yellow-400"
                animate={{ scale: [1, 1.8, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              />
            </motion.div>
          ) : hasNotification && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500"
              style={{ boxShadow: '0 0 8px rgba(255, 215, 0, 0.8)' }}
            >
              <motion.div
                className="absolute inset-0 rounded-full bg-yellow-400"
                animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Shop Modal - FULLSCREEN REVOLUT STYLE */}
      <SectionErrorBoundary section="Shop" fallbackHeight="0px" showRetry={false}>
        <ShopFlipOverlay
          open={showShop}
          originRect={originRect}
          onClose={handleCloseShop}
        >
          <ShopContent onClose={handleCloseShop} />
        </ShopFlipOverlay>
      </SectionErrorBoundary>
    </>
  );
};

export default ShopPill;

// © 2026 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
