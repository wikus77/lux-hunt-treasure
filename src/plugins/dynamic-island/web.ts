
import { WebPlugin } from '@capacitor/core';
import type { DynamicIslandPlugin } from './definitions';

export class DynamicIslandWeb extends WebPlugin implements DynamicIslandPlugin {
  async startActivity(): Promise<{ success: boolean }> {
    console.log('Dynamic Island not available on web');
    return { success: false };
  }

  async updateActivity(): Promise<{ success: boolean }> {
    console.log('Dynamic Island not available on web');
    return { success: false };
  }

  async endActivity(): Promise<{ success: boolean }> {
    console.log('Dynamic Island not available on web');
    return { success: false };
  }
}
