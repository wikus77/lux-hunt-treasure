/**
 * M1SSION™ Shop Pill
 * Il centro acquisti dell'app: Scratch & Win, Gira la Ruota, Lotteria
 * 
 * Sostituisce il vecchio FortuneWheelPill con un sistema più completo
 * 
 * © 2026 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import React, { useState, useEffect, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Sparkles } from 'lucide-react';
import { SectionErrorBoundary } from '@/components/error/SectionErrorBoundary';

// Lazy load ShopModal per ridurre memory footprint iniziale
const ShopModal = lazy(() => import('@/components/shop/ShopModal'));

const WHEEL_STORAGE_KEY = 'm1_fortune_wheel_last_spin';
const SCRATCH_STORAGE_KEY = 'm1_scratch_last_purchase';

export const ShopPill: React.FC = () => {
  const [showShop, setShowShop] = useState(false);
  const [hasNotification, setHasNotification] = useState(false);

  // Check if user has pending actions (wheel spin available, etc.)
  useEffect(() => {
    const checkNotifications = () => {
      // Check wheel availability
      const lastSpin = localStorage.getItem(WHEEL_STORAGE_KEY);
      const canSpin = !lastSpin || new Date(lastSpin).toDateString() !== new Date().toDateString();
      
      setHasNotification(canSpin);
    };

    checkNotifications();
    
    // Listen for storage changes
    window.addEventListener('storage', checkNotifications);
    window.addEventListener('wheel-spun', checkNotifications);
    
    return () => {
      window.removeEventListener('storage', checkNotifications);
      window.removeEventListener('wheel-spun', checkNotifications);
    };
  }, []);

  return (
    <>
      <motion.button
        onClick={() => setShowShop(true)}
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
          {hasNotification && (
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

      {/* Shop Modal */}
      <SectionErrorBoundary section="Shop" fallbackHeight="0px" showRetry={false}>
        <Suspense fallback={null}>
          <ShopModal 
            isOpen={showShop} 
            onClose={() => {
              setShowShop(false);
              // Recheck notifications after closing
              const lastSpin = localStorage.getItem(WHEEL_STORAGE_KEY);
              const canSpin = !lastSpin || new Date(lastSpin).toDateString() !== new Date().toDateString();
              setHasNotification(canSpin);
            }} 
          />
        </Suspense>
      </SectionErrorBoundary>
    </>
  );
};

export default ShopPill;

// © 2026 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
