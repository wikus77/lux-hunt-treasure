// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Advanced Lazy Loading Component for Performance Optimization

import React, { Suspense, lazy, ComponentType } from 'react';
import { motion } from 'framer-motion';

interface LazyLoaderProps {
  children: React.ReactNode;
  fallbackComponent?: ComponentType;
  minHeight?: string;
}

const DefaultFallback = () => (
  <div className="flex items-center justify-center min-h-[200px]">
    <motion.div
      className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full"
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    />
  </div>
);

export const LazyLoader: React.FC<LazyLoaderProps> = ({ 
  children, 
  fallbackComponent: FallbackComponent = DefaultFallback,
  minHeight = "200px"
}) => {
  return (
    <Suspense 
      fallback={
        <div style={{ minHeight }}>
          <FallbackComponent />
        </div>
      }
    >
      {children}
    </Suspense>
  );
};

// Helper function to create lazy-loaded components with fallback
export const createLazyComponent = <T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallback?: ComponentType
) => {
  const LazyComponent = lazy(importFn);
  
  return (props: React.ComponentProps<T>) => (
    <LazyLoader fallbackComponent={fallback}>
      <LazyComponent {...props} />
    </LazyLoader>
  );
};

export default LazyLoader;