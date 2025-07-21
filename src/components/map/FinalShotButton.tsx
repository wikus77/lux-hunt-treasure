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
  const { currentWeekAreas, loading, error } = useBuzzMapLogic();
  
  // Show button only if user has BUZZ areas (indicating paid access)
  const hasActiveBuzzAreas = currentWeekAreas && currentWeekAreas.length > 0;
  
  // 🔥 EMERGENCY FIX: Log every single detail
  console.log('🔥🔥🔥 FINAL SHOT BUTTON DEBUG ULTRA DETAILED:', {
    currentWeekAreas,
    currentWeekAreasLength: currentWeekAreas?.length || 0,
    hasActiveBuzzAreas,
    loading,
    error,
    mapCenter,
    timestamp: new Date().toISOString(),
    areasArrayCheck: Array.isArray(currentWeekAreas),
    areasContent: currentWeekAreas?.map(area => ({ id: area.id, lat: area.lat, lng: area.lng }))
  });
  
  React.useEffect(() => {
    console.log('💣 Final Shot button mounted! FORCE DEBUG', {
      hasActiveBuzzAreas,
      areasCount: currentWeekAreas?.length || 0,
      mapCenter,
      currentWeekAreas,
      buzzLogicLoaded: !!currentWeekAreas,
      timestamp: new Date().toISOString()
    });
  }, [hasActiveBuzzAreas, currentWeekAreas?.length, mapCenter, currentWeekAreas]);

  // FORCE DEBUGGING: Always log component state
  console.log('🔥 FinalShotButton RENDER STATE:', {
    hasActiveBuzzAreas,
    currentWeekAreasLength: currentWeekAreas?.length || 0,
    timestamp: new Date().toISOString()
  });

  if (!hasActiveBuzzAreas) {
    console.log('❌ Final Shot button hidden - no active BUZZ areas', {
      currentWeekAreas,
      hasActiveBuzzAreas,
      areasLength: currentWeekAreas?.length
    });
    return null;
  }

  console.log('✅ Final Shot button will render - areas found!', {
    areasCount: currentWeekAreas.length,
    areas: currentWeekAreas
  });

  const handleFinalShot = () => {
    console.log('🎯 Final Shot button pressed - navigating to Intelligence');
    navigate('/intelligence?tab=finalshotmap');
  };

  return (
    <div 
      className={`fixed left-1/2 transform -translate-x-1/2 ${className || ''}`}
      style={{
        // CRITICAL: Position ABOVE map and bottom navigation for Safari iOS
        bottom: 'calc(env(safe-area-inset-bottom, 0px) + 100px)',
        zIndex: 99999,
        pointerEvents: 'auto',
        // Ensure visibility above Leaflet map container
        position: 'fixed'
      }}
    >
      <Button
        onClick={handleFinalShot}
        size="lg"
        className="
          bg-gradient-to-r from-primary to-primary/90 
          hover:from-primary/90 hover:to-primary
          text-primary-foreground font-bold px-6 py-3
          rounded-full shadow-2xl shadow-primary/50
          border-2 border-primary/60
          transition-all duration-300
          hover:scale-105 hover:shadow-primary/70
          animate-pulse
          glow-pink
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