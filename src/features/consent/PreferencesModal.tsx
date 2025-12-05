// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Lock, BarChart3, Megaphone, Settings } from 'lucide-react';
import type { ConsentPreferences } from './types';
import { DEFAULT_PREFERENCES } from './types';

interface PreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (preferences: ConsentPreferences) => void;
  initialPreferences?: ConsentPreferences;
}

/**
 * Cookie Preferences Modal - Granular control
 * 
 * Features:
 * - Individual category toggles
 * - Necessary cookies always enabled (informational)
 * - Accessible, keyboard-navigable
 * - Localized IT/EN via i18next
 * - z-index above DNA content but below Evolution Scene
 */
export const PreferencesModal: React.FC<PreferencesModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialPreferences = DEFAULT_PREFERENCES,
}) => {
  const { t } = useTranslation();
  const [preferences, setPreferences] = useState<ConsentPreferences>(initialPreferences);

  const handleSave = () => {
    onSave(preferences);
    onClose();
  };

  const togglePreference = (key: keyof ConsentPreferences) => {
    if (key === 'necessary') return; // Can't toggle necessary
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-2xl max-h-[90vh] overflow-y-auto z-[65] relative rounded-[24px]"
        style={{
          background: 'rgba(0, 0, 0, 0.05)',
          backdropFilter: 'blur(40px)',
          WebkitBackdropFilter: 'blur(40px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2), inset 0 2px 3px rgba(255, 255, 255, 0.05)'
        }}
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-amber-500 opacity-90" />
        <DialogHeader>
          <DialogTitle>{t('cookie_preferences_title')}</DialogTitle>
          <DialogDescription>
            {t('cookie_preferences_description')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Necessary Cookies */}
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-1">
                <Label htmlFor="necessary" className="text-base font-semibold flex items-center gap-2">
                  <Lock className="w-4 h-4 text-green-400" />
                  {t('cookie_necessary_title')}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {t('cookie_necessary_description')}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <Switch
                  id="necessary"
                  checked={preferences.necessary}
                  disabled
                  aria-label={t('cookie_necessary_always_active')}
                />
                <span className="text-xs text-green-400 font-medium">
                  {t('cookie_necessary_always_active')}
                </span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Analytics Cookies */}
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-1">
                <Label htmlFor="analytics" className="text-base font-semibold flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-purple-400" />
                  {t('cookie_analytics_title')}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {t('cookie_analytics_description')}
                </p>
              </div>
              <Switch
                id="analytics"
                checked={preferences.analytics}
                onCheckedChange={() => togglePreference('analytics')}
                aria-label={t('cookie_analytics_title')}
              />
            </div>
          </div>

          <Separator />

          {/* Marketing Cookies */}
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-1">
                <Label htmlFor="marketing" className="text-base font-semibold flex items-center gap-2">
                  <Megaphone className="w-4 h-4 text-orange-400" />
                  {t('cookie_marketing_title')}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {t('cookie_marketing_description')}
                </p>
              </div>
              <Switch
                id="marketing"
                checked={preferences.marketing}
                onCheckedChange={() => togglePreference('marketing')}
                aria-label={t('cookie_marketing_title')}
              />
            </div>
          </div>

          <Separator />

          {/* Personalization Cookies */}
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-1">
                <Label htmlFor="personalization" className="text-base font-semibold flex items-center gap-2">
                  <Settings className="w-4 h-4 text-blue-400" />
                  {t('cookie_personalization_title')}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {t('cookie_personalization_description')}
                </p>
              </div>
              <Switch
                id="personalization"
                checked={preferences.personalization}
                onCheckedChange={() => togglePreference('personalization')}
                aria-label={t('cookie_personalization_title')}
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
          <Button
            onClick={handleSave}
            className="flex-1 min-h-[44px]"
          >
            {t('cookie_save_preferences')}
          </Button>
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1 min-h-[44px]"
          >
            {t('cookie_cancel')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
