// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED
// Scroll to top on route change - Works with wouter

import { useEffect } from 'react';
import { useLocation } from 'wouter';

const ScrollToTop: React.FC = () => {
  const [location] = useLocation();

  useEffect(() => {
    // Smooth scroll to top with fallback
    if ('scrollBehavior' in document.documentElement.style) {
      window.scrollTo({ top: 0, behavior: 'instant' });
    } else {
      window.scrollTo(0, 0);
    }
    
    // Also reset any scrollable containers
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  }, [location]);

  return null;
};

export default ScrollToTop;

