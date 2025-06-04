
import React, { useState, useEffect } from 'react';

interface SafeAreaToggleProps {
  children: React.ReactNode;
}

const SafeAreaToggle: React.FC<SafeAreaToggleProps> = ({ children }) => {
  const [showSafeArea, setShowSafeArea] = useState(false);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key === 'S') {
        setShowSafeArea(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  return (
    <div className="relative w-full h-full">
      {children}
      {showSafeArea && (
        <div className="fixed inset-0 pointer-events-none z-[9999]">
          {/* Top safe area */}
          <div 
            className="absolute top-0 left-0 right-0 bg-red-500/20 border-b-2 border-red-500"
            style={{ height: 'env(safe-area-inset-top, 44px)' }}
          />
          {/* Bottom safe area */}
          <div 
            className="absolute bottom-0 left-0 right-0 bg-red-500/20 border-t-2 border-red-500"
            style={{ height: 'env(safe-area-inset-bottom, 34px)' }}
          />
          {/* Left safe area */}
          <div 
            className="absolute top-0 bottom-0 left-0 bg-red-500/20 border-r-2 border-red-500"
            style={{ width: 'env(safe-area-inset-left, 0px)' }}
          />
          {/* Right safe area */}
          <div 
            className="absolute top-0 bottom-0 right-0 bg-red-500/20 border-l-2 border-red-500"
            style={{ width: 'env(safe-area-inset-right, 0px)' }}
          />
        </div>
      )}
    </div>
  );
};

export default SafeAreaToggle;
