
import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import SafeAreaVisualizer from './SafeAreaVisualizer';

interface SafeAreaToggleProps {
  children: React.ReactNode;
}

const SafeAreaToggle: React.FC<SafeAreaToggleProps> = ({ children }) => {
  const [showVisualizer, setShowVisualizer] = useState(false);

  return (
    <>
      {/* Toggle Button - only show on development/internal preview */}
      {process.env.NODE_ENV === 'development' && (
        <button
          onClick={() => setShowVisualizer(!showVisualizer)}
          className="fixed bottom-4 right-4 z-[140] p-3 rounded-full bg-cyan-400/20 hover:bg-cyan-400/30 border border-cyan-400/50 backdrop-blur-sm"
          title="Toggle Safe Area Preview"
        >
          {showVisualizer ? (
            <EyeOff className="w-5 h-5 text-cyan-400" />
          ) : (
            <Eye className="w-5 h-5 text-cyan-400" />
          )}
        </button>
      )}

      {/* Content */}
      {showVisualizer ? (
        <SafeAreaVisualizer onClose={() => setShowVisualizer(false)}>
          {children}
        </SafeAreaVisualizer>
      ) : (
        children
      )}
    </>
  );
};

export default SafeAreaToggle;
