// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT
// Final Shot Button - Floating button for BUZZ map areas

import React from 'react';
import { Button } from '@/components/ui/button';
import { Target, Zap } from 'lucide-react';
import { useLocation } from 'wouter';
import { useBuzzMapLogic } from '@/hooks/useBuzzMapLogic';

interface FinalShotButtonProps {
  mapCenter?: [number, number];
  className?: string;
}

const FinalShotButton: React.FC<FinalShotButtonProps> = ({ 
  mapCenter,
  className 
}) => {
  const [, navigate] = useLocation();
  const { currentWeekAreas } = useBuzzMapLogic();
  
  // Show button only if user has BUZZ areas (indicating paid access)
  const hasActiveBuzzAreas = currentWeekAreas && currentWeekAreas.length > 0;
  
  React.useEffect(() => {
    console.log('💣 Final Shot button mounted!', {
      hasActiveBuzzAreas,
      areasCount: currentWeekAreas?.length || 0,
      mapCenter,
      currentWeekAreas
    });
  }, [hasActiveBuzzAreas, currentWeekAreas?.length, mapCenter, currentWeekAreas]);

  if (!hasActiveBuzzAreas) {
    console.log('❌ Final Shot button hidden - no active BUZZ areas');
    return null;
  }

  const handleFinalShot = () => {
    console.log('🎯 Final Shot button pressed - navigating to Intelligence');
    navigate('/intelligence?tab=finalshotmap');
  };

  return (
    <div 
      className={`fixed left-1/2 transform -translate-x-1/2 ${className || ''}`}
      style={{
        // Ensure proper positioning above bottom navigation and Leaflet map
        bottom: 'calc(env(safe-area-inset-bottom, 0px) + 120px)',
        zIndex: 99999,
        pointerEvents: 'auto'
      }}
    >
      <Button
        onClick={handleFinalShot}
        size="lg"
        className="
          bg-gradient-to-r from-red-600 to-red-700 
          hover:from-red-700 hover:to-red-800
          text-white font-bold px-6 py-3
          rounded-full shadow-2xl
          border-2 border-red-400
          transition-all duration-300
          hover:scale-105 hover:shadow-red-500/50
          animate-pulse
        "
      >
        <Target className="w-5 h-5 mr-2" />
        <span className="text-sm font-extrabold">FINAL SHOT</span>
        <Zap className="w-4 h-4 ml-2" />
      </Button>
    </div>
  );
};

export default FinalShotButton;