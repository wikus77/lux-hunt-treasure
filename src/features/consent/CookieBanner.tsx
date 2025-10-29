// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Cookie } from 'lucide-react';

interface CookieBannerProps {
  isVisible: boolean;
  onAcceptAll: () => void;
  onRejectAll: () => void;
  onManagePreferences: () => void;
}

/**
 * Cookie Consent Banner - First-time display
 * 
 * Features:
 * - Shows only if no consent decision exists
 * - iOS/Safari safe-area aware
 * - Accessible (44x44 touch targets, aria-labels)
 * - Doesn't interfere with DNA Manager or other overlays
 */
export const CookieBanner: React.FC<CookieBannerProps> = ({
  isVisible,
  onAcceptAll,
  onRejectAll,
  onManagePreferences,
}) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="fixed bottom-0 left-0 right-0 z-[60] pb-safe"
          role="dialog"
          aria-labelledby="cookie-banner-title"
          aria-describedby="cookie-banner-description"
        >
          <div className="glass-card mx-4 mb-4 p-6 shadow-2xl border border-white/10">
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <Cookie className="w-6 h-6 text-primary" />
              </div>

              {/* Content */}
              <div className="flex-1 space-y-4">
                <div>
                  <h3 
                    id="cookie-banner-title"
                    className="text-lg font-bold text-foreground mb-2"
                  >
                    Cookie & Privacy
                  </h3>
                  <p 
                    id="cookie-banner-description"
                    className="text-sm text-muted-foreground leading-relaxed"
                  >
                    Utilizziamo cookie tecnici necessari per il funzionamento del sito e, con il tuo consenso, 
                    cookie di analisi e marketing per migliorare l'esperienza. 
                    Puoi modificare le tue preferenze in qualsiasi momento.
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={onAcceptAll}
                    className="min-h-[44px] touch-manipulation font-semibold"
                    aria-label="Accetta tutti i cookie"
                  >
                    Accetta tutto
                  </Button>
                  <Button
                    onClick={onRejectAll}
                    variant="outline"
                    className="min-h-[44px] touch-manipulation"
                    aria-label="Rifiuta cookie non necessari"
                  >
                    Rifiuta
                  </Button>
                  <Button
                    onClick={onManagePreferences}
                    variant="ghost"
                    className="min-h-[44px] touch-manipulation text-primary hover:text-primary/80"
                    aria-label="Gestisci preferenze cookie"
                  >
                    Gestisci preferenze
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
