
// M1SSION™ - Safe Area Visualizer Component
import React, { useState } from 'react';
import { SafeAreaToggle } from './SafeAreaToggle';
import { IOSSafeAreaOverlay } from './IOSSafeAreaOverlay';
import { StatusBarSimulator } from './StatusBarSimulator';

interface SafeAreaVisualizerProps {
  showByDefault?: boolean;
  includeStatusBar?: boolean;
}

export const SafeAreaVisualizer: React.FC<SafeAreaVisualizerProps> = ({
  showByDefault = false,
  includeStatusBar = true
}) => {
  const [overlayVisible, setOverlayVisible] = useState(showByDefault);
  const [statusBarVisible, setStatusBarVisible] = useState(includeStatusBar);

  return (
    <>
      {/* Safe Area Overlay */}
      <IOSSafeAreaOverlay visible={overlayVisible}>
        <div>Debug content</div>
      </IOSSafeAreaOverlay>
      
      {/* Status Bar Simulator */}
      {includeStatusBar && (
        <StatusBarSimulator visible={statusBarVisible} />
      )}
      
      {/* Toggle Controls */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2">
        <SafeAreaToggle 
          onToggle={setOverlayVisible} 
          initialVisible={overlayVisible}
        >
          <div>Toggle content</div>
        </SafeAreaToggle>
        
        {includeStatusBar && (
          <button
            onClick={() => setStatusBarVisible(!statusBarVisible)}
            className="px-3 py-1 text-xs bg-black/80 text-white border border-white/20 rounded"
          >
            {statusBarVisible ? 'Hide' : 'Show'} Status Bar
          </button>
        )}
      </div>
    </>
  );
};
