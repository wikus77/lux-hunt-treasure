// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// PageTransition - Optional iOS-style page transitions

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PageTransitionProps {
  children: React.ReactNode;
  variant?: 'fade' | 'push' | 'scale';
  duration?: number;
  className?: string;
}

const variants = {
  fade: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 }
  },
  push: {
    initial: { opacity: 0, x: '100%' },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: '-30%' }
  },
  scale: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 }
  }
};

/**
 * PageTransition - Wraps page content with iOS-style transitions
 * 
 * @example
 * ```tsx
 * <PageTransition variant="fade">
 *   <YourPageContent />
 * </PageTransition>
 * ```
 * 
 * @param variant - Transition style: 'fade' | 'push' | 'scale'
 * @param duration - Animation duration in seconds (default: 0.35)
 * @param className - Additional CSS classes
 */
export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  variant = 'fade',
  duration = 0.35,
  className = ''
}) => {
  const transition = {
    duration,
    ease: [0.22, 0.61, 0.36, 1] as [number, number, number, number] // iOS cubic-bezier
  };

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={variants[variant]}
      transition={transition}
      className={className}
      style={{ willChange: 'transform, opacity' }}
    >
      {children}
    </motion.div>
  );
};

/**
 * PageTransitionGroup - Wraps multiple pages with AnimatePresence
 * Use with routing systems to animate page changes
 * 
 * @example
 * ```tsx
 * <PageTransitionGroup>
 *   <PageTransition key={location.pathname}>
 *     <Routes>
 *       <Route path="/" element={<Home />} />
 *     </Routes>
 *   </PageTransition>
 * </PageTransitionGroup>
 * ```
 */
export const PageTransitionGroup: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  return (
    <AnimatePresence mode="wait" initial={false}>
      {children}
    </AnimatePresence>
  );
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
