
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
          className="fixed bottom-4 right-4 z-[140] p-4 rounded-full bg-cyan-500 hover:bg-cyan-600 border-2 border-cyan-300 shadow-lg transition-all duration-300"
          title="Toggle Safe Area Preview"
          style={{ 
            background: 'linear-gradient(45deg, #00D4FF, #0099CC)',
            boxShadow: '0 0 20px rgba(0, 212, 255, 0.5)'
          }}
        >
          {showVisualizer ? (
            <EyeOff className="w-6 h-6 text-white" />
          ) : (
            <Eye className="w-6 h-6 text-white" />
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
