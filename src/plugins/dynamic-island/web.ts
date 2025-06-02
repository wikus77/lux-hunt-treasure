
import { WebPlugin } from '@capacitor/core';
import type { DynamicIslandPlugin } from './definitions';

export class DynamicIslandWeb extends WebPlugin implements DynamicIslandPlugin {
  async startActivity(options: {
    type: string;
    data: {
      missionId: string;
      timeLeft: number;
      progress: number;
      status?: string;
    };
  }): Promise<{ success: boolean }> {
    console.log('DynamicIsland startActivity called on web:', options);
    // On web, we don't have Dynamic Island, so just return success
    return { success: true };
  }

  async updateActivity(options: {
    missionId: string;
    timeLeft: number;
    progress: number;
    status?: string;
  }): Promise<{ success: boolean }> {
    console.log('DynamicIsland updateActivity called on web:', options);
    return { success: true };
  }

  async endActivity(options: {
    missionId: string;
  }): Promise<{ success: boolean }> {
    console.log('DynamicIsland endActivity called on web:', options);
    return { success: true };
  }
}
