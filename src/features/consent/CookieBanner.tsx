// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import React from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
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
 * - Localized IT/EN via i18next
 * - Doesn't interfere with DNA Manager or other overlays
 */
export const CookieBanner: React.FC<CookieBannerProps> = ({
  isVisible,
  onAcceptAll,
  onRejectAll,
  onManagePreferences,
}) => {
  const { t } = useTranslation();

  return createPortal(
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="fixed bottom-0 left-0 right-0 z-[10001] pb-safe"
          role="dialog"
          aria-labelledby="cookie-banner-title"
          aria-describedby="cookie-banner-description"
        >
          <div 
            className="relative mx-4 mb-4 p-6 shadow-2xl overflow-hidden rounded-[24px]"
            style={{
              background: 'rgba(0, 0, 0, 0.85)',
              backdropFilter: 'blur(40px)',
              WebkitBackdropFilter: 'blur(40px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2), inset 0 2px 3px rgba(255, 255, 255, 0.05)'
            }}
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-amber-500 opacity-90" />
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
                    {t('cookie_banner_title')}
                  </h3>
                  <p 
                    id="cookie-banner-description"
                    className="text-sm text-muted-foreground leading-relaxed"
                  >
                    {t('cookie_banner_description')}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={onAcceptAll}
                    className="min-h-[44px] touch-manipulation font-semibold"
                    aria-label={t('cookie_accept_all')}
                  >
                    {t('cookie_accept_all')}
                  </Button>
                  <Button
                    onClick={onRejectAll}
                    variant="outline"
                    className="min-h-[44px] touch-manipulation"
                    aria-label={t('cookie_reject_all')}
                  >
                    {t('cookie_reject_all')}
                  </Button>
                  <Button
                    onClick={onManagePreferences}
                    variant="ghost"
                    className="min-h-[44px] touch-manipulation text-primary hover:text-primary/80"
                    aria-label={t('cookie_manage_preferences')}
                  >
                    {t('cookie_manage_preferences')}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
