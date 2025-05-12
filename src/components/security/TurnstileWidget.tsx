
import React, { useEffect, useRef, useState } from 'react';
import { shouldBypassCaptcha } from '@/utils/turnstile';

interface TurnstileWidgetProps {
  onVerify: (token: string) => void;
  action?: string;
  className?: string;
}

const TurnstileWidget = ({ onVerify, action = 'submit', className = '' }: TurnstileWidgetProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    // Skip turnstile on bypass paths
    const shouldBypass = shouldBypassCaptcha(window.location.pathname);
    if (shouldBypass) {
      console.log("Bypassing Turnstile for", window.location.pathname);
      onVerify('BYPASS_FOR_DEVELOPMENT');
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    let loadTimeout: ReturnType<typeof setTimeout>;
    
    // Set a timeout to detect script loading issues
    loadTimeout = setTimeout(() => {
      if (isMounted && isLoading && !window.turnstile) {
        console.warn('Turnstile failed to load in reasonable time, setting bypass');
        setLoadError('Caricamento sicurezza fallito');
        // Auto-verify to prevent blocking UI
        onVerify('TIMEOUT_BYPASS_TOKEN');
        setIsLoading(false);
      }
    }, 5000);

    // Load Turnstile script if not already loaded
    if (!window.turnstile) {
      const script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);

      script.onload = () => {
        if (isMounted) {
          console.log('Turnstile script loaded successfully');
          setIsLoading(false);
          renderWidget();
        }
      };
      
      script.onerror = () => {
        if (isMounted) {
          console.error('Failed to load Turnstile script');
          setLoadError('Errore caricamento sicurezza');
          setIsLoading(false);
          // Auto-verify to prevent blocking UI
          onVerify('ERROR_BYPASS_TOKEN');
        }
      };
    } else {
      console.log('Turnstile already available');
      setIsLoading(false);
      renderWidget();
    }

    function renderWidget() {
      if (!containerRef.current || !window.turnstile) return;
      
      try {
        window.turnstile.ready(() => {
          if (!isMounted) return;
          if (!containerRef.current) return;
          
          // Reset if a widget already exists
          if (widgetIdRef.current) {
            try {
              window.turnstile?.reset(widgetIdRef.current);
            } catch (e) {
              console.warn('Error resetting Turnstile widget:', e);
            }
          }

          // Generate a unique containerId
          const containerId = 'turnstile-container-' + Math.random().toString(36).substring(2, 9);
          containerRef.current.id = containerId;
          
          try {
            widgetIdRef.current = window.turnstile?.render(containerId, {
              sitekey: '0x4AAAAAABcmLn-b1NViurvi',
              theme: 'light',
              callback: (token: string) => {
                console.log(`Turnstile verification completed for action: ${action}`);
                onVerify(token);
              },
              'expired-callback': () => {
                console.log('Turnstile token expired, refreshing...');
                try {
                  window.turnstile?.reset(widgetIdRef.current);
                } catch (e) {
                  console.warn('Error in expired-callback:', e);
                }
              },
              'error-callback': () => {
                console.error('Turnstile encountered an error');
                // Auto-verify to prevent blocking UI
                onVerify('ERROR_CALLBACK_BYPASS_TOKEN');
              }
            });
          } catch (err) {
            console.error('Error rendering Turnstile:', err);
            setLoadError('Errore rendering sicurezza');
            // Auto-verify to prevent blocking UI
            onVerify('RENDER_ERROR_BYPASS_TOKEN');
          }
        });
      } catch (err) {
        console.error('Exception in Turnstile rendering:', err);
        setLoadError('Eccezione caricamento sicurezza');
        // Auto-verify to prevent blocking UI
        onVerify('EXCEPTION_BYPASS_TOKEN');
      }
    }

    return () => {
      isMounted = false;
      clearTimeout(loadTimeout);
      
      // Clean up by resetting the widget when component unmounts
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.reset(widgetIdRef.current);
        } catch (e) {
          console.warn('Error cleaning up Turnstile widget:', e);
        }
      }
    };
  }, [onVerify, action]);

  if (shouldBypassCaptcha(window.location.pathname)) {
    return (
      <div className="text-sm text-gray-500 italic px-4 py-2 bg-gray-100/10 rounded-md">
        Verifica di sicurezza automatica (modalità sviluppo)
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="text-sm text-yellow-400 px-4 py-2 bg-yellow-400/10 rounded-md">
        {loadError} - Continua comunque
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4 animate-pulse">
        <div className="w-6 h-6 border-2 border-t-cyan-400 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mr-2"></div>
        <span className="text-sm text-gray-400">Caricamento verifica sicurezza...</span>
      </div>
    );
  }

  return <div ref={containerRef} className={className} />;
};

export default TurnstileWidget;
