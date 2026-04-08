import React from 'react';
import { motion } from 'framer-motion';
import type { HintCssVariant, HintHorizontal } from './layoutGeometry';
import { HINT_OFFSET_PERP } from './layoutGeometry';
import type { PillHintAnimationConfig } from './usePillHintAnimation';

export type PillHintBoxProps = {
  children: React.ReactNode;
  variant: HintCssVariant;
  horizontal: HintHorizontal;
  contentWidth: number;
  lineColor: string;
  anim: PillHintAnimationConfig;
};

/**
 * `.hint-content` + pseudo lines; `horizontal` mirrors layout when pill is on the right side of the screen.
 */
export const PillHintBox: React.FC<PillHintBoxProps> = ({
  children,
  variant,
  horizontal,
  contentWidth,
  lineColor,
  anim,
}) => {
  const verticalCss: React.CSSProperties =
    variant === 1
      ? {
          top: HINT_OFFSET_PERP,
          left: horizontal === 'east' ? '50%' : undefined,
          right: horizontal === 'west' ? '50%' : undefined,
        }
      : {
          bottom: HINT_OFFSET_PERP,
          left: horizontal === 'east' ? '50%' : undefined,
          right: horizontal === 'west' ? '50%' : undefined,
        };

  const marginCss: React.CSSProperties =
    horizontal === 'east' ? { marginLeft: 56 } : { marginRight: 56 };

  const isEast = horizontal === 'east';

  return (
    <motion.div
      data-pill-info-panel="1"
      role="status"
      className="m1-pill-hint-content"
      style={{
        position: 'absolute',
        width: contentWidth,
        maxWidth: `calc(100vw - ${12 * 2}px)`,
        zIndex: 5,
        padding: '35px 0',
        color: '#fff',
        pointerEvents: 'auto',
        visibility: 'visible',
        ...verticalCss,
        ...marginCss,
      }}
      initial={anim.reduce ? { opacity: 1 } : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={anim.reduce ? { opacity: 0 } : { opacity: 0 }}
      transition={{
        duration: anim.content.duration,
        ease: anim.content.ease,
      }}
    >
      {/* ::before — toward hub */}
      <motion.div
        aria-hidden
        style={{
          position: 'absolute',
          bottom: 29,
          ...(isEast ? { left: 0 } : { right: 0 }),
          height: 1,
          width: 180,
          maxWidth: '100%',
          backgroundColor: lineColor,
          transformOrigin: isEast ? 'left center' : 'right center',
        }}
        initial={anim.reduce ? { scaleX: 1 } : { scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{
          duration: anim.before.duration,
          delay: anim.before.delay,
          ease: 'easeOut',
        }}
      />
      {/* ::after — diagonal toward hub */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          bottom: 29,
          ...(isEast ? { left: 0 } : { right: 0 }),
          transform: isEast ? 'rotate(-225deg)' : 'rotate(225deg)',
          transformOrigin: isEast ? '0 50%' : '100% 50%',
        }}
      >
        <motion.div
          style={{
            width: 80,
            height: 1,
            backgroundColor: lineColor,
          }}
          initial={anim.reduce ? { opacity: 1 } : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: anim.after.duration,
            delay: anim.after.delay,
            ease: 'ease',
          }}
        />
      </div>
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          fontSize: 15,
          lineHeight: 1.5,
          fontWeight: 500,
          WebkitFontSmoothing: 'antialiased',
        }}
      >
        {children}
      </div>
    </motion.div>
  );
};
