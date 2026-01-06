/**
 * M1SSION™ Fortune Wheel Pill
 * Shows once daily to encourage users to spin the wheel
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Sparkles } from 'lucide-react';
import { FortuneWheel } from '@/components/feedback';

const STORAGE_KEY = 'm1_fortune_wheel_last_spin';

export const FortuneWheelPill: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showWheel, setShowWheel] = useState(false);

  // Check if user can spin today
  useEffect(() => {
    const lastSpin = localStorage.getItem(STORAGE_KEY);
    if (lastSpin) {
      const lastSpinDate = new Date(lastSpin).toDateString();
      const today = new Date().toDateString();
      setIsVisible(lastSpinDate !== today);
    } else {
      setIsVisible(true);
    }
  }, []);

  // Listen for wheel close to update visibility
  useEffect(() => {
    const checkVisibility = () => {
      const lastSpin = localStorage.getItem(STORAGE_KEY);
      if (lastSpin) {
        const lastSpinDate = new Date(lastSpin).toDateString();
        const today = new Date().toDateString();
        setIsVisible(lastSpinDate !== today);
      }
    };
    
    window.addEventListener('storage', checkVisibility);
    return () => window.removeEventListener('storage', checkVisibility);
  }, []);

  if (!isVisible) return null;

  return (
    <>
      <motion.button
        onClick={() => setShowWheel(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-full cursor-pointer"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 165, 0, 0.15))',
          border: '1px solid rgba(255, 215, 0, 0.4)',
          boxShadow: '0 2px 12px rgba(255, 215, 0, 0.3), inset 0 0 20px rgba(255, 215, 0, 0.1)',
          backdropFilter: 'blur(12px)',
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        {/* Animated sparkle */}
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        >
          <Gift className="w-5 h-5 text-yellow-400" />
        </motion.div>
        
        <span className="text-sm font-bold text-yellow-400">GIRA & VINCI</span>
        
        {/* Pulse indicator */}
        <motion.div
          className="w-2 h-2 rounded-full bg-yellow-400"
          animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      </motion.button>

      <FortuneWheel 
        isOpen={showWheel} 
        onClose={() => {
          setShowWheel(false);
          // Recheck visibility after closing
          const lastSpin = localStorage.getItem(STORAGE_KEY);
          if (lastSpin) {
            const lastSpinDate = new Date(lastSpin).toDateString();
            const today = new Date().toDateString();
            setIsVisible(lastSpinDate !== today);
          }
        }} 
      />
    </>
  );
};

export default FortuneWheelPill;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

