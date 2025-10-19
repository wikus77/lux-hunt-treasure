import { useEffect, useState } from 'react';
import { pulseClient } from '@/lib/pulse/pulseClient';
import { Button } from '@/components/ui/button';
import { Zap } from 'lucide-react';

interface GlobalPulseBarProps {
  onPowerBuzzClick?: () => void;
}

const GlobalPulseBar = ({ onPowerBuzzClick }: GlobalPulseBarProps) => {
  const [pulseValue, setPulseValue] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    pulseClient.init();

    const unsubscribe = pulseClient.subscribe((state) => {
      setPulseValue(state.value);
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 300);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const isMaxed = pulseValue >= 100;

  return (
    <div className="w-full max-w-md mx-auto p-4">
      <div className="living-hud-glass p-4 rounded-2xl">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            <h3 className="text-sm font-bold text-foreground">
              The PULSE™
            </h3>
          </div>
          <span className="text-lg font-mono font-bold text-primary">
            {pulseValue}%
          </span>
        </div>

        {/* Progress Bar */}
        <div className="relative h-3 bg-muted rounded-full overflow-hidden">
          <div
            className={`absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-primary/80 transition-all duration-300 ${
              isAnimating ? 'animate-pulse' : ''
            }`}
            style={{ width: `${pulseValue}%` }}
          />
          {isMaxed && (
            <div className="absolute inset-0 bg-primary/20 animate-pulse" />
          )}
        </div>

        {isMaxed && (
          <div className="mt-3 text-center text-xs text-primary font-bold animate-bounce">
            🎯 PULSE MAXED — Energy Unlocked!
          </div>
        )}

        {onPowerBuzzClick && (
          <Button
            variant="outline"
            size="sm"
            className="w-full mt-3 text-xs"
            onClick={onPowerBuzzClick}
          >
            <Zap className="w-3 h-3 mr-1" />
            Power Buzz
          </Button>
        )}
      </div>
    </div>
  );
};

export default GlobalPulseBar;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
