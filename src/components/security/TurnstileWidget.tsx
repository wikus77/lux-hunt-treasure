
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

  useEffect(() => {
    // Skip turnstile on bypass paths
    if (shouldBypassCaptcha(window.location.pathname)) {
      onVerify('BYPASS_FOR_DEVELOPMENT');
      return;
    }

    // Load Turnstile script if not already loaded
    if (!window.turnstile) {
      const script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);

      script.onload = renderWidget;
    } else {
      renderWidget();
    }

    function renderWidget() {
      if (containerRef.current && window.turnstile) {
        window.turnstile.ready(() => {
          // Reset if a widget already exists
          if (widgetIdRef.current) {
            window.turnstile?.reset(widgetIdRef.current);
          }

          // Render a new widget
          widgetIdRef.current = window.turnstile?.render(containerRef.current!, {
            sitekey: 'YOUR_TURNSTILE_SITE_KEY',
            theme: 'light',
            callback: (token: string) => {
              console.log(`Turnstile verification completed for action: ${action}`);
              onVerify(token);
            },
            'expired-callback': () => {
              console.log('Turnstile token expired, refreshing...');
              window.turnstile?.reset(widgetIdRef.current);
            },
            'error-callback': () => {
              console.error('Turnstile encountered an error');
            }
          });
        });
      }
    }

    return () => {
      // Clean up by resetting the widget when component unmounts
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.reset(widgetIdRef.current);
      }
    };
  }, [onVerify, action]);

  if (shouldBypassCaptcha(window.location.pathname)) {
    return <div className="text-sm text-gray-500 italic">CAPTCHA bypassed for development</div>;
  }

  return <div ref={containerRef} id="turnstile-container" className={className} />;
};

export default TurnstileWidget;
