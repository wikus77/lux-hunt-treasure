
import { registerPlugin } from '@/lib/capacitor-compat';
import type { DynamicIslandPlugin } from './definitions';

const DynamicIsland = registerPlugin();

export * from './definitions';
export { DynamicIsland };
