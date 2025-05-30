
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
    <div className="fixed inset-0 z-[150] bg-black">
      {/* Status Bar Simulator - SEMPRE VISIBILE */}
      <StatusBarSimulator variant={variant} />
      
      {/* Controls */}
      <div className="fixed z-[160] flex justify-between items-center bg-gray-900/95 backdrop-blur-sm border-b border-gray-700" 
           style={{ 
             top: variant === 'no-notch' ? '20px' : variant === 'notch' ? '44px' : '59px',
             left: 0,
             right: 0,
             height: '60px',
             padding: '0 16px'
           }}>
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

      {/* App Content with Safe Area */}
      <div 
        className="w-full h-full overflow-auto"
        style={{ 
          paddingTop: variant === 'no-notch' ? '80px' : variant === 'notch' ? '104px' : '119px'
        }}
      >
        {children}
      </div>
      
      {/* Safe Area Visual Guide */}
      <div 
        className="absolute left-0 right-0 bg-cyan-400/20 border-b-2 border-cyan-400 pointer-events-none"
        style={{ 
          top: 0,
          height: variant === 'no-notch' ? '80px' : variant === 'notch' ? '104px' : '119px'
        }}
      >
        <div className="absolute bottom-2 left-4 text-xs text-cyan-400 font-mono bg-black/50 px-2 py-1 rounded">
          Safe Area: {variant === 'no-notch' ? '20pt' : variant === 'notch' ? '44pt' : '59pt'} + Controls: 60pt
        </div>
      </div>
    </div>
  );
};

export default SafeAreaVisualizer;
