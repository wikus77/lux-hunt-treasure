// © 2025 M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, Settings, Cookie } from 'lucide-react';
import { useLandingTranslations } from '@/hooks/useLandingTranslations';

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
}

const CookieBanner = () => {
  const { t } = useLandingTranslations();
  const [isVisible, setIsVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true, // Always true, can't be disabled
    analytics: false,
    marketing: false,
    functional: false
  });

  useEffect(() => {
    // Check if user has already made a choice - GDPR compliant: show only ONCE
    const cookieConsent = localStorage.getItem('cookie_consent') || localStorage.getItem('m1ssion-cookie-consent');
    
    // Only show if NO consent exists (user never made a choice)
    // Once user accepts/rejects, never show again - GDPR compliant
    if (!cookieConsent) {
      // Show banner after a short delay for better UX
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    const allAccepted: CookiePreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
      functional: true
    };
    
    const today = new Date().toISOString().split('T')[0];
    
    // Use unified storage keys
    localStorage.setItem('cookie_consent', JSON.stringify(allAccepted));
    localStorage.setItem('cookie_banner_last_shown', today);
    localStorage.setItem('m1ssion-cookie-consent', JSON.stringify(allAccepted)); // Backward compatibility
    localStorage.setItem('m1ssion-cookie-timestamp', new Date().toISOString());
    
    setIsVisible(false);
    console.log('🍪 All cookies accepted - GDPR component');
  };

  const handleRejectAll = () => {
    const onlyNecessary: CookiePreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
      functional: false
    };
    
    const today = new Date().toISOString().split('T')[0];
    
    // Use unified storage keys
    localStorage.setItem('cookie_consent', JSON.stringify(onlyNecessary));
    localStorage.setItem('cookie_banner_last_shown', today);
    localStorage.setItem('m1ssion-cookie-consent', JSON.stringify(onlyNecessary)); // Backward compatibility
    localStorage.setItem('m1ssion-cookie-timestamp', new Date().toISOString());
    
    setIsVisible(false);
    console.log('🍪 Only necessary cookies accepted - GDPR component');
  };

  const handleSaveSettings = () => {
    const today = new Date().toISOString().split('T')[0];
    
    // Use unified storage keys
    localStorage.setItem('cookie_consent', JSON.stringify(preferences));
    localStorage.setItem('cookie_banner_last_shown', today);
    localStorage.setItem('m1ssion-cookie-consent', JSON.stringify(preferences)); // Backward compatibility
    localStorage.setItem('m1ssion-cookie-timestamp', new Date().toISOString());
    
    setIsVisible(false);
    setShowSettings(false);
    console.log('🍪 Custom cookie preferences saved - GDPR component:', preferences);
  };

  const togglePreference = (key: keyof CookiePreferences) => {
    if (key === 'necessary') return; // Can't disable necessary cookies
    
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="fixed inset-0 flex items-center justify-center z-[9999] p-4"
          style={{ 
            paddingTop: 'calc(env(safe-area-inset-top, 0px) + 20px)', 
            paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 20px)',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(8px)'
          }}
        >
          <div className="max-w-6xl mx-auto">
            <div className="m1ssion-glass-card p-6">
              {!showSettings ? (
                // Main banner
                <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                  <div className="flex items-start gap-4 flex-1">
                    <Cookie className="w-8 h-8 text-cyan-400 mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-2">
                        {t('gdpr.cookieTitle') || 'Cookie Settings'}
                      </h3>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        {t('gdpr.cookieDescription') || 'We use cookies to enhance your experience, analyze site usage, and assist in our marketing efforts. By clicking "Accept All", you consent to our use of cookies.'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3 lg:ml-4">
                    <Button
                      onClick={() => setShowSettings(true)}
                      variant="outline"
                      className="text-cyan-400 border-cyan-400/50 hover:bg-cyan-400/10 hover:border-cyan-400 transition-all duration-300"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      {t('gdpr.cookieSettings') || 'Cookie Settings'}
                    </Button>
                    
                    <Button
                      onClick={handleRejectAll}
                      variant="outline"
                      className="text-gray-300 border-gray-500/50 hover:bg-gray-500/10 hover:border-gray-400 transition-all duration-300"
                    >
                      {t('gdpr.rejectAll') || 'Reject All'}
                    </Button>
                    
                    <Button
                      onClick={handleAcceptAll}
                      className="bg-gradient-to-r from-cyan-400 to-purple-600 text-black font-bold hover:shadow-[0_0_20px_rgba(0,229,255,0.5)] transition-all duration-300"
                    >
                      {t('gdpr.acceptAll') || 'Accept All'}
                    </Button>
                  </div>
                </div>
              ) : (
                // Settings panel
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white">
                      {t('gdpr.cookiePreferences') || 'Cookie Preferences'}
                    </h3>
                    <button
                      onClick={() => setShowSettings(false)}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                  
                  <div className="space-y-4 mb-6">
                    {[
                      {
                        key: 'necessary' as const,
                        title: t('gdpr.necessaryCookies') || 'Necessary Cookies',
                        description: t('gdpr.necessaryDescription') || 'Essential for the website to function properly. Cannot be disabled.',
                        required: true
                      },
                      {
                        key: 'functional' as const,
                        title: t('gdpr.functionalCookies') || 'Functional Cookies',
                        description: t('gdpr.functionalDescription') || 'Enable enhanced functionality and personalization.',
                        required: false
                      },
                      {
                        key: 'analytics' as const,
                        title: t('gdpr.analyticsCookies') || 'Analytics Cookies',
                        description: t('gdpr.analyticsDescription') || 'Help us understand how visitors interact with the website.',
                        required: false
                      },
                      {
                        key: 'marketing' as const,
                        title: t('gdpr.marketingCookies') || 'Marketing Cookies',
                        description: t('gdpr.marketingDescription') || 'Used to track visitors and display relevant ads.',
                        required: false
                      }
                    ].map((cookie) => (
                      <div key={cookie.key} className="flex items-start justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-white">{cookie.title}</h4>
                            {cookie.required && (
                              <span className="text-xs bg-cyan-400/20 text-cyan-400 px-2 py-1 rounded">
                                {t('gdpr.required') || 'Required'}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-400">{cookie.description}</p>
                        </div>
                        <div className="ml-4">
                          <button
                            onClick={() => togglePreference(cookie.key)}
                            disabled={cookie.required}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              preferences[cookie.key]
                                ? 'bg-cyan-400'
                                : 'bg-gray-600'
                            } ${cookie.required ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                preferences[cookie.key] ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      onClick={handleRejectAll}
                      variant="outline"
                      className="text-gray-300 border-gray-500/50 hover:bg-gray-500/10 hover:border-gray-400 transition-all duration-300"
                    >
                      {t('gdpr.rejectAll') || 'Reject All'}
                    </Button>
                    
                    <Button
                      onClick={handleSaveSettings}
                      className="bg-gradient-to-r from-cyan-400 to-purple-600 text-black font-bold hover:shadow-[0_0_20px_rgba(0,229,255,0.5)] transition-all duration-300 flex-1"
                    >
                      {t('gdpr.saveSettings') || 'Save Settings'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieBanner;