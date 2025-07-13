/*
 * 🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™
 * M1SSION™ Dynamic Island Plugin for iOS Integration
 */

import { registerPlugin } from '@capacitor/core';

export interface DynamicIslandPlugin {
  startMissionActivity(options: {
    missionId: string;
    timeLeft: number;
    progress: number;
    status: string;
  }): Promise<{ success: boolean }>;

  updateMissionActivity(options: {
    missionId: string;
    timeLeft: number;
    progress: number;
    status: string;
  }): Promise<{ success: boolean }>;

  endMissionActivity(options: {
    missionId: string;
  }): Promise<{ success: boolean }>;
}

// Register the plugin for iOS native bridge
const DynamicIsland = registerPlugin<DynamicIslandPlugin>('DynamicIsland', {
  web: () => import('./DynamicIslandPluginWeb').then(m => new m.DynamicIslandWeb()),
});

export { DynamicIsland };

/*
 * 🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™
 */