
import React, { useState } from 'react';
import { X, Smartphone } from 'lucide-react';
import StatusBarSimulator from './StatusBarSimulator';

interface SafeAreaVisualizerProps {
  children: React.ReactNode;
  onClose?: () => void;
}

const SafeAreaVisualizer: React.FC<SafeAreaVisualizerProps> = ({ children, onClose }) => {
  const [variant, setVariant] = useState<'notch' | 'no-notch' | 'dynamic-island'>('dynamic-island');

  return (
    <div className="fixed inset-0 z-[150] bg-black/95 backdrop-blur-lg">
      {/* Controls */}
      <div className="fixed top-4 left-4 right-4 z-[160] flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Smartphone className="w-5 h-5 text-cyan-400" />
          <span className="text-white font-medium">Safe Area Preview</span>
          
          <div className="flex gap-2">
            <button
              onClick={() => setVariant('no-notch')}
              className={`px-3 py-1 rounded text-xs ${
                variant === 'no-notch' 
                  ? 'bg-cyan-400 text-black' 
                  : 'bg-gray-700 text-white hover:bg-gray-600'
              }`}
            >
              No Notch (20pt)
            </button>
            <button
              onClick={() => setVariant('notch')}
              className={`px-3 py-1 rounded text-xs ${
                variant === 'notch' 
                  ? 'bg-cyan-400 text-black' 
                  : 'bg-gray-700 text-white hover:bg-gray-600'
              }`}
            >
              Notch (44pt)
            </button>
            <button
              onClick={() => setVariant('dynamic-island')}
              className={`px-3 py-1 rounded text-xs ${
                variant === 'dynamic-island' 
                  ? 'bg-cyan-400 text-black' 
                  : 'bg-gray-700 text-white hover:bg-gray-600'
              }`}
            >
              Dynamic Island (59pt)
            </button>
          </div>
        </div>
        
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-red-500/20 hover:bg-red-500/30 text-red-400"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* iPhone Frame Simulation */}
      <div className="w-full h-full relative">
        {/* Status Bar Simulator */}
        <StatusBarSimulator variant={variant} />
        
        {/* App Content with Safe Area */}
        <div 
          className="w-full h-full"
          style={{ 
            paddingTop: variant === 'no-notch' ? '20px' : variant === 'notch' ? '44px' : '59px'
          }}
        >
          {children}
        </div>
        
        {/* Safe Area Visual Guide */}
        <div 
          className="absolute left-0 right-0 bg-cyan-400/10 border-b-2 border-cyan-400"
          style={{ 
            top: 0,
            height: variant === 'no-notch' ? '20px' : variant === 'notch' ? '44px' : '59px'
          }}
        >
          <div className="absolute bottom-0 left-4 text-xs text-cyan-400 font-mono">
            Safe Area: {variant === 'no-notch' ? '20pt' : variant === 'notch' ? '44pt' : '59pt'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SafeAreaVisualizer;
