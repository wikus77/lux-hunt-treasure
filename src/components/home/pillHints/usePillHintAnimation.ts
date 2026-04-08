import { useReducedMotion } from 'framer-motion';

/** Reference: `.hint-content { transition: opacity 0.7s ease, visibility 0.7s ease }` */
export const HINT_CONTENT_OPACITY_S = 0.7;
/** Reference: `::before { transition: width 0.4s }` */
export const HINT_BEFORE_WIDTH_S = 0.4;
/** Reference: `::after { transition: opacity 0.5s ease }` */
export const HINT_AFTER_OPACITY_S = 0.5;
/** Large pulse disk — not in pasted CSS; short expand/fade for “hint-radius” feel */
export const HINT_RADIUS_S = 0.85;
export const HINT_SWITCH_EXIT_S = 0.25;
export const HINT_CONTENT_EASE: [number, number, number, number] = [0.25, 0.1, 0.25, 1];

export type PillHintAnimationConfig = {
  reduce: boolean;
  /** hint-radius */
  radius: { duration: number; scale: number[]; opacity: number[]; times: number[] };
  /** .hint-content */
  content: { duration: number; ease: [number, number, number, number] };
  /** ::before horizontal line width */
  before: { duration: number; delay: number };
  /** ::after diagonal */
  after: { duration: number; delay: number };
  exit: { duration: number };
};

export function usePillHintAnimation(): PillHintAnimationConfig {
  const reduce = useReducedMotion();

  if (reduce) {
    return {
      reduce: true,
      radius: { duration: 0.1, scale: [1], opacity: [0], times: [0] },
      content: { duration: 0.12, ease: [0, 0, 1, 1] },
      before: { duration: 0.12, delay: 0 },
      after: { duration: 0.12, delay: 0 },
      exit: { duration: 0.12 },
    };
  }

  return {
    reduce: false,
    radius: {
      duration: HINT_RADIUS_S,
      scale: [0, 1.15, 1.35],
      opacity: [0, 0.25, 0],
      times: [0, 0.45, 1],
    },
    content: { duration: HINT_CONTENT_OPACITY_S, ease: HINT_CONTENT_EASE },
    before: { duration: HINT_BEFORE_WIDTH_S, delay: 0.12 },
    after: { duration: HINT_AFTER_OPACITY_S, delay: 0.08 },
    exit: { duration: HINT_SWITCH_EXIT_S },
  };
}
