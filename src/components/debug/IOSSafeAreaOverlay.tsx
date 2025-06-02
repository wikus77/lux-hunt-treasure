
import React from 'react';

interface IOSSafeAreaOverlayProps {
  children: React.ReactNode;
}

const IOSSafeAreaOverlay: React.FC<IOSSafeAreaOverlayProps> = ({ children }) => {
  // Only show in development mode and on Lovable preview
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isLovablePreview = window.location.hostname.includes('lovableproject.com');
  
  if (!isDevelopment && !isLovablePreview) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      {/* iOS Safe Area Visual Overlay - SOLO PER TEST SU LOVABLE */}
      <div className="fixed inset-0 pointer-events-none z-[200]">
        {/* Top Safe Area */}
        <div 
          className="absolute top-0 left-0 right-0 bg-red-500/20 border-b-2 border-red-500"
          style={{ height: '47px' }}
        >
          <div className="text-xs text-red-500 text-center pt-1 font-mono">
            SAFE AREA TOP (47px)
          </div>
        </div>
        
        {/* Bottom Safe Area */}
        <div 
          className="absolute bottom-0 left-0 right-0 bg-red-500/20 border-t-2 border-red-500"
          style={{ height: '34px' }}
        >
          <div className="text-xs text-red-500 text-center pt-1 font-mono">
            SAFE AREA BOTTOM (34px)
          </div>
        </div>
        
        {/* Left Safe Area */}
        <div 
          className="absolute top-0 bottom-0 left-0 bg-yellow-500/10 border-r border-yellow-500"
          style={{ width: '0px' }}
        />
        
        {/* Right Safe Area */}
        <div 
          className="absolute top-0 bottom-0 right-0 bg-yellow-500/10 border-l border-yellow-500"
          style={{ width: '0px' }}
        />
        
        {/* Notch Simulation */}
        <div 
          className="absolute top-0 left-1/2 transform -translate-x-1/2 bg-black rounded-b-2xl"
          style={{ width: '154px', height: '30px' }}
        >
          <div className="text-xs text-gray-400 text-center pt-2 font-mono">
            NOTCH
          </div>
        </div>
      </div>
      
      {/* App Content */}
      {children}
      
      {/* Debug Info */}
      <div className="fixed bottom-4 left-4 bg-black/80 text-white p-2 rounded text-xs font-mono z-[201]">
        📱 iOS Safe Area Test Mode
        <br />
        Top: 47px | Bottom: 34px
        <br />
        🔴 SOLO LOVABLE PREVIEW
      </div>
    </div>
  );
};

export default IOSSafeAreaOverlay;
