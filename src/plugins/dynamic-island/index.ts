
import { registerPlugin } from '@capacitor/core';
import type { DynamicIslandPlugin } from './definitions';

const DynamicIsland = registerPlugin<DynamicIslandPlugin>('DynamicIsland', {
  web: () => import('./web').then(m => new m.DynamicIslandWeb()),
});

export * from './definitions';
export { DynamicIsland };
