/**
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 * Framer Motion Extended Types
 */

import { Transition as FramerTransition } from 'framer-motion';

declare module 'framer-motion' {
  interface CustomTransition extends FramerTransition {
    ease?: string | number[] | ((t: number) => number) | 'easeIn' | 'easeOut' | 'easeInOut' | 'linear';
  }
}