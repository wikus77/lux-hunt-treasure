/**
 * M1SSION™ Motivational Popup System
 * Shows contextual motivational messages when entering pages
 * GREEN GLASS STYLE - AAA Game Feel
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, Map, Zap, Brain, Trophy, MessageCircle, Home, Target } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { playSound } from './audioFeedback';

// 🎯 i18n keys for motivational messages (TFunction applied at render)
const MESSAGE_KEYS = {
  map: [
    { titleKey: 'motivation_map_0_title', descKey: 'motivation_map_0_desc' },
    { titleKey: 'motivation_map_1_title', descKey: 'motivation_map_1_desc' },
    { titleKey: 'motivation_map_2_title', descKey: 'motivation_map_2_desc' },
    { titleKey: 'motivation_map_3_title', descKey: 'motivation_map_3_desc' },
    { titleKey: 'motivation_map_4_title', descKey: 'motivation_map_4_desc' },
    { titleKey: 'motivation_map_5_title', descKey: 'motivation_map_5_desc' },
    { titleKey: 'motivation_map_6_title', descKey: 'motivation_map_6_desc' },
    { titleKey: 'motivation_map_7_title', descKey: 'motivation_map_7_desc' },
    { titleKey: 'motivation_map_8_title', descKey: 'motivation_map_8_desc' },
    { titleKey: 'motivation_map_9_title', descKey: 'motivation_map_9_desc' },
    { titleKey: 'motivation_map_10_title', descKey: 'motivation_map_10_desc' },
    { titleKey: 'motivation_map_11_title', descKey: 'motivation_map_11_desc' },
    { titleKey: 'motivation_map_12_title', descKey: 'motivation_map_12_desc' },
    { titleKey: 'motivation_map_13_title', descKey: 'motivation_map_13_desc' },
    { titleKey: 'motivation_map_14_title', descKey: 'motivation_map_14_desc' },
    { titleKey: 'motivation_map_15_title', descKey: 'motivation_map_15_desc' },
    { titleKey: 'motivation_map_16_title', descKey: 'motivation_map_16_desc' },
    { titleKey: 'motivation_map_17_title', descKey: 'motivation_map_17_desc' },
    { titleKey: 'motivation_map_18_title', descKey: 'motivation_map_18_desc' },
    { titleKey: 'motivation_map_19_title', descKey: 'motivation_map_19_desc' },
  ],
  buzz: [
    { titleKey: 'motivation_buzz_0_title', descKey: 'motivation_buzz_0_desc' },
    { titleKey: 'motivation_buzz_1_title', descKey: 'motivation_buzz_1_desc' },
    { titleKey: 'motivation_buzz_2_title', descKey: 'motivation_buzz_2_desc' },
    { titleKey: 'motivation_buzz_3_title', descKey: 'motivation_buzz_3_desc' },
    { titleKey: 'motivation_buzz_4_title', descKey: 'motivation_buzz_4_desc' },
    { titleKey: 'motivation_buzz_5_title', descKey: 'motivation_buzz_5_desc' },
    { titleKey: 'motivation_buzz_6_title', descKey: 'motivation_buzz_6_desc' },
    { titleKey: 'motivation_buzz_7_title', descKey: 'motivation_buzz_7_desc' },
    { titleKey: 'motivation_buzz_8_title', descKey: 'motivation_buzz_8_desc' },
    { titleKey: 'motivation_buzz_9_title', descKey: 'motivation_buzz_9_desc' },
    { titleKey: 'motivation_buzz_10_title', descKey: 'motivation_buzz_10_desc' },
    { titleKey: 'motivation_buzz_11_title', descKey: 'motivation_buzz_11_desc' },
    { titleKey: 'motivation_buzz_12_title', descKey: 'motivation_buzz_12_desc' },
    { titleKey: 'motivation_buzz_13_title', descKey: 'motivation_buzz_13_desc' },
    { titleKey: 'motivation_buzz_14_title', descKey: 'motivation_buzz_14_desc' },
  ],
  aion: [
    { titleKey: 'motivation_aion_0_title', descKey: 'motivation_aion_0_desc' },
    { titleKey: 'motivation_aion_1_title', descKey: 'motivation_aion_1_desc' },
    { titleKey: 'motivation_aion_2_title', descKey: 'motivation_aion_2_desc' },
    { titleKey: 'motivation_aion_3_title', descKey: 'motivation_aion_3_desc' },
    { titleKey: 'motivation_aion_4_title', descKey: 'motivation_aion_4_desc' },
    { titleKey: 'motivation_aion_5_title', descKey: 'motivation_aion_5_desc' },
    { titleKey: 'motivation_aion_6_title', descKey: 'motivation_aion_6_desc' },
    { titleKey: 'motivation_aion_7_title', descKey: 'motivation_aion_7_desc' },
    { titleKey: 'motivation_aion_8_title', descKey: 'motivation_aion_8_desc' },
    { titleKey: 'motivation_aion_9_title', descKey: 'motivation_aion_9_desc' },
  ],
  leaderboard: [
    { titleKey: 'motivation_leaderboard_0_title', descKey: 'motivation_leaderboard_0_desc' },
    { titleKey: 'motivation_leaderboard_1_title', descKey: 'motivation_leaderboard_1_desc' },
    { titleKey: 'motivation_leaderboard_2_title', descKey: 'motivation_leaderboard_2_desc' },
    { titleKey: 'motivation_leaderboard_3_title', descKey: 'motivation_leaderboard_3_desc' },
    { titleKey: 'motivation_leaderboard_4_title', descKey: 'motivation_leaderboard_4_desc' },
    { titleKey: 'motivation_leaderboard_5_title', descKey: 'motivation_leaderboard_5_desc' },
    { titleKey: 'motivation_leaderboard_6_title', descKey: 'motivation_leaderboard_6_desc' },
    { titleKey: 'motivation_leaderboard_7_title', descKey: 'motivation_leaderboard_7_desc' },
    { titleKey: 'motivation_leaderboard_8_title', descKey: 'motivation_leaderboard_8_desc' },
    { titleKey: 'motivation_leaderboard_9_title', descKey: 'motivation_leaderboard_9_desc' },
  ],
  home: [
    { titleKey: 'motivation_home_0_title', descKey: 'motivation_home_0_desc' },
    { titleKey: 'motivation_home_1_title', descKey: 'motivation_home_1_desc' },
    { titleKey: 'motivation_home_2_title', descKey: 'motivation_home_2_desc' },
    { titleKey: 'motivation_home_3_title', descKey: 'motivation_home_3_desc' },
    { titleKey: 'motivation_home_4_title', descKey: 'motivation_home_4_desc' },
    { titleKey: 'motivation_home_5_title', descKey: 'motivation_home_5_desc' },
    { titleKey: 'motivation_home_6_title', descKey: 'motivation_home_6_desc' },
    { titleKey: 'motivation_home_7_title', descKey: 'motivation_home_7_desc' },
    { titleKey: 'motivation_home_8_title', descKey: 'motivation_home_8_desc' },
    { titleKey: 'motivation_home_9_title', descKey: 'motivation_home_9_desc' },
  ],
  forum: [
    { titleKey: 'motivation_forum_0_title', descKey: 'motivation_forum_0_desc' },
    { titleKey: 'motivation_forum_1_title', descKey: 'motivation_forum_1_desc' },
    { titleKey: 'motivation_forum_2_title', descKey: 'motivation_forum_2_desc' },
    { titleKey: 'motivation_forum_3_title', descKey: 'motivation_forum_3_desc' },
    { titleKey: 'motivation_forum_4_title', descKey: 'motivation_forum_4_desc' },
    { titleKey: 'motivation_forum_5_title', descKey: 'motivation_forum_5_desc' },
    { titleKey: 'motivation_forum_6_title', descKey: 'motivation_forum_6_desc' },
    { titleKey: 'motivation_forum_7_title', descKey: 'motivation_forum_7_desc' },
  ],
};

type PageType = keyof typeof MESSAGE_KEYS;

interface MotivationalPopupProps {
  pageType: PageType;
  showOnce?: boolean; // Show only once per session
  delay?: number; // Delay before showing
}

// Track shown popups per session
const shownPopups = new Set<string>();

// 🔧 FIX 13/02/2026: Throttle globale - max 1 banner ogni 5 min (evita spam su navigazione)
const THROTTLE_MS = 5 * 60 * 1000; // 5 minuti
const STORAGE_KEY = 'motivational_last_shown';

function canShowByThrottle(): boolean {
  try {
    const last = sessionStorage.getItem(STORAGE_KEY);
    if (!last) return true;
    const lastTs = parseInt(last, 10);
    return Date.now() - lastTs >= THROTTLE_MS;
  } catch {
    return true;
  }
}

function markShown(): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, String(Date.now()));
  } catch {
    /* ignore */
  }
}

export const MotivationalPopup: React.FC<MotivationalPopupProps> = ({
  pageType,
  showOnce = true,
  delay = 500,
}) => {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);
  const [message, setMessage] = useState<{ titleKey: string; descKey: string } | null>(null);

  useEffect(() => {
    const key = `motivational_${pageType}`;

    // 🔧 Throttle: non mostrare se ne abbiamo mostrato uno negli ultimi 5 min
    if (!canShowByThrottle()) {
      return;
    }

    // Check if already shown this session (per page type)
    if (showOnce && shownPopups.has(key)) {
      return;
    }

    // Get random message keys
    const pageMessages = MESSAGE_KEYS[pageType];
    const randomIndex = Math.floor(Math.random() * pageMessages.length);
    setMessage(pageMessages[randomIndex]);

    // Show after delay
    const timer = setTimeout(() => {
      setIsVisible(true);
      shownPopups.add(key);
      markShown();
      playSound('confirm');
    }, delay);

    return () => clearTimeout(timer);
  }, [pageType, showOnce, delay]);

  const handleClose = useCallback(() => {
    setIsVisible(false);
  }, []);

  // 🆕 FIX 16/01/2026: Handle swipe up to dismiss (MUST be before early return!)
  const handleDragEnd = useCallback((_: any, info: { offset: { y: number }; velocity: { y: number } }) => {
    // Se l'utente fa swipe verso l'alto (y negativo) con velocità o distanza sufficiente
    if (info.offset.y < -50 || info.velocity.y < -300) {
      setIsVisible(false);
    }
  }, []);

  // Auto-dismiss after 5 seconds
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  const getIcon = () => {
    switch (pageType) {
      case 'map': return <Map className="w-8 h-8" />;
      case 'buzz': return <Zap className="w-8 h-8" />;
      case 'aion': return <Brain className="w-8 h-8" />;
      case 'leaderboard': return <Trophy className="w-8 h-8" />;
      case 'home': return <Home className="w-8 h-8" />;
      case 'forum': return <MessageCircle className="w-8 h-8" />;
      default: return <Target className="w-8 h-8" />;
    }
  };

  if (!message || typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isVisible && (
        <>
          {/* 🆕 FIX 16/01/2026: Sfondo semi-trasparente (opzionale, tap per chiudere) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10001]"
            style={{ background: 'rgba(0,0,0,0.3)' }}
            onClick={handleClose}
          />
          
          {/* 🆕 FIX 16/01/2026: Container che scende dall'alto con swipe up */}
          {/* 🔧 FIX 22/01/2026 v2: Full width responsive, compromesso bilanciato */}
          <motion.div
            initial={{ y: '-100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '-100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            drag="y"
            dragConstraints={{ top: -150, bottom: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            className="fixed top-0 left-0 right-0 z-[10002]"
            style={{ touchAction: 'none' }}
          >
            <div 
              className="mx-3 mt-2 rounded-2xl overflow-hidden relative"
              style={{
                background: 'linear-gradient(145deg, rgba(0, 40, 40, 0.98), rgba(0, 60, 60, 0.95))',
                border: '2px solid rgba(0, 255, 136, 0.5)',
                boxShadow: '0 0 50px rgba(0, 255, 136, 0.35), 0 10px 30px rgba(0, 0, 0, 0.7)',
              }}
            >
              {/* Ambient glow */}
              <div 
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'radial-gradient(ellipse at 50% 0%, rgba(0, 255, 136, 0.22) 0%, transparent 60%)',
                }}
              />

              {/* Swipe indicator (drag handle) */}
              <div className="flex justify-center pt-3 pb-2">
                <div 
                  className="w-12 h-1.5 rounded-full"
                  style={{ background: 'rgba(255,255,255,0.35)' }}
                />
              </div>

              {/* Content - 🔧 FIX 22/01/2026 v2: Bilanciato (full width, testi medi) */}
              <div className="relative px-4 pb-5 pt-1">
                <div className="flex items-start gap-3">
                  {/* Icon - dimensione media */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.1 }}
                    className="w-11 h-11 rounded-xl flex-shrink-0 flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(135deg, #00FF88 0%, #00D1FF 100%)',
                      boxShadow: '0 4px 16px rgba(0, 255, 136, 0.45)',
                    }}
                  >
                    <span className="text-black scale-90">{getIcon()}</span>
                  </motion.div>

                  {/* Text content - testi medi, leggibili */}
                  <div className="flex-1 pr-1">
                    <motion.h2
                      initial={{ y: 8, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.15 }}
                      className="text-lg font-bold leading-tight"
                      style={{
                        color: '#00FF88',
                        textShadow: '0 0 15px rgba(0, 255, 136, 0.55)',
                      }}
                    >
                      {t(message.titleKey)}
                    </motion.h2>

                    <motion.p
                      initial={{ y: 8, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="text-white/90 text-sm mt-1.5 leading-relaxed"
                    >
                      {t(message.descKey)}
                    </motion.p>
                  </div>
                </div>

                {/* Progress bar for auto-dismiss */}
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-1.5 rounded-b-2xl overflow-hidden"
                  style={{ background: 'rgba(0, 255, 136, 0.2)' }}
                >
                  <motion.div
                    initial={{ scaleX: 1 }}
                    animate={{ scaleX: 0 }}
                    transition={{ duration: 5, ease: 'linear' }}
                    className="h-full origin-left"
                    style={{ background: '#00FF88' }}
                  />
                </motion.div>
              </div>
            </div>

            {/* Swipe hint text */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.45 }}
              transition={{ delay: 1 }}
              className="text-center text-white/35 text-[11px] mt-1.5"
            >
              {t('motivation_swipe_hint')}
            </motion.p>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default MotivationalPopup;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

