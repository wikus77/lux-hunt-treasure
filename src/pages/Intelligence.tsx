// © 2025 Joseph MULÉ – M1SSION™ - ALL RIGHTS RESERVED - NIYVORA KFT
import React, { useState } from 'react';
import UnifiedHeader from '@/components/layout/UnifiedHeader';
import BottomNavigation from '@/components/layout/BottomNavigation';
import { IntelligencePanelLazy } from '@/components/lazy/LazyComponents';

const Intelligence: React.FC = () => {
  const [isIntelligencePanelOpen, setIsIntelligencePanelOpen] = useState(true);
  const currentWeek = 5; // Can be connected to actual week logic later

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <UnifiedHeader />
      
      <main className="flex-1 p-4">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4 text-primary">M1SSION INTELLIGENCE PANEL™</h1>
            <p className="text-muted-foreground mb-6">
              Accesso completo ai moduli di intelligence operativa
            </p>
          </div>
        </div>
      </main>

      {/* Intelligence Panel - Always open */}
      <IntelligencePanelLazy
        isOpen={isIntelligencePanelOpen}
        onClose={() => setIsIntelligencePanelOpen(false)}
        currentWeek={currentWeek}
        finalShotFailed={false}
      />

      <BottomNavigation />
    </div>
  );
};

export default Intelligence;