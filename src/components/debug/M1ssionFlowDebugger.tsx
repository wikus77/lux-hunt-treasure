// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import React from 'react';
import { Button } from '@/components/ui/button';

const M1ssionFlowDebugger: React.FC = () => {
  const resetFullFlow = () => {
    console.log("🔄 DEBUGGER: Resetting complete M1SSION flow for testing");
    
    // Clear all storage
    localStorage.clear();
    sessionStorage.clear();
    
    console.log("✅ RESET COMPLETE FLOW - Testing sequence:");
    console.log("Phase 1: Laser Intro → Phase 2: Landing → Phase 3: Login → Phase 4: Mission Animation → Phase 5: Home");
    
    window.location.href = '/';
  };

  const testLoginFlow = () => {
    console.log("🔄 DEBUGGER: Testing login flow (skipping intro)");
    localStorage.setItem("hasSeenIntro", "true");
    sessionStorage.removeItem("hasSeenPostLoginIntro");
    window.location.href = '/';
  };

  const logCurrentState = () => {
    console.log("🔍 CURRENT STATE DEBUG:");
    console.log("- hasSeenIntro:", localStorage.getItem("hasSeenIntro"));
    console.log("- hasSeenPostLoginIntro:", sessionStorage.getItem("hasSeenPostLoginIntro"));
    console.log("- Current path:", window.location.pathname);
    console.log("- User agent:", navigator.userAgent);
  };

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-black/80 p-4 rounded-lg border border-cyan-400">
      <h3 className="text-cyan-400 text-sm font-bold mb-2">M1SSION™ Flow Debugger</h3>
      <div className="space-y-2">
        <button 
          onClick={resetFullFlow}
          className="w-full text-xs bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded"
        >
          🔄 RESET COMPLETE FLOW
        </button>
        <button 
          onClick={testLoginFlow}
          className="w-full text-xs bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded"
        >
          🔑 Test Login Flow
        </button>
        <button 
          onClick={logCurrentState}
          className="w-full text-xs bg-gray-500 hover:bg-gray-600 text-white px-2 py-1 rounded"
        >
          📊 Log Current State
        </button>
      </div>
    </div>
  );
};

export default M1ssionFlowDebugger;