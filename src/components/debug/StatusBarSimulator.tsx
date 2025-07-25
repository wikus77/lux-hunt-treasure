
// M1SSION™ - Status Bar Simulator for Development
import React, { useEffect, useState } from 'react';
import { detectCapacitorEnvironment, getDeviceOrientation } from '@/utils/iosCapacitorFunctions';

interface StatusBarSimulatorProps {
  visible?: boolean;
  style?: 'light' | 'dark';
}

export const StatusBarSimulator: React.FC<StatusBarSimulatorProps> = ({
  visible = false,
  style = 'dark'
}) => {
  const [orientation, setOrientation] = useState('portrait');
  const [currentTime, setCurrentTime] = useState(new Date());
  const isCapacitor = detectCapacitorEnvironment();

  useEffect(() => {
    const updateOrientation = () => {
      setOrientation(getDeviceOrientation());
    };

    const updateTime = () => {
      setCurrentTime(new Date());
    };

    // Update orientation
    updateOrientation();
    window.addEventListener('orientationchange', updateOrientation);
    window.addEventListener('resize', updateOrientation);

    // Update time every minute
    const timeInterval = setInterval(updateTime, 60000);

    return () => {
      window.removeEventListener('orientationchange', updateOrientation);
      window.removeEventListener('resize', updateOrientation);
      clearInterval(timeInterval);
    };
  }, []);

  // Only show in web environment for development
  if (!visible || isCapacitor) return null;

  const timeString = currentTime.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: false
  });

  const isLandscape = orientation.includes('landscape');
  const statusBarHeight = isLandscape ? 0 : 44; // No status bar in landscape

  if (statusBarHeight === 0) return null;

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-[9997] flex items-center justify-between px-4 ${
        style === 'dark' ? 'bg-black text-white' : 'bg-white text-black'
      }`}
      style={{ height: `${statusBarHeight}px` }}
    >
      {/* Left side - Time */}
      <div className="text-sm font-medium">
        {timeString}
      </div>

      {/* Center - Carrier/Network */}
      <div className="text-sm">
        M1SSION
      </div>

      {/* Right side - Battery, WiFi, etc. */}
      <div className="flex items-center gap-1 text-sm">
        <div className="flex gap-1">
          {/* WiFi icon */}
          <div className="w-3 h-2 relative">
            <div className="absolute bottom-0 left-0 w-1 h-1 bg-current rounded-full"></div>
            <div className="absolute bottom-0 left-1 w-1 h-1.5 bg-current rounded-full"></div>
            <div className="absolute bottom-0 left-2 w-1 h-2 bg-current rounded-full"></div>
          </div>
          
          {/* Battery icon */}
          <div className="w-6 h-3 border border-current rounded-sm relative">
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0.5 h-1.5 bg-current rounded-r"></div>
            <div className="absolute inset-0.5 bg-current rounded-sm"></div>
          </div>
        </div>
        
        <span className="text-xs">100%</span>
      </div>
    </div>
  );
};
