// © 2025 Joseph MULÉ – CEO di NIYVORA KFT™
// M1SSION™ - BUZZ Button UI Component
import React from 'react';
import { motion } from 'framer-motion';
import { Zap, X } from 'lucide-react';

interface BuzzButtonProps {
  currentPrice: number;
  isBlocked: boolean;
  buzzing: boolean;
  onClick: () => void;
}

export const BuzzButton: React.FC<BuzzButtonProps> = ({
  currentPrice,
  isBlocked,
  buzzing,
  onClick
}) => {
  // 🚨 CRITICAL: Aggressive diagnostic logging
  React.useEffect(() => {
    console.log('🚨 BUZZ BUTTON STATE CHANGE:', {
      currentPrice,
      isBlocked,
      buzzing,
      disabled: isBlocked || buzzing,
      timestamp: new Date().toISOString()
    });
  }, [currentPrice, isBlocked, buzzing]);

  // 🚨 CRITICAL: Log on every render to track state
  console.log('🔄 BUZZ BUTTON RENDER:', {
    currentPrice,
    isBlocked,
    buzzing,
    disabled: isBlocked || buzzing,
    renderTime: new Date().toISOString()
  });

  // 🚨 CRITICAL: Force enable click if stuck
  React.useEffect(() => {
    if (buzzing) {
      console.log('🚨 WARNING: Buzzing state detected for more than 1 second');
      const forceReset = setTimeout(() => {
        console.log('🚨 FORCE RESET: Clearing stuck buzzing state after 1 second');
        // We can't directly call setBuzzing here, but we'll log the issue
        window.dispatchEvent(new CustomEvent('force-buzz-reset'));
      }, 1000);
      
      return () => clearTimeout(forceReset);
    }
  }, [buzzing]);

  return (
    <div 
      className="relative w-48 h-48"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        // 🚨 CRITICAL: Emergency click handler - FORCE EXECUTION
        console.log('🚨 DIV EMERGENCY CLICK DETECTED - FORCING EXECUTION:', { 
          isBlocked, 
          buzzing, 
          currentPrice,
          disabled: isBlocked || buzzing,
          clickTime: new Date().toISOString(),
          target: 'div_wrapper'
        });
        
        // FORCE CALL onClick REGARDLESS OF STATE
        if (onClick && typeof onClick === 'function') {
          console.log('🚨 FORCE EXECUTING onClick FROM DIV');
          onClick();
        }
      }}
    >
      <motion.button
        whileTap={{ scale: 0.97 }}
        disabled={false} // 🚨 FORCE ENABLE - Never disable this button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log('🔘 BUZZ BUTTON CLICKED - FORCED LOGGING', { 
            isBlocked, 
            buzzing, 
            currentPrice,
            disabled: isBlocked || buzzing,
            clickTime: new Date().toISOString(),
            event: 'click_captured'
          });
          
          // Force call onClick even if button appears disabled
          if (onClick && typeof onClick === 'function') {
            console.log('🔘 CALLING onClick FUNCTION NOW');
            onClick();
          } else {
            console.error('🔘 ERROR: onClick is not a function!', typeof onClick);
          }
          
          localStorage.removeItem('buzzEmergencyClicks'); // Clear emergency clicks on successful click
        }}
        className="w-full h-full rounded-full text-lg font-semibold text-white tracking-wide shadow-lg z-20"
        style={{
          background: isBlocked 
            ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' 
            : 'linear-gradient(135deg, #F213A4 0%, #FF4D4D 100%)',
          boxShadow: isBlocked 
            ? '0 0 15px rgba(239, 68, 68, 0.4)' 
            : '0 0 15px rgba(242, 19, 164, 0.4)'
        }}
      >
        {buzzing ? (
          <div className="flex flex-col items-center space-y-3">
            <Zap className="w-12 h-12 text-white" />
            <span className="text-lg font-semibold text-white">BUZZING...</span>
          </div>
        ) : isBlocked ? (
          <div className="flex flex-col items-center space-y-3">
            <X className="w-12 h-12 text-white" />
            <span className="text-lg font-semibold text-white">BLOCCATO</span>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-2">
            <Zap className="w-16 h-16 text-white" />
            <span className="text-3xl font-bold text-white">BUZZ</span>
            <div className="text-sm font-medium bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm text-white">
              €{currentPrice.toFixed(2)}
            </div>
          </div>
        )}
      </motion.button>
    </div>
  );
};