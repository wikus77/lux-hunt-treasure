/**
 * PULSE BREAKER INFO POPUP
 * Appare dopo 2 minuti di navigazione per spiegare il Pulse Breaker
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Gamepad2, X, Zap, TrendingUp, Coins } from 'lucide-react';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { usePulseBreakerStore } from '@/stores/pulseBreakerStore';
import { useEntityOverlayStore } from '@/stores/entityOverlayStore';

const STORAGE_KEY = 'm1ssion_pulse_breaker_popup_dismissed';
const POPUP_DELAY_MS = 2 * 60 * 1000; // 2 minuti
const POPUP_ID = 'pulse-breaker';

export const PulseBreakerInfoPopup: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { isAuthenticated } = useUnifiedAuth();
  const { openPulseBreaker } = usePulseBreakerStore();
  const registerActivePopup = useEntityOverlayStore((s) => s.registerActivePopup);
  const unregisterActivePopup = useEntityOverlayStore((s) => s.unregisterActivePopup);

  // 🆕 v9: Registra/deregistra popup per bloccare Shadow
  useEffect(() => {
    if (isVisible) {
      registerActivePopup(POPUP_ID);
    } else {
      unregisterActivePopup(POPUP_ID);
    }
    return () => {
      unregisterActivePopup(POPUP_ID);
    };
  }, [isVisible, registerActivePopup, unregisterActivePopup]);

  // Check if popup should show (with queue management)
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (dismissed === 'true') {
      console.log('[PulseBreakerPopup] 🎮 Popup dismissed by user.');
      return;
    }

    console.log('[PulseBreakerPopup] 🎮 Popup will show in 2 minutes...');
    
    const timer = setTimeout(() => {
      console.log('[PulseBreakerPopup] ✅ Showing popup NOW!');
      setIsVisible(true);
    }, POPUP_DELAY_MS);

    return () => clearTimeout(timer);
  }, [isAuthenticated]);

  const handleDismiss = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setIsVisible(false);
    console.log('[PulseBreakerPopup] Popup dismissed permanently.');
  }, []);

  const handleOpenGame = useCallback(() => {
    setIsVisible(false);
    // Piccolo delay per permettere al popup di chiudersi
    setTimeout(() => {
      openPulseBreaker();
    }, 300);
  }, [openPulseBreaker]);

  if (!isVisible) return null;

  return createPortal(
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-[10003] flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 50 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="w-full max-w-md"
          >
            <Card className="bg-gradient-to-br from-purple-900/90 via-gray-900/90 to-black/90 border-purple-500/40 shadow-2xl">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-white text-lg">
                  <div className="flex items-center gap-2">
                    <Gamepad2 className="w-6 h-6 text-purple-400" />
                    PULSE BREAKER™
                  </div>
                  <Button variant="ghost" size="sm" onClick={handleDismiss} className="text-white/70 hover:text-white">
                    <X className="w-4 h-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-300">
                  🎰 <strong>Pulse Breaker</strong> è il mini-game crash dove puoi moltiplicare i tuoi M1U o Pulse Energy!
                </p>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <Coins className="w-4 h-4 text-yellow-400" />
                    <span>Scommetti M1U o Pulse Energy</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    <span>Il moltiplicatore sale... ma può crashare!</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <Zap className="w-4 h-4 text-cyan-400" />
                    <span>Cash out prima del crash per vincere</span>
                  </div>
                </div>

                <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
                  <p className="text-xs text-purple-300 text-center">
                    ⚠️ Gioca responsabilmente. Questo è un gioco d'azzardo simulato.
                  </p>
                </div>

                <Button
                  onClick={handleOpenGame}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold py-3 rounded-lg shadow-lg hover:from-purple-600 hover:to-pink-700 transition-all duration-200"
                >
                  <Gamepad2 className="h-5 w-5 mr-2" />
                  🎮 GIOCA ORA
                </Button>
                
                <Button
                  onClick={handleDismiss}
                  variant="ghost"
                  className="w-full text-gray-400 hover:text-white"
                >
                  Non mostrare più
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

