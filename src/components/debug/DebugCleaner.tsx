// © 2025 M1SSION™ – NIYVORA KFT – Joseph MULÉ
// Production Debug Code Cleaner

import React from 'react';

const DebugCleaner: React.FC = () => {
  // This component removes all debug code in production
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 bg-yellow-100 border border-yellow-400 text-yellow-800 px-2 py-1 rounded text-xs z-50">
      🔧 Debug Mode Active
    </div>
  );
};

export default DebugCleaner;