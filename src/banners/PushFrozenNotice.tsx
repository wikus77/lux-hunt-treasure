// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
// Push Frozen Notice Banner - Development Only

import React from 'react';
import { AlertTriangle } from 'lucide-react';

const PushFrozenNotice: React.FC = () => {
  // Only show in development AND when explicitly enabled
  if (import.meta.env.PROD || localStorage.getItem('show_dev_banner') !== 'true') {
    return null;
  }

  return (
    <div
      data-push-frozen-banner
      className="fixed top-0 left-0 right-0 z-40 px-4 py-2 text-sm font-medium flex items-center justify-center gap-2 backdrop-blur-xl rounded-b-lg border-b border-[#00D1FF]/30"
      style={{
        background: 'rgba(0, 0, 0, 0.15)',
        color: 'white',
        boxShadow: '0 4px 18px rgba(0, 209, 255, 0.12), inset 0 -1px 0 rgba(0, 209, 255, 0.08)'
      }}
    >
      <AlertTriangle className="w-4 h-4 text-[#00D1FF]" />
      <span>
        ⚠️ Push chain frozen — editing requires label <strong>override-push-guard</strong>
      </span>
      <button 
        onClick={() => {
          const banner = document.querySelector('[data-push-frozen-banner]');
          banner?.parentElement?.removeChild(banner as Node);
        }}
        className="ml-4 underline text-white/80 hover:text-white"
      >
        Dismiss
      </button>
    </div>
  );
};

export default PushFrozenNotice;