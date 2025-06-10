
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import { useConsentManagement } from '@/hooks/useConsentManagement';

const ConsentBanner = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { updateConsent, hasConsent } = useConsentManagement();

  useEffect(() => {
    // Mostra il banner solo se non c'è ancora consenso per i cookie essenziali
    const hasConsentStored = localStorage.getItem('gdpr_consent_given');
    if (!hasConsentStored) {
      setIsVisible(true);
    }
  }, []);

  const handleAcceptAll = async () => {
    await updateConsent('analytics', true);
    await updateConsent('marketing', true);
    await updateConsent('profiling', true);
    await updateConsent('communications', true);
    
    localStorage.setItem('gdpr_consent_given', 'true');
    localStorage.setItem('gdpr_consent_date', new Date().toISOString());
    setIsVisible(false);
  };

  const handleRejectAll = async () => {
    await updateConsent('analytics', false);
    await updateConsent('marketing', false);
    await updateConsent('profiling', false);
    await updateConsent('communications', false);
    
    localStorage.setItem('gdpr_consent_given', 'essential_only');
    localStorage.setItem('gdpr_consent_date', new Date().toISOString());
    setIsVisible(false);
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-sm border-t border-white/10 p-4 pb-safe">
      <div className="max-w-screen-xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex-1">
            <p className="text-white text-sm md:text-base">
              Questo sito utilizza cookie tecnici e, previo consenso, anche cookie di analisi per migliorare l'esperienza utente. 
              Proseguendo acconsenti all'uso dei cookie.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <Button
              onClick={handleAcceptAll}
              className="bg-gradient-to-r from-[#00E5FF] to-blue-600 hover:opacity-90 text-black font-medium"
              size="sm"
            >
              Accetto
            </Button>
            
            <Button
              onClick={handleRejectAll}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
              size="sm"
            >
              Rifiuto
            </Button>
            
            <Link to="/privacy-policy">
              <Button
                variant="ghost"
                className="text-white hover:bg-white/10"
                size="sm"
              >
                Scopri di più
              </Button>
            </Link>
            
            <Button
              onClick={handleClose}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/10 p-2"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsentBanner;
