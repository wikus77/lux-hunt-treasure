// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// PWA Update Prompt - Elegant SW update notification

import React, { useState, useEffect } from 'react';
import { RefreshCw, X } from 'lucide-react';

interface UpdatePromptProps {
  /** Optional className for custom styling */
  className?: string;
}

/**
 * UpdatePrompt - Displays elegant banner when SW update is available
 * Listens for M1_SW_UPDATE_AVAILABLE message from Service Worker
 * Opt-in component - does not affect protected components
 */
export const UpdatePrompt: React.FC<UpdatePromptProps> = ({ className = '' }) => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [version, setVersion] = useState<string>('');

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'M1_SW_UPDATE_AVAILABLE') {
        console.log('[UpdatePrompt] 🔄 Update available:', event.data.version);
        setVersion(event.data.version || '');
        setShowPrompt(true);
      }
    };

    navigator.serviceWorker.addEventListener('message', handleMessage);

    return () => {
      navigator.serviceWorker.removeEventListener('message', handleMessage);
    };
  }, []);

  const handleUpdate = async () => {
    console.log('[UpdatePrompt] 🔄 User triggered update');
    
    if (!('serviceWorker' in navigator)) return;

    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration && registration.waiting) {
        // Tell waiting SW to skip waiting and activate
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        
        // Wait for controller change, then reload
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          console.log('[UpdatePrompt] ✅ New SW active, reloading...');
          window.location.reload();
        }, { once: true });
      }
    } catch (error) {
      console.error('[UpdatePrompt] ❌ Update failed:', error);
    }
  };

  const handleDismiss = () => {
    console.log('[UpdatePrompt] ⏭️ User dismissed update');
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div 
      className={`fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-96 z-[9999] animate-in slide-in-from-bottom-5 ${className}`}
      role="alert"
      aria-live="polite"
    >
      <div className="backdrop-glass-dark rounded-2xl shadow-soft-lg border border-white/10 p-4">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--primary-glow))] flex items-center justify-center flex-shrink-0 shadow-soft">
            <RefreshCw className="w-5 h-5 text-white" />
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-white text-sm mb-1">
              Nuova versione disponibile
            </h3>
            <p className="text-white/70 text-xs leading-relaxed">
              {version ? `v${version} è pronta. ` : ''}
              Aggiorna ora per le ultime funzionalità e miglioramenti.
            </p>
            
            {/* Actions */}
            <div className="flex gap-2 mt-3">
              <button
                onClick={handleUpdate}
                className="px-4 py-2 bg-white text-black rounded-lg text-xs font-semibold hover:bg-white/90 transition-all haptic-light shadow-soft"
                aria-label="Aggiorna applicazione"
              >
                Aggiorna
              </button>
              <button
                onClick={handleDismiss}
                className="px-4 py-2 bg-white/10 text-white rounded-lg text-xs font-medium hover:bg-white/20 transition-all"
                aria-label="Rimanda aggiornamento"
              >
                Dopo
              </button>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="w-6 h-6 flex items-center justify-center text-white/50 hover:text-white/80 transition-colors flex-shrink-0"
            aria-label="Chiudi notifica"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
