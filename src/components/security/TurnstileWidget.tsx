
import React, { useEffect, useRef } from 'react';
import { shouldBypassCaptcha } from '@/utils/turnstile';

interface TurnstileWidgetProps {
  onVerify: (token: string) => void;
  action?: string;
  className?: string;
}

const TurnstileWidget = ({ onVerify, action = 'submit', className = '' }: TurnstileWidgetProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string>('');
  const errorTimerRef = useRef<number | null>(null);

  useEffect(() => {
    // Skip turnstile on bypass paths
    if (shouldBypassCaptcha(window.location.pathname)) {
      onVerify('BYPASS_FOR_DEVELOPMENT');
      return;
    }

    // Set a fallback in case script loading fails
    errorTimerRef.current = window.setTimeout(() => {
      console.warn('Turnstile widget did not load in time, providing bypass token');
      onVerify('BYPASS_DUE_TO_TIMEOUT');
    }, 5000);

    // Load Turnstile script if not already loaded
    if (!window.turnstile) {
      const script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);

      script.onload = renderWidget;
      script.onerror = () => {
        console.warn('Turnstile script failed to load, providing bypass token');
        onVerify('BYPASS_SCRIPT_LOAD_ERROR');
      };
    } else {
      renderWidget();
    }

    function renderWidget() {
      // Clear the fallback timer since the script loaded
      if (errorTimerRef.current) {
        clearTimeout(errorTimerRef.current);
        errorTimerRef.current = null;
      }

      if (containerRef.current && window.turnstile) {
        try {
          window.turnstile.ready(() => {
            // Reset if a widget already exists
            if (widgetIdRef.current) {
              try {
                window.turnstile?.reset(widgetIdRef.current);
              } catch (resetError) {
                console.warn('Error resetting Turnstile widget:', resetError);
              }
            }

            // Render a new widget - pass the container element ID instead of the DOM reference
            const containerId = 'turnstile-container-' + Math.random().toString(36).substring(2, 9);
            containerRef.current!.id = containerId;
            
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
                  } catch (resetError) {
                    console.warn('Error resetting expired Turnstile widget:', resetError);
                    // Provide bypass token on error
                    onVerify('BYPASS_RESET_ERROR');
                  }
                },
                'error-callback': () => {
                  console.warn('Turnstile encountered an error, providing bypass token');
                  onVerify('BYPASS_WIDGET_ERROR');
                }
              });
            } catch (renderError) {
              console.warn('Error rendering Turnstile widget:', renderError);
              onVerify('BYPASS_RENDER_ERROR');
            }
          });
        } catch (turnstileError) {
          console.warn('Error in Turnstile ready function:', turnstileError);
          onVerify('BYPASS_READY_ERROR');
        }
      } else if (!window.turnstile) {
        console.warn('Turnstile not available after script load, providing bypass token');
        onVerify('BYPASS_NOT_AVAILABLE');
      }
    }

    return () => {
      // Clean up by resetting the widget when component unmounts
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.reset(widgetIdRef.current);
        } catch (error) {
          console.warn('Error cleaning up Turnstile widget:', error);
        }
      }
      
      // Clear any pending timers
      if (errorTimerRef.current) {
        clearTimeout(errorTimerRef.current);
      }
    };
  }, [onVerify, action]);

  if (shouldBypassCaptcha(window.location.pathname)) {
    return <div className="text-sm text-gray-500 italic">CAPTCHA bypassed for development</div>;
  }

  return <div ref={containerRef} className={className} />;
};

export default TurnstileWidget;
