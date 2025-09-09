// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
// Push Frozen Notice Banner - Development Only

import React from 'react';
import { AlertTriangle } from 'lucide-react';

const PushFrozenNotice: React.FC = () => {
  // Only show in development
  if (import.meta.env.PROD) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500/90 text-yellow-900 px-4 py-2 text-sm font-medium flex items-center justify-center gap-2 backdrop-blur-sm">
      <AlertTriangle className="w-4 h-4" />
      <span>
        ⚠️ Push chain frozen — editing requires label `override-push-guard`
      </span>
      <button 
        onClick={() => {
          const banner = document.querySelector('[data-push-frozen-banner]');
          if (banner) banner.remove();
        }}
        className="ml-4 text-yellow-800 hover:text-yellow-700 underline"
      >
        Dismiss
      </button>
    </div>
  );
};

export default PushFrozenNotice;