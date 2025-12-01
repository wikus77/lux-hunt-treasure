// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import React from 'react';
import MarkerRewardManager from '@/components/admin/MarkerRewardManager';
import UnifiedHeader from '@/components/layout/UnifiedHeader';
import BottomNavigation from '@/components/layout/BottomNavigation';

const MarkerRewardsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <UnifiedHeader />
      <main className="container mx-auto px-4 py-6 pb-24 pt-20">
        <MarkerRewardManager />
      </main>
      <BottomNavigation />
    </div>
  );
};

export default MarkerRewardsPage;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™





