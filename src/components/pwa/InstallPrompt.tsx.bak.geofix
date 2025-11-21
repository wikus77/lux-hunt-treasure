// © 2025 Joseph MULÉ – CEO di NIYVORA KFT™ – M1SSION™
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, X, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Detect iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);
    
    // Check if already installed
    const standalone = window.matchMedia('(display-mode: standalone)').matches || 
                     (window.navigator as any).standalone === true;
    setIsStandalone(standalone);

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show prompt only if not already installed
      if (!standalone) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // For iOS, show manual instructions after delay
    if (iOS && !standalone) {
      const timer = setTimeout(() => {
        const dismissed = localStorage.getItem('ios-install-dismissed');
        if (!dismissed) {
          setShowPrompt(true);
        }
      }, 3000);
      
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setShowPrompt(false);
      }
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    if (isIOS) {
      localStorage.setItem('ios-install-dismissed', 'true');
    }
  };

  // Don't show if already installed
  if (isStandalone || !showPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 animate-fade-in">
      <div className="glass-card p-4 border border-primary/20">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-m1ssion-blue to-m1ssion-pink flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-white" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-white text-sm mb-1">
              Installa M1SSION™
            </h3>
            
            {isIOS ? (
              <p className="text-xs text-gray-300 mb-3">
                Tocca <span className="inline-block w-4 h-4 mx-1 align-middle">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </span> in Safari, poi "Aggiungi alla schermata Home"
              </p>
            ) : (
              <p className="text-xs text-gray-300 mb-3">
                Installa l'app per un'esperienza ottimale
              </p>
            )}

            <div className="flex gap-2">
              {!isIOS && deferredPrompt && (
                <Button
                  onClick={handleInstallClick}
                  size="sm"
                  className="flex-1 bg-gradient-to-r from-m1ssion-blue to-m1ssion-pink text-white"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Installa
                </Button>
              )}
              
              <Button
                onClick={handleDismiss}
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};