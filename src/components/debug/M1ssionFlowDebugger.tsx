// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import React from 'react';
import { Button } from '@/components/ui/button';

const M1ssionFlowDebugger: React.FC = () => {
  const resetIntroFlow = () => {
    console.log("🔄 DEBUGGER: Resetting intro flow for testing");
    localStorage.removeItem("hasSeenIntro");
    sessionStorage.removeItem("hasSeenPostLoginIntro");
    console.log("✅ Phase 1-5 reset complete - Ready for full sequence test");
    window.location.reload();
  };

  const testPostLoginAnimation = () => {
    console.log("🔄 DEBUGGER: Testing post-login animation");
    sessionStorage.removeItem("hasSeenPostLoginIntro");
    window.location.href = '/';
  };

  const runFullTest = () => {
    console.log("🔄 DEBUGGER: Starting full 5-phase test sequence");
    console.log("Phase 1: Laser intro will show on next load");
    console.log("Phase 2: Landing page with 'STARTS ON AUGUST 19' and login buttons");
    console.log("Phase 3: Login/Registration functionality");
    console.log("Phase 4: M1SSION post-login animation");
    console.log("Phase 5: Redirect to /home");
    resetIntroFlow();
  };

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-black/80 p-4 rounded-lg border border-cyan-400">
      <h3 className="text-cyan-400 text-sm font-bold mb-2">M1SSION™ Flow Debugger</h3>
      <div className="space-y-2">
        <Button 
          onClick={runFullTest}
          className="w-full text-xs bg-cyan-500 hover:bg-cyan-600 text-black"
          size="sm"
        >
          Run Full 5-Phase Test
        </Button>
        <Button 
          onClick={resetIntroFlow}
          className="w-full text-xs bg-yellow-500 hover:bg-yellow-600 text-black"
          size="sm"
        >
          Reset Intro Flow
        </Button>
        <Button 
          onClick={testPostLoginAnimation}
          className="w-full text-xs bg-purple-500 hover:bg-purple-600 text-white"
          size="sm"
        >
          Test Post-Login Animation
        </Button>
      </div>
    </div>
  );
};

export default M1ssionFlowDebugger;