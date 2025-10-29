// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
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
 * - z-index above DNA content but below Evolution Scene
 */
export const PreferencesModal: React.FC<PreferencesModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialPreferences = DEFAULT_PREFERENCES,
}) => {
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto z-[65]">
        <DialogHeader>
          <DialogTitle>Gestisci preferenze cookie</DialogTitle>
          <DialogDescription>
            Personalizza le tue preferenze sui cookie. I cookie necessari sono sempre attivi.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Necessary Cookies */}
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-1">
                <Label htmlFor="necessary" className="text-base font-semibold">
                  Cookie necessari
                </Label>
                <p className="text-sm text-muted-foreground">
                  Essenziali per il funzionamento del sito (autenticazione, sessioni, sicurezza). 
                  Sempre attivi.
                </p>
              </div>
              <Switch
                id="necessary"
                checked={preferences.necessary}
                disabled
                aria-label="Cookie necessari sempre attivi"
              />
            </div>
          </div>

          <Separator />

          {/* Analytics Cookies */}
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-1">
                <Label htmlFor="analytics" className="text-base font-semibold">
                  Cookie di analisi
                </Label>
                <p className="text-sm text-muted-foreground">
                  Aiutano a capire come i visitatori interagiscono con il sito, raccogliendo informazioni 
                  anonime su pagine visitate e performance.
                </p>
              </div>
              <Switch
                id="analytics"
                checked={preferences.analytics}
                onCheckedChange={() => togglePreference('analytics')}
                aria-label="Attiva o disattiva cookie di analisi"
              />
            </div>
          </div>

          <Separator />

          {/* Marketing Cookies */}
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-1">
                <Label htmlFor="marketing" className="text-base font-semibold">
                  Cookie di marketing
                </Label>
                <p className="text-sm text-muted-foreground">
                  Utilizzati per mostrare pubblicità personalizzate e misurare l'efficacia delle campagne.
                </p>
              </div>
              <Switch
                id="marketing"
                checked={preferences.marketing}
                onCheckedChange={() => togglePreference('marketing')}
                aria-label="Attiva o disattiva cookie di marketing"
              />
            </div>
          </div>

          <Separator />

          {/* Personalization Cookies */}
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-1">
                <Label htmlFor="personalization" className="text-base font-semibold">
                  Cookie di personalizzazione
                </Label>
                <p className="text-sm text-muted-foreground">
                  Memorizzano preferenze come lingua, layout e altre impostazioni per migliorare l'esperienza.
                </p>
              </div>
              <Switch
                id="personalization"
                checked={preferences.personalization}
                onCheckedChange={() => togglePreference('personalization')}
                aria-label="Attiva o disattiva cookie di personalizzazione"
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
            Salva preferenze
          </Button>
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1 min-h-[44px]"
          >
            Annulla
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
