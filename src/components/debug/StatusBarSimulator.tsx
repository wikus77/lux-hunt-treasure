
import React from 'react';
import { Battery, Wifi, Signal } from 'lucide-react';

interface StatusBarSimulatorProps {
  variant?: 'notch' | 'no-notch' | 'dynamic-island';
  className?: string;
}

const StatusBarSimulator: React.FC<StatusBarSimulatorProps> = ({ 
  variant = 'dynamic-island',
  className = '' 
}) => {
  const getHeight = () => {
    switch (variant) {
      case 'no-notch': return '20px';
      case 'notch': return '44px';
      case 'dynamic-island': return '59px';
      default: return '59px';
    }
  };

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  return (
    <div 
      className={`fixed top-0 left-0 right-0 z-[200] bg-black text-white border-b border-white/20 ${className}`}
      style={{ height: getHeight() }}
    >
      {/* Notch or Dynamic Island */}
      {variant === 'notch' && (
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-40 h-8 bg-black rounded-b-3xl border-b border-gray-800"></div>
      )}
      
      {variant === 'dynamic-island' && (
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-32 h-8 bg-black rounded-full border border-gray-700"></div>
      )}

      {/* Status Bar Content */}
      <div className="flex justify-between items-center px-4 h-full text-white text-sm font-medium">
        {/* Left Side - Time */}
        <div className="flex items-center">
          <span className="text-white font-semibold text-base">
            {getCurrentTime()}
          </span>
        </div>

        {/* Right Side - Status Icons */}
        <div className="flex items-center gap-1">
          {/* Carrier */}
          <span className="text-xs mr-2 font-medium">M1SSION 5G</span>
          
          {/* Signal Bars */}
          <div className="flex items-center gap-0.5 mr-1">
            <div className="w-1 h-1 bg-white rounded-full"></div>
            <div className="w-1 h-1.5 bg-white rounded-full"></div>
            <div className="w-1 h-2 bg-white rounded-full"></div>
            <div className="w-1 h-2.5 bg-white rounded-full"></div>
          </div>
          
          {/* WiFi */}
          <Wifi className="w-4 h-4 mr-1" />
          
          {/* Battery */}
          <div className="flex items-center gap-1">
            <div className="relative">
              <div className="w-6 h-3 border border-white rounded-sm">
                <div className="w-4 h-2 bg-white rounded-sm m-0.5"></div>
              </div>
              <div className="absolute -right-0.5 top-0.5 w-0.5 h-2 bg-white rounded-r"></div>
            </div>
            <span className="text-xs">100%</span>
          </div>
        </div>
      </div>

      {/* Visual indicator for safe area */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-400/50 via-cyan-400 to-cyan-400/50"></div>
    </div>
  );
};

export default StatusBarSimulator;
