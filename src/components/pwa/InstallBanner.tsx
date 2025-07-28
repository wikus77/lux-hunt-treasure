// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Custom Install Banner for iOS and PWA

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share, Plus, X, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const InstallBanner: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Detect iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Detect standalone mode
    const standalone = window.matchMedia('(display-mode: standalone)').matches ||
                      (window.navigator as any).standalone === true;
    setIsStandalone(standalone);

    // Check if banner was previously dismissed
    const dismissed = localStorage.getItem('installBannerDismissed');
    const dismissedTime = dismissed ? parseInt(dismissed) : 0;
    const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);

    // Show banner if not dismissed recently and not in standalone mode
    if (!standalone && (!dismissed || dismissedTime < oneWeekAgo)) {
      setTimeout(() => setShowBanner(true), 3000); // Show after 3 seconds
    }

    // Handle PWA install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      if (!dismissed || dismissedTime < oneWeekAgo) {
        setShowBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('PWA installed');
      }
      
      setDeferredPrompt(null);
      setShowBanner(false);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('installBannerDismissed', Date.now().toString());
  };

  if (isStandalone || !showBanner) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        className="fixed bottom-4 left-4 right-4 z-50 max-w-sm mx-auto"
      >
        <div className="bg-gradient-to-r from-gray-900 to-black border border-cyan-400/30 rounded-xl p-4 shadow-2xl backdrop-blur-sm">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <Smartphone className="w-5 h-5 text-white" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-semibold text-sm mb-1">
                Installa M1SSION™
              </h3>
              
              {isIOS ? (
                <div className="text-gray-300 text-xs space-y-2">
                  <p>Aggiungi alla schermata Home per un'esperienza migliore:</p>
                  <div className="flex items-center gap-1 text-cyan-400">
                    <Share className="w-3 h-3" />
                    <span>Tocca</span>
                    <Plus className="w-3 h-3" />
                    <span>"Aggiungi alla schermata Home"</span>
                  </div>
                </div>
              ) : (
                <p className="text-gray-300 text-xs mb-3">
                  Installa l'app per un accesso rapido e funzioni offline.
                </p>
              )}
            </div>
            
            <button
              onClick={handleDismiss}
              className="text-gray-400 hover:text-white transition-colors"
              aria-label="Chiudi banner installazione"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          {!isIOS && deferredPrompt && (
            <div className="mt-3 flex gap-2">
              <Button
                onClick={handleInstall}
                size="sm"
                className="flex-1 text-xs"
              >
                Installa App
              </Button>
              <Button
                onClick={handleDismiss}
                variant="outline"
                size="sm"
                className="text-xs"
              >
                Non ora
              </Button>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};