
import React, { useState, useEffect } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Wifi, WifiOff } from 'lucide-react';

interface RealtimeStatusIndicatorProps {
  isConnected: boolean;
}

const RealtimeStatusIndicator: React.FC<RealtimeStatusIndicatorProps> = ({ isConnected }) => {
  const [showStatusChange, setShowStatusChange] = useState(false);
  
  // Show status change momentarily when it changes
  useEffect(() => {
    setShowStatusChange(true);
    const timer = setTimeout(() => setShowStatusChange(false), 3000);
    return () => clearTimeout(timer);
  }, [isConnected]);
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger className="cursor-default">
          <div 
            className={`transition-all duration-300 ${
              showStatusChange ? 'opacity-100 scale-100' : 'opacity-40 scale-90'
            }`}
          >
            {isConnected ? (
              <Wifi 
                size={16} 
                className="text-green-400" 
              />
            ) : (
              <WifiOff 
                size={16} 
                className="text-red-400 animate-pulse" 
              />
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>
            {isConnected 
              ? 'Connessione in tempo reale attiva' 
              : 'Connessione in tempo reale non disponibile'}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default RealtimeStatusIndicator;
